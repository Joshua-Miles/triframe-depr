import { serve } from 'triframe/scribe'
serve(require.context('./models'), {
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT
})