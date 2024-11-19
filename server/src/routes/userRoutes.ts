import express, { Request, Response, RequestHandler } from 'express';
import { AppDataSource } from './../database';
import { User } from './../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not defined');
  process.exit(1);
}


const JWT_SECRET = process.env.JWT_SECRET as string; // TypeScript type assertion to ensure it's a string
export const router = express.Router();

// Get all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    console.log(users);
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Failed to fetch users');
  }
});

// Register Route Handler
const registerHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: 'Username, email, and password are required' });
    return;
  }

  try {
    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOneBy({ username });
    const existingEmail = await userRepository.findOneBy({ email });

    if (existingUser || existingEmail) {
      res.status(400).json({ message: existingUser ? 'Username already taken' : 'Email already taken' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepository.create({ username, email, password: hashedPassword });
    await userRepository.save(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in registerHandler:', err);
    res.status(500).json({ message: 'Database or server error' });
  }
};

router.post('/register', registerHandler);

// Login Route Handler
const loginHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ username });

    if (!user) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;

    }

    const token = jwt.sign(
      { userId: user.user_id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Error in loginHandler:', err);
    res.status(500).json({ message: 'Database or server error' });
  }
};


router.post('/login', loginHandler);

// Reset Password Route Handler
const resetPasswordHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, newPassword, confirmPassword } = req.body;


  if (!email || !newPassword || !confirmPassword) {
    res.status(400).json({ message: 'Email, new password, and confirmation password are required' });
    return;
  }


  if (newPassword !== confirmPassword) {
    res.status(400).json({ message: 'Passwords do not match' });
    return;
  }

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });

    if (!user) {

      res.status(400).json({ message: 'No user found with that email' });
      return;
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.update(user.user_id, { password: hashedPassword });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error in resetPasswordHandler:', err);

    res.status(500).json({ message: 'Database or server error' });
  }
};


router.post('/resetPassword', resetPasswordHandler);

