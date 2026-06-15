# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for psycopg2 if needed, then Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/

EXPOSE 5000

# Run with Gunicorn for production
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "src.backend:app"]
