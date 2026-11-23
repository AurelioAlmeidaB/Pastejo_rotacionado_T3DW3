const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

pool.on("error", (err) => {
  console.error("Erro na conexão com o banco:", err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
