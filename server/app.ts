import dotenv from 'dotenv';
dotenv.config({ path: 'trip.env' });

import express from 'express';
import { tripRouter, userRouter } from './src/routes';

import { router as opentripmapRoutes } from './src/routes/opentripmapRoutes'; 
import { AppDataSource } from './src/db/database_init';
import cors from 'cors';
import { config } from './config';

const app = express();

app.use(express.json());

app.use(cors({ origin: 'http://localhost:8000' }));

// Initialize TypeORM connection
AppDataSource.initialize()
  .then(() => {
    console.log('DataSource has been initialized!');
  })
  .catch((err) => {
    console.error('Error during DataSource initialization', err);
  });

// Use the routes

app.use('/api/v1/trips', tripRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/activities', opentripmapRoutes);


// Start the server
app.listen(config.appPort, () => {
  console.log(`Server is running on http://localhost:${config.appPort}`);
});

// Export app as default
export default app;

