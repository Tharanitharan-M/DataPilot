# Contributing to DataPilot

Thank you for your interest in contributing to DataPilot! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/DataPilot.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit your changes: `git commit -m "Add your feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

Follow the setup instructions in the [README.md](./README.md) file.

## Coding Standards

### Frontend (TypeScript/React)

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Write meaningful component and variable names
- Use functional components with hooks
- Keep components small and focused
- Write tests for new features

### Backend (Python/FastAPI)

- Follow PEP 8 style guide (enforced by Black and Flake8)
- Use type hints for all function parameters and return values
- Write docstrings for all public functions and classes
- Keep functions small and focused
- Write tests for new features

## Commit Messages

- Use clear and descriptive commit messages
- Start with a verb in present tense (e.g., "Add", "Fix", "Update")
- Keep the first line under 50 characters
- Add detailed description if needed

Example:
```
Add user authentication feature

- Implement JWT-based authentication
- Add login and register endpoints
- Create authentication middleware
```

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update documentation for any new features
3. Ensure all tests pass
4. Ensure code is properly formatted
5. Request review from maintainers
6. Address any feedback from reviewers

## Testing

### Frontend
```bash
cd frontend
npm test
```

### Backend
```bash
cd backend
source venv/bin/activate
pytest
```

## Code Review

- Be open to feedback
- Respond to comments in a timely manner
- Make requested changes or discuss alternatives
- Keep pull requests focused on a single feature or fix

## Questions?

If you have questions, please open an issue or reach out to the maintainers.

Thank you for contributing! 🎉

