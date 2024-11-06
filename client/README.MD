# Frontend (React with TypeScript)

## Suggestion for dir structure 

/client
├── /public                  # Static files (HTML, icons, etc.)
│   └── index.html           # Main HTML template
├── /src
│   ├── /assets              # Images, fonts, stylesheets, etc.
│   ├── /components          # Reusable React components
│   │   └── /common          # Shared components (e.g., buttons, inputs)
│   ├── /pages               # Page-level components (e.g., Login, Home)
│   ├── /features            # Domain-specific components (e.g., Auth, Trip)
│   │   ├── /auth            # Login, Signup, etc.
│   │   └── /trip            # Trip creation, management, etc.
│   ├── /hooks               # Custom React hooks
│   ├── /contexts            # Context API providers for global state
│   ├── /services            # API services (e.g., axios instances, API calls)
│   ├── /store               # State management (e.g., Redux slices)
│   ├── /utils               # Utility functions and helpers
│   ├── App.tsx              # Root component
│   ├── index.tsx            # Entry point
│   └── types.d.ts           # Type definitions
└── package.json             # Client dependencies
