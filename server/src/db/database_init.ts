import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User'; 
import { Trip } from './entities/Trip'; 
import { TripActivities } from './entities/TripActivities';
import { TripUsers } from './entities/TripUsers';
import mysql from "mysql2/promise";
import { config } from '../../config';


// Initialize the TypeORM DataSource
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.dbHost,
  port: config.dbPort,
  username: config.dbUsername,
  password: config.dbPassword,
  database: config.dbName,
  synchronize: false, // Set to 'true' to create tables, 'false' to skip creation
  logging: true,
  entities: [User, Trip, TripActivities, TripUsers], // Add the User entity (and others like Trip, etc.)
  migrations: [],
  subscribers: [],
});

export const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: config.dbHost ,
      port: config.dbPort,
      user: config.dbUsername,
      password: config.dbPassword,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.dbName}\`;`);
    await connection.end();
    console.log(`Database "${config.dbName}" created.`);
    await AppDataSource.initialize();
  } catch (error) {
    console.error("Error creating database:", error);
    throw error;
  }
};
