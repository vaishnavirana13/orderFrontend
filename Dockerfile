# Step 1: Use a base image with Node.js v22
FROM node:22-alpine

# Step 2: Set working directory in the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json (or yarn.lock) to the container
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Expose the React app port (port 5173 for frontend)
EXPOSE 5173

# Step 7: Start the React app with `npm run dev`
CMD ["npm", "run", "dev"]
