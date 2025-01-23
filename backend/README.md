# Tarot Assistant Backend

This is the backend service for the Tarot Assistant application. It provides:

- User management and authentication
- Tarot card readings and interpretations
- Virtual currency system
- Experience and level tracking
- Multi-language support (English/Chinese)

## Features

- FastAPI-based REST API
- In-memory database for development
- CORS enabled for frontend integration
- Multi-language support
- Virtual currency and experience system

## Getting Started

1. Install dependencies:
```bash
poetry install
```

2. Run the server:
```bash
poetry run uvicorn app.main:app --reload
```

The server will start on http://localhost:8000
