import { Entity, PrimaryGeneratedColumn, Column ,
  BeforeInsert,
  BeforeUpdate,} from 'typeorm';
  import bcrypt from 'bcryptjs';


@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  username!: string;

  @Column({ unique: true })
  email!: string;
  
  @Column()
  email!: string;
  
  @Column()
  password!: string;

  // Lifecycle hook to hash the password before saving
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && !this.password.startsWith('$2a$')) { // Ensure it's not already hashed
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }
}
