import express, { Request, Response } from 'express';
import { UserService } from './userService';

export const userRouter = express.Router();
const userService = new UserService();

// Get all users
userRouter.get('/', async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Failed to fetch users');
  }
});

// Signup
userRouter.post('/signup', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { userId } = await userService.signup(email, password);
    res.status(201).json({ message: 'User signup successfully', userId });
  } catch (err: any) {
    console.error('Error in signup:', err);
    res.status(400).json({ message: err.message });
  }
});

// Login
userRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { userId } = await userService.login(email, password);
    res.status(200).json({ message: 'Login successful', userId });
  } catch (err: any) {
    console.error('Error in login:', err);
    res.status(401).json({ message: err.message });
  }
});

// Reset Password
userRouter.post('/resetPassword', async (req: Request, res: Response) => {
  const { email, newPassword, confirmPassword } = req.body;

  try {
    await userService.resetPassword(email, newPassword, confirmPassword);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err: any) {
    console.error('Error in resetPassword:', err);
    res.status(400).json({ message: err.message });
  }
});

// Search users
userRouter.get('/search', async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await userService.findUser(email);
    res.status(200).json({ message: user });
  } catch (err: any) {
    console.error('Error in search user: ', err);
    res.status(400).json({ message: err.message });
  }
});