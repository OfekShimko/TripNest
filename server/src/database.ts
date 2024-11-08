import mysql from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';


// Load environment variables from .env file
// Specify the path to the .env file inside the 'src' folder
dotenv.config({ path: path.resolve(__dirname, '../src/trip.env') });

// Debugging: Check if the environment variables are loaded
console.log('Database user:', process.env.DB_USER);
console.log('Database password length:', process.env.DB_PASSWORD?.length);
console.log('Database password:', process.env.DB_PASSWORD);
const pool  = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
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
      } else {
        console.log('Test query result:', results);
      }
  
      // Release the connection back to the pool after the query
      connection.release();
    });
  });
  
  export default pool;