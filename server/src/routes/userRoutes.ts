import mysql from 'mysql2';
import express, { Request, Response, RequestHandler  } from 'express';
import pool from './../database';
import bcrypt from 'bcryptjs';

export const router = express.Router();

// Example of a GET route to retrieve all trips
router.get('/', (req, res) => {
    pool.query('SELECT * FROM users', (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).send('Failed to fetch users');
      }
  
      res.status(200).json(results);
    });
  });

    // USER AUTHENTICATION
// Register Route Handler
const registerHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }
  
    try {
      // Check if user already exists
      const [results]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await pool.promise().query('SELECT * FROM users WHERE username = ?', [username]);
  
      if (results.length > 0) {
        res.status(400).json({ message: 'Username already taken' });
        return;
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert new user into database
      const [result]: [mysql.ResultSetHeader, mysql.FieldPacket[]] = await pool.promise().query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
  
      // Checking if the insertion was successful by accessing the `affectedRows` property
      if (result.affectedRows > 0) {
        res.status(201).json({ message: 'User registered successfully' });
      } else {
        res.status(500).json({ message: 'Error registering user' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Database or server error' });
    }
};
// Register Route
router.post('/register', registerHandler);