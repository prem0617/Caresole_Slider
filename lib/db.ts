import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Please provide the DATABASE_URL environment variable");
}

const connectionString = DATABASE_URL;
const sql = postgres(connectionString);

export default sql;
