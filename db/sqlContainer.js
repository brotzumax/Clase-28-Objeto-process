const knex = require('knex');

class ClienteSQL {
    constructor(options, tableName) {
        this.knex = knex(options);
        this.tableName = tableName;
    }

    crearTablaProductos() {
        return this.knex.schema.createTable(this.tableName, table => {
            table.increments('id').primary();
            table.string('title', 50).notNullable();
            table.float('price');
            table.string('thumbnail', 100).notNullable();
        })
            .then(() => console.log("Tabla creada"))
            .catch(err => console.log(err));
    }

    crearTablaMensajes() {
        return this.knex.schema.createTable(this.tableName, table => {
            table.increments('id').primary();
            table.string('text', 300);
            table.string('email', 40).notNullable();
            table.string('date', 40).notNullable();
        })
            .then(() => console.log("Tabla creada"))
            .catch(err => console.log(err));
    }

    insertarElemento(producto) {
        return this.knex(this.tableName).insert(producto)
            .then(() => console.log("Elemento añadido"))
            .catch(err => console.log(err));
    }

    obtenerProductos() {
        let productos = [];
        return this.knex.from(this.tableName).select("*")
            .then(rows => {
                for (let row of rows) {
                    productos.push({ title: row['title'], price: row['price'], thumbnail: row['thumbnail'] });
                }
                return productos;
            })
            .catch(err => console.log(err))
            .finally(() => this.knex.destroy());
    }

    obtenerMensajes() {
        let mensajes = [];
        return this.knex.from(this.tableName).select("*")
            .then(rows => {
                for (let row of rows) {
                    mensajes.push({ text: row['text'], email: row['email'], date: row['date'] });
                }
                return mensajes;
            })
            .catch(err => console.log(err))
            .finally(() => this.knex.destroy());
    }
}

module.exports = { ClienteSQL };