import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  user_id!: number;

  @Column()
  username!: string;

  @Column()
  password!: string;

  // Lifecycle hook to hash the password before saving
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      const saltRounds = 10; // Number of salt rounds
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  @Column()
  email!: string;
}
