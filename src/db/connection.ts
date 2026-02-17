import mysql from "mysql2/promise";
import { CONSTS } from "../utils/env";

export const pool = mysql.createPool({
  host: CONSTS.MYSQL_HOST,
  user: CONSTS.MYSQL_USER,
  password: CONSTS.MYSQL_PASSWORD,
  database: CONSTS.MYSQL_DATABASE,
  port: CONSTS.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function checkDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database");
    connection.release();
  } catch (error) {
    console.error("❌ Error connecting to MySQL database:", error);
  }
}
