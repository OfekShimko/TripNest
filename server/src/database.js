"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const pool = mysql2_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: 'q1!w2@e3#r4$t5%',
    database: 'trip_nest',
    port: 3306,
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
