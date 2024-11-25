# Use Node.js as a base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
# EXPOSE 4000

# Command to run the app
CMD [ "npm", "run", "start:dev" ]
