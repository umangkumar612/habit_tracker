const mysql = require("mysql2/promise");
const { database } = require("./env");

const pool = mysql.createPool({
  host: database.host,
  port: database.port,
  user: database.user,
  password: database.password,
  database: database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z"
});

async function testDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query("SELECT 1");
    console.log("MySQL connected successfully");
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testDatabaseConnection
};