import { createConnection } from "mysql2";

const connection = createConnection({
	host: "localhost",
	user: "root",
	database: "1x",
	password: "rtb4mnk_",
});

let counterGames = 0;

const games = `SELECT * FROM 21games ORDER BY ID DESC`;

// const showJsonData = (data, game) => {
//   let a = JSON.stringify(
//     data.reduce((acc, el) => {
//       acc[el] = (acc[el] || 0) + 1;
//       return acc;
//     }, {}),
//     null,
//     2
//   );
//   console.log(`${game} ${a}`);
// };

connection.query(games, function (err, res) {
	if (err) console.log(err);
	else {
		let arr = [];
		res.forEach((el) => {
			arr.push(el.ts);
		});
		
		arr.forEach((el, i) => {
			if (arr[i + 1] != undefined) {
				if ((el - arr[i + 1]) / 120 != 1) {
					console.log(el);
					counterGames++;
				}
			}
		});
	}
	if (counterGames === 0) {
		console.log("all games in a row");
		console.log(res.length);
	} else {
		console.log(`${counterGames} games missed`);
	}
});

connection.end();