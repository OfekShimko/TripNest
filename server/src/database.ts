import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
import { User } from './entities/User'; 
import { Trip } from './entities/Trip'; 
import { TripActivities } from './entities/TripActivities';
import { TripUsers } from './entities/TripUsers';

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
  entities: [User, Trip, TripActivities, TripUsers], // Add the User entity (and others like Trip, etc.)
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