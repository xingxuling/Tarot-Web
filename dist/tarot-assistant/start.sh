#!/bin/bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
cd ../frontend
python -m http.server 3000
