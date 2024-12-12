import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User'; 
import { Trip } from './entities/Trip'; 
import { TripActivities } from './entities/TripActivities';
import { TripUsers } from './entities/TripUsers';
import mysql from "mysql2/promise";


// Initialize the TypeORM DataSource
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // Set to 'true' to create tables, 'false' to skip creation
  logging: true,
  entities: [User, Trip, TripActivities, TripUsers], // Add the User entity (and others like Trip, etc.)
  migrations: [],
  subscribers: [],
});

export const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST ,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.end();
    console.log(`Database "${process.env.DB_NAME}" created.`);
    await AppDataSource.initialize();
  } catch (error) {
    console.error("Error creating database:", error);
    throw error;
  }
};
