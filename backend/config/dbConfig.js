const sql = require('mssql');
require('dotenv').config();

// Connection settings pulled from .env - never hardcode credentials here
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,               // set true if connecting to Azure SQL
    trustServerCertificate: true  // needed for local dev SQL Server
  }
};

// Create ONE connection pool and reuse it everywhere, instead of opening
// a new connection for every request
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(function (pool) {
    console.log('Connected to MSSQL: ' + dbConfig.database);
    return pool;
  })
  .catch(function (err) {
    console.error('Database connection failed:', err);
  });

module.exports = { sql, poolPromise };
