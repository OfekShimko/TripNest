import express, { Request, Response, RequestHandler } from 'express';
import { AppDataSource } from './../database'; // Import your TypeORM DataSource
import { User } from './../entities/User'; // Import the User entity
import bcrypt from 'bcryptjs';

export const router = express.Router();

// Get all users (using TypeORM repository)
router.get('/', async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find(); // Fetch all users
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Failed to fetch users');
  }
});

// Register Handler (user registration)
const registerHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    const userRepository = AppDataSource.getRepository(User);

    // Check if the username is already taken
    const existingUser = await userRepository.findOneBy({ username });
    if (existingUser) {
      res.status(400).json({ message: 'Username already taken' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user entity and save it
    const newUser = userRepository.create({ username, password: hashedPassword });
    await userRepository.save(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database or server error' });
  }
};

// Register Route
router.post('/register', registerHandler);
