# Backend (Node with TypeScript)

## Suggestion for dir structure 

/server
├── /src
│   ├── /config              # Configuration files (DB, API keys, etc.)
│   │   └── index.ts         # Centralized configuration export
│   ├── /controllers         # Controllers for handling requests
│   │   ├── authController.ts # Auth-specific logic
│   │   └── tripController.ts # Trip-specific logic
│   ├── /models              # Database models (e.g., Sequelize, Prisma)
│   │   ├── userModel.ts     # User schema/model
│   │   ├── tripModel.ts     # Trip schema/model
│   │   └── activityModel.ts # Activity schema/model
│   ├── /middlewares         # Custom middleware (auth, error handling)
│   │   └── authMiddleware.ts # JWT validation, etc.
│   ├── /routes              # Route definitions
│   │   ├── authRoutes.ts    # Auth routes (login, register)
│   │   └── tripRoutes.ts    # Trip routes (create, edit, etc.)
│   ├── /services            # Business logic and database interaction
│   │   ├── authService.ts   # Auth logic and DB queries
│   │   └── tripService.ts   # Trip logic and DB queries
│   ├── /utils               # Utility functions and helpers
│   ├── /types               # Custom TypeScript types
│   ├── app.ts               # Express app instance
│   ├── server.ts            # Server entry point
│   └── database.ts          # DB connection setup
├── tsconfig.json            # TypeScript configuration
└── package.json             # Server dependencies





## Requirements

1. **Node.js** (version 14 or higher)
2. **MySQL** 
3. **npm** 

If you don’t have these installed, please follow the installation steps below.


## Installation Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/TripNest.git
   cd TripNest
   ```

2. **Install dependencies**:
   - Make sure you have **Node.js** installed. You can download it from [here](https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi).
   - Run the following command to install the required dependencies:
   ```bash
   npm install
   ```

3. **Set up the MySQL database**:
   - Make sure MySQL is installed and running. You can download it from [here](https://dev.mysql.com/downloads/installer/).


4. **Configure environment variables**:
   - Get the .env file from Obaca:


5. **Run the server**:
   - Start the server by running:
   ```bash
   npm start
   ```

   The server should now be running on `http://localhost:3000`.

