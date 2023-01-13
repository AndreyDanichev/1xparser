const connectionOptions = {
    host: "localhost",
    user: "root",
    database: "1x",
    password: "rtb4mnk_",
}

const connectDataBase = async () => {
    const mysql = await import('mysql2/promise')
    try {
        return await mysql.createConnection(connectionOptions)
    } catch (e) {
        console.log(`connect error - ${e.message}`)
    }
}

const makeQuery = async (query) => {
    try {
        const connection = await connectDataBase()
        const res = await connection.query(query);
        await connection.end();
        return res[0];
    } catch (e) {
        console.log(`make query error - ${e.message}`)
    }
}

export {
    makeQuery
}