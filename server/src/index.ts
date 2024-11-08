// src/index.ts
// import express from 'express';
// import './database';
import express, { Request, Response, RequestHandler  } from 'express';
import dotenv from 'dotenv';
import pool from './database';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome To TripNest!');
});


// Example of a POST route to insert data into the database
app.post('/trips/add-trip', (req, res) => {
    const { destination, date,  description} = req.body;
    
    const query = 'INSERT INTO trips (destination, date, description) VALUES (?, ?, ?)';
    pool.query(query, [destination, date, description], (err, results) => {
      if (err) {
        console.error('Error inserting trip:', err);
        return res.status(500).send('Failed to insert trip');
      }
  
      res.status(200).send('Trip added successfully');
    });
});


// DELETE route to remove a specific trip by ID
app.delete('/trips/delete-trip-:id', (req: Request, res: Response) => {
    const { id } = req.params;
  
    const query = 'DELETE FROM trips WHERE id = ?';
    pool.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error deleting trip:', err);
        return res.status(500).json({ message: 'Error deleting trip' });
      }
  
      // Cast the result to the correct type and check affectedRows
      const result = results as { affectedRows: number };
      
      // If affectedRows is greater than 0, the trip was deleted
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Trip deleted successfully' });
      } else {
        res.status(404).json({ message: 'Trip not found' });
      }
    });
  });


// Example of a GET route to retrieve all trips
app.get('/trips', (req, res) => {
    pool.query('SELECT * FROM trips', (err, results) => {
      if (err) {
        console.error('Error fetching trips:', err);
        return res.status(500).send('Failed to fetch trips');
      }
  
      res.status(200).json(results);
    });
  });


// Example of a GET route for searching trips based on criteria
app.get('/trips/search', (req: Request, res: Response) => {
    const { destination, date, description } = req.query;
  
    let query = 'SELECT * FROM trips WHERE 1=1';
    const params: any[] = [];
  
    if (destination) {
      query += ' AND destination LIKE ?';
      params.push(`%${destination}%`);
    }
    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }
    if (description) {
      query += ' AND description LIKE ?';
      params.push(`%${description}%`);
    }
  
    pool.query(query, params, (err, results) => {
      if (err) {
        console.error('Error searching trips:', err);
        return res.status(500).send('Failed to search trips');
      }
  
      // Check if the result is an array (this will happen for SELECT queries)
      if (Array.isArray(results) && results.length > 0) {
        res.status(200).json(results);
      } else if (Array.isArray(results) && results.length === 0) {
        res.status(404).json({ message: 'No trips found matching the criteria' });
      } else {
        // If the query doesn't return an array, handle it (this should not happen for SELECT)
        console.error('Unexpected result structure:', results);
        res.status(500).json({ message: 'Error processing search query' });
      }
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
app.post('/users/register', registerHandler);


// Example of a GET route to retrieve all trips
app.get('/users', (req, res) => {
  pool.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Failed to fetch users');
    }

    res.status(200).json(results);
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
 