# Use the official Node.js 20 image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy the file that lists your dependencies
COPY Frontend/package.json Frontend/package-lock.json ./

# Install dependencies inside the container
# This step is now cached and only re-runs if package.json changes
RUN npm ci

# Now, copy the rest of your application code
COPY Frontend/ ./

# Expose the port your app will run on
EXPOSE 5173

# Command to run your development server
CMD ["npm", "run", "dev", "--", "--host=0.0.0.0", "--port=5173"]