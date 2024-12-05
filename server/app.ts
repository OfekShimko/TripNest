import express from 'express';
import { router as tripRoutes } from './src/routes/trip/tripRouter';
import { router as userRoutes } from './src/routes/userRoutes';

import { router as opentripmapRoutes } from './src/routes/opentripmapRoutes'; 
import { AppDataSource } from './src/db/database_init'; // Import DataSource
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

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

app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/activities', opentripmapRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export app as default
export default app;

