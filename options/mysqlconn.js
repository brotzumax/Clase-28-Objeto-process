require('dotenv').config();

const options = {
    client: process.env.CLIENT,
    connection: {
        host: process.env.HOST,
        user: process.env.USER,
        password: "",
        database: process.env.DATABASE_NAME
    }
}

module.exports = { options };