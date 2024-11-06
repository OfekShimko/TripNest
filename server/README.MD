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