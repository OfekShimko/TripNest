import dotenv from 'dotenv'

dotenv.config({ path: './trip.env' });     

export const config = {
    appPort: process.env.APP_PORT || 3000,
    dbHost: process.env.DB_HOST,
    dbPort: Number(process.env.DB_PORT),
    dbUsername: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName:  process.env.DB_NAME,
    opentripApiKey: process.env.OPENTRIPMAP_API_KEY,
    jwtSecret: process.env.JWT_SECRET
}

  