import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "devuser", // or 'postgres' if you didn’t make a new user
  host: "localhost",
  database: "mydb",
  password: "devpass", // match what you set
  port: 5432,
});

export default pool;
