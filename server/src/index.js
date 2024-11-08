"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
// import express from 'express';
// import './database';
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
// Basic route
app.get('/', (req, res) => {
    res.send('Welcome To TripNest!');
});
// Example of a POST route to insert data into the database
app.post('/trips/add-trip', (req, res) => {
    const { destination, date, description } = req.body;
    const query = 'INSERT INTO trips (destination, date, description) VALUES (?, ?, ?)';
    database_1.default.query(query, [destination, date, description], (err, results) => {
        if (err) {
            console.error('Error inserting trip:', err);
            return res.status(500).send('Failed to insert trip');
        }
        res.status(200).send('Trip added successfully');
    });
});
// DELETE route to remove a specific trip by ID
app.delete('/trips/delete-trip-:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM trips WHERE id = ?';
    database_1.default.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting trip:', err);
            return res.status(500).json({ message: 'Error deleting trip' });
        }
        // Cast the result to the correct type and check affectedRows
        const result = results;
        // If affectedRows is greater than 0, the trip was deleted
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Trip deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Trip not found' });
        }
    });
});
// Example of a GET route to retrieve all trips
app.get('/trips', (req, res) => {
    database_1.default.query('SELECT * FROM trips', (err, results) => {
        if (err) {
            console.error('Error fetching trips:', err);
            return res.status(500).send('Failed to fetch trips');
        }
        res.status(200).json(results);
    });
});
// Example of a GET route for searching trips based on criteria
app.get('/trips/search', (req, res) => {
    const { destination, date, description } = req.query;
    let query = 'SELECT * FROM trips WHERE 1=1';
    const params = [];
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
    database_1.default.query(query, params, (err, results) => {
        if (err) {
            console.error('Error searching trips:', err);
            return res.status(500).send('Failed to search trips');
        }
        // Check if the result is an array (this will happen for SELECT queries)
        if (Array.isArray(results) && results.length > 0) {
            res.status(200).json(results);
        }
        else if (Array.isArray(results) && results.length === 0) {
            res.status(404).json({ message: 'No trips found matching the criteria' });
        }
        else {
            // If the query doesn't return an array, handle it (this should not happen for SELECT)
            console.error('Unexpected result structure:', results);
            res.status(500).json({ message: 'Error processing search query' });
        }
    });
});
// USER AUTHENTICATION
// Register Route Handler
const registerHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
    }
    try {
        // Check if user already exists
        const [results] = yield database_1.default.promise().query('SELECT * FROM users WHERE username = ?', [username]);
        if (results.length > 0) {
            res.status(400).json({ message: 'Username already taken' });
            return;
        }
        // Hash the password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Insert new user into database
        const [result] = yield database_1.default.promise().query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        // Checking if the insertion was successful by accessing the `affectedRows` property
        if (result.affectedRows > 0) {
            res.status(201).json({ message: 'User registered successfully' });
        }
        else {
            res.status(500).json({ message: 'Error registering user' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database or server error' });
    }
});
// Register Route
app.post('/users/register', registerHandler);
// Example of a GET route to retrieve all trips
app.get('/users', (req, res) => {
    database_1.default.query('SELECT * FROM users', (err, results) => {
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
