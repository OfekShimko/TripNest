"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Specify the path to the .env file inside the 'src' folder
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../src/trip.env') });
const pool = mysql2_1.default.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
});
// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        // If there is an error, log it
        console.error('Error connecting to the database:', err.message);
        return;
    }
    // If successful, log the success message
    console.log('Successfully connected to the database!');
    // Run a simple query to verify the connection
    connection.query('SELECT 1 + 1 AS solution', (queryErr, results) => {
        if (queryErr) {
            console.error('Error running test query:', queryErr.message);
        }
        else {
            console.log('Test query result:', results);
        }
        // Release the connection back to the pool after the query
        connection.release();
    });
});
exports.default = pool;
