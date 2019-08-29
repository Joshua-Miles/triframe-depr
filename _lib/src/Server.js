import "@babel/polyfill"
import Server from "triframe/server";

new Server(require.context('./models'), {
    user: process.env.PG_USER  || 'postgres',
    password: process.env.PG_PASSWORD || 'Twinsen35%',
    database: process.env.PG_DATABASE || 'postgres',
    port: process.env.PG_PORT || 5432 
 })