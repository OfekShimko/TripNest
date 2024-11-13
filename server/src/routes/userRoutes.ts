import mysql from 'mysql2';
import express, { Request, Response, RequestHandler  } from 'express';
import pool from './../database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string; // TypeScript type assertion to ensure it's a string
export const router = express.Router();

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
    const { username, email, password } = req.body;
  
    if (!username || !email || !password) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }
  
    try {
      // Check if user already exists
      const [results]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await pool.promise().query(
        'SELECT * FROM users WHERE username = ? or email = ?',
         [username, email]);
  
      if (results.length > 0) {
        res.status(400).json({ message: 'Username or email already taken' });
        return;
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert new user into database
      const [result]: [mysql.ResultSetHeader, mysql.FieldPacket[]] = await pool.promise().query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
         [username, email, hashedPassword]);
  
      // Checking if the insertion was successful by accessing the `affectedRows` property
      if (result.affectedRows > 0) {
        res.status(201).json({ message: 'User registered successfully' });
      } else {
        res.status(500).json({ message: 'Error registering user' });
      }
    } catch (err) {
      console.error('Error in registerHandler:', err);
      res.status(500).json({ message: 'Database or server error' });
    }
};
// Register Route
router.post('/register', registerHandler);

// Login Route Handler
const loginHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    const [results]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await pool.promise().query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (results.length === 0) {
      res.status(400).json({ message: 'Invalid username or password' });
      return;
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(400).json({ message: 'Invalid username or password' });
      return;
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
       JWT_SECRET, // Secret key to sign the token
      { expiresIn: '1h' }); // Token expiration time

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database or server error' });
  }
};

// Login Route
router.post('/login', loginHandler);

const resetPasswordHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, newPassword, confirmPassword } = req.body;

  // Step 1: Validate that all required fields are provided
  if (!email || !newPassword || !confirmPassword) {
    res.status(400).json({ message: 'Email, new password, and confirmation password are required' });
    return;
  }

  // Step 2: Check if the email exists in the database
  try {
    const [results]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await pool.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (results.length === 0) {
      res.status(400).json({ message: 'No user found with that email' });
      return;
    }

    const user = results[0];

    // Step 3: Compare the new password and confirm password
    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    // Step 4: Hash the new password
    const saltRounds = 10;
    const hashedPassword = await(bcrypt.hash(newPassword, saltRounds));

    // Step 5: Update the password in the database
    await pool.promise().query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    // Step 6: Send response
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database or server error' });
  }
};

// Reset password Route
router.post('/resetPassword', resetPasswordHandler);