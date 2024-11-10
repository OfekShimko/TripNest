import express from 'express';
import { router as tripRoutes } from './tripRoutes';
import { router as userRoutes } from './userRoutes';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Use the routes
app.use('/trips', tripRoutes);
app.use('/users', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
 