import { UserDal } from '../../db/dal';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../db/entities';
import { config } from '../../../config';

export class UserService {
  private userDal = new UserDal();

  public async getAllUsers(): Promise<User[]> {
    return await this.userDal.getAllUsers();
  }

  public async signup(email: string, password: string): Promise<void> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const username = email.split('@')[0];

    const existingUser = await this.userDal.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userDal.createUser({ username, email, password: hashedPassword });
  }

  public async login(email: string, password: string): Promise<{ token: string }> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await this.userDal.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    const JWT_SECRET = config.jwtSecret as string;

    if (!JWT_SECRET) {
      new Error('JWT_SECRET is not defined')
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '1y' }
    );

    return { token };
  }

  public async resetPassword(
    email: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> {
    if (!email || !newPassword || !confirmPassword) {
      throw new Error('Email, new password, and confirmation password are required');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const user = await this.userDal.getUserByEmail(email);
    if (!user) {
      throw new Error('No user found with that email');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userDal.updateUserPassword(user.id, hashedPassword);
  }
}
