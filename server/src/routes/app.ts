import express from 'express';
import { router as tripRoutes } from './tripRoutes';
import { router as userRoutes } from './userRoutes';
import { router as opentripmapRoutes } from './opentripmapRoutes'; // Correct path to your opentripmapRoutes file


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Use the routes
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/activities', opentripmapRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
 