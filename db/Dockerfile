# db/Dockerfile
FROM postgres:15-alpine

# Copy the initialization script to the special directory
# Postgres will automatically run this on the first startup
COPY init.sql /docker-entrypoint-initdb.d/

# Expose the default PostgreSQL port
EXPOSE 5432
