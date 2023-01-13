import express from 'express';
import { makeQuery } from './database.js';
import * as queries from './query-list.js';

const app = express();

app.get('/', (req, res) => {
    res.status(401).send({
        message: 'Unauthorized'
    })
})

app.get('/games', async (req, res) => {
    const count = req.query.count
    if (!count || count > 10000) {
        res.status(400).send({
            message: 'Bad request'
        })
    } else {
        const games = await makeQuery(queries.getLastGames(count))
        res.status(200).json(games)
    }
})

const start = (port) => {
    try {
        app.listen(port, () => {
            console.log(`Server started at port ${port}`)
        })
    } catch (e) {
        console.log(`start server fail - ${e.message}`)
    }
}

export {
    start,
}

