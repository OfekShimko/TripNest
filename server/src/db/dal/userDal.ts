import { AppDataSource } from '../database_init';
import { User } from '../entities';

export class UserDal {
  private userRepository = AppDataSource.getRepository(User);

  public async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ email });
  }

  public async createUser(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return await this.userRepository.save(newUser);
  }

  public async updateUserPassword(userId: string, password: string): Promise<void> {
    await this.userRepository.update(userId, { password });
  }
}
