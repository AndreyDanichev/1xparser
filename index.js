import axios from 'axios';
import { makeQuery } from './helpers/database.js';
import * as queries from './helpers/query-list.js';
import { start } from './helpers/server.js';


const twentyOneUrl = 'https://1xbet.com/LiveFeed/Get1x2_VZip'
const gameUrl = 'https://1xbet.com/LiveFeed/GetGameZip'

const twentyOneParams = {
	sports: 146,
	champs: 164350,
	count: 50,
	lng: 'en',
	mode: 4,
	country: 2,
	getEmpty: true,
	noFilterBlockEvent: true
}
const gameParams = {
	lng: 'en',
	cfview: 0,
	isSubGames: true,
	GroupEvents: true,
	allEventsGroupSubGames: true,
	countevents: 250,
	marketType: 1,
	isNewBuilder: true
}

const getGameNumbers = async () => {
	await axios.get(twentyOneUrl,{
		params: twentyOneParams
	}).then(async res => {
		const games = res.data.Value
		const numbers = (await makeQuery(queries.getLastNumbers(10))).map(e => e.num)
		for await (const game of games) {
			if (Object.values(game).includes('TwentyOne Game') && Object.values(game).includes('TwentyOne')) {
				if (!numbers.includes(game.I)) {
					return await makeQuery(queries.addNumber(game.I))
				}
			}
		}
	}).catch(e => {
		console.log(`get numbers error - ${e.message}`)
	})
}

const getGames = async () => {
	try {
		const numbers = (await makeQuery(queries.getLastNumbers(5))).map(e => e.num).sort((a, b) => a - b)
		await Promise.all((numbers).map(async (number) => {
			return await getGameData(number)
		})).then(async res => {
			const games = (await makeQuery(queries.getLastGames(5))).map(e => ({state: e.state, ts: e.ts}))
			const fetchedGames = await res.map(e => e.data.Value)
			for await (const game of fetchedGames) {
				if (game !== null) {
					const gameData = game.SC
					const state = parseInt(gameData.S[2].Value);
					const pc = JSON.parse(gameData.S[0].Value);
					const dc = JSON.parse(gameData.S[1].Value);

					const dataToBeSaved = {
						num: parseInt(game.DI),
						pc: [],
						dc: [],
						pp: 0,
						dp: 0,
						state: 0,
						total: 0,
						r: 0,
						o: 0,
						g: 0,
						pe: 0,
						de: 0,
						ts: parseInt(game.S),
					};

					if (state === 0 && !games.some(e => e.ts === game.S)) {
						dataToBeSaved.pc = '0';
						dataToBeSaved.dc = '0';

						return await makeQuery(queries.addGame(dataToBeSaved))
					}

					if (state === 1 || state === 2) {
						dataToBeSaved.pc = `'${pc.map(e => `${e.CV}_${e.CS}`).join(',')}'`
						dataToBeSaved.dc = `'${dc.map(e => `${e.CV}_${e.CS}`).join(',')}'`

						dataToBeSaved.pp = parseInt(gameData.FS.S1);
						dataToBeSaved.dp = parseInt(gameData.FS.S2);
						dataToBeSaved.state = state;
						dataToBeSaved.total = dataToBeSaved.pp + dataToBeSaved.dp;

						await makeQuery(queries.updateGame(dataToBeSaved)) 
					}

					if (state === 3 || state === 4 || state === 5) {
						dataToBeSaved.pc = `'${pc.map(e => `${e.CV}_${e.CS}`).join(',')}'`
						dataToBeSaved.dc = `'${dc.map(e => `${e.CV}_${e.CS}`).join(',')}'`

						dataToBeSaved.pp = parseInt(gameData.FS.S1);
						dataToBeSaved.dp = parseInt(gameData.FS.S2);
						dataToBeSaved.state = state;
						dataToBeSaved.total = dataToBeSaved.pp + dataToBeSaved.dp;

						dataToBeSaved.r = pc.length === 2 && dc.length === 2 ? 1 : 0;
						dataToBeSaved.pe = dataToBeSaved.pp > 21 ? 1 : 0;
						dataToBeSaved.de = dataToBeSaved.dp > 21 ? 1 : 0;
						dataToBeSaved.o = dataToBeSaved.pp === 21 || dataToBeSaved.dp === 21 ? 1 : 0;
						dataToBeSaved.g = (pc[0].CV == 14 && pc[1].CV == 14) || (dc[0].CV == 14 && dc[1].CV == 14) ? 1 : 0;

						const currentGame = games.filter(e => e.ts === game.S)

						if (!currentGame.length) {
							return await makeQuery(queries.addGame(dataToBeSaved))
						}
						if (currentGame[0].state !== 3 && currentGame[0].state !== 4 && currentGame[0].state !== 5) {
							return await makeQuery(queries.updateGame(dataToBeSaved))
						}
					}
				}
			}
		})
	} catch (e) {
		console.log(`get games error - ${e.message}`)
	}
}

const getGameData = async (gameNumber) => {
	const params = { ...gameParams, id: gameNumber }
	return await axios.get(gameUrl, {
		timeout: 5000,
		params
	})
}

const parseNumbers = () => {
	setTimeout(() => {
		getGameNumbers(),
		parseNumbers()
	},30000)
}

const parseGames = () => {
	setTimeout(() => {
		getGames(),
		parseGames()
	},7000)
}

await makeQuery(queries.createTableNumbers);
await makeQuery(queries.createTableGames);

await start(3000);

parseNumbers();
parseGames();

