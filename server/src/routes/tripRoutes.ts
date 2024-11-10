import express, { Request, Response, RequestHandler  } from 'express';
import pool from '../database';

export const router = express.Router();


// Example of a POST route to insert data into the database
router.post('/add-trip', (req, res) => {
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
router.delete('/delete-trip-:id', (req: Request, res: Response) => {
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
router.get('/', (req, res) => {
  pool.query('SELECT * FROM trips', (err, results) => {
    if (err) {
      console.error('Error fetching trips:', err);
      return res.status(500).send('Failed to fetch trips');
    }

    res.status(200).json(results);
  });
});


// Example of a GET route for searching trips based on criteria
router.get('/search', (req: Request, res: Response) => {
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