import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User'; // You will create this file in the next steps
import { Trip } from './entities/Trip'; // Example: Create a Trip entity
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../src/trip.env') });     

// Initialize the TypeORM DataSource
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false, // automatically synchronize database schema (for development)
  logging: true,
  entities: [User, Trip], // Add the User entity (and others like Trip, etc.)
  migrations: [],
  subscribers: [],
});

// Initialize the connection
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });