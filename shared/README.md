# Shared Code

This directory contains code that is shared between the frontend and backend.

## Usage

You can place shared types, constants, utilities, or schemas here that need to be used by both the frontend and backend.

### Examples

- **TypeScript types/interfaces** - Shared data types
- **API contracts** - Request/response schemas
- **Constants** - Shared configuration values
- **Utilities** - Helper functions used by both frontend and backend

### Structure

```
shared/
├── types/           # Shared TypeScript types
├── constants/       # Shared constants
├── utils/           # Shared utility functions
└── schemas/         # Shared validation schemas
```

## Note

For Python-specific code, consider creating Python equivalents in the backend, or use tools like `pydantic` to generate schemas from TypeScript types or vice versa.

