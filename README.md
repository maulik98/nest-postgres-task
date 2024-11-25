
# Dockerized NestJS Application with PostgreSQL

## Overview
This repository contains a Dockerized NestJS application that uses PostgreSQL as its database. It leverages Docker Compose to orchestrate the services for seamless development and deployment.

---

## Prerequisites
1. Docker and Docker Compose installed on your system.
2. A `.env` file with the necessary environment variables.

## Steps to Run the Application

1. Clone the repository:

2. Create a `.env` file from the `.env.example` and setup with correct values in the root directory using `cp .env.example .env`. Use the `DATABASE_HOST=db`

3. Build and start the Docker containers:
   ```bash
   docker-compose up --build
   ```

4. Run the seeder
   ```
   docker-compose exec backend npm run db:seed
   ```

5. Access the application:
   - **Backend**: [http://localhost:3000](http://localhost:3000)
   - **PostgreSQL**: Available on port 5433

6. To stop the containers:
   ```bash
   docker-compose down
   ```

7. To run the test cases
   ```
   docker-compose exec backend npm run test
   ```

---

## Notes
- The backend application runs on port `3000`.
- The API docs is running at `/docs`.
- PostgreSQL is exposed on port `5433` to avoid conflicts with local instances.
