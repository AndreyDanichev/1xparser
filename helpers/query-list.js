export const createTableGames = `CREATE TABLE IF NOT EXISTS 21games(
    id int primary key auto_increment,
    num int not null,
    pc varchar(255) not null,
    dc varchar(255) not null,
    pp int not null,
    dp int not null,
    state int not null,
    total int not null,
    r int not null,
    o int not null,
    g int not null,
    pe int not null,
    de int not null,
    ts int not null
)`;

export const createTableNumbers = `CREATE TABLE IF NOT EXISTS 21numbers(
    id int primary key auto_increment,
    num int not null
)`;

export const addNumber = (num) => {
    return `INSERT INTO 21numbers (num) VALUES (${num})`
}

export const addGame = (...args) => {
    return `INSERT INTO 21games (num, pc, dc, pp, dp, state, total, r, o, g, pe, de, ts) VALUES (${Object.values(args[0]).join(',')})`
}

export const updateGame = (...args) => {
    return `UPDATE 21games SET ${Object.entries(args[0]).map(e => `${e[0]} = ${e[1]}`).join(', ')} WHERE ts = ${args[0].ts}`
}

export const getLastNumbers = (count) => {
    return `SELECT num FROM 21numbers ORDER BY ID DESC LIMIT ${count}`
};

export const getLastGames = (count) => {
    return `SELECT * FROM 21games ORDER BY ID DESC LIMIT ${count}`
};