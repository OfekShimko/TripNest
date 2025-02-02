import { UserDal } from '../../db/dal';
import bcrypt from 'bcryptjs';
import { User } from '../../db/entities';

export class UserService {
  private userDal = new UserDal();

  public async getAllUsers(): Promise<User[]> {
    return await this.userDal.getAllUsers();
  }

  public async findUser(email: string): Promise<User> {
    if (!email) {
      throw new Error('Email are required');
    }

    const user = await this.userDal.getUserByEmail(email);
    if (!user) {
      throw new Error('User not exists');
    }

    return user;
  }

  public async signup(email: string, password: string): Promise<{userId: string}> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const username = email.split('@')[0];

    const existingUser = await this.userDal.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userDal.createUser({ username, email, password: hashedPassword });
    return { userId: user.id };

  }

  public async login(email: string, password: string): Promise<{ userId: string}> {
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

    return { userId: user.id };
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
