# Grocery App

## Overview

This is a full-stack grocery application built using **React.js** for the frontend and **Node.js** for the backend. The application follows a three-tier architecture to ensure scalability, availability, and security.

## Architecture Overview

![Architecture Diagram](https://github.com/aws-samples/aws-three-tier-web-architecture-workshop/blob/main/application-code/web-tier/src/assets/3TierArch.png)

In this architecture, a public-facing **Application Load Balancer** forwards client traffic to our **web tier** EC2 instances. The web tier runs **Nginx web servers** that serve the React.js frontend and redirect API calls to the **application tier's** internal-facing load balancer. This internal load balancer then forwards traffic to the application tier, which is built with **Node.js**.

The **application tier** processes requests and manipulates data in an **Aurora MySQL multi-AZ database**. It then returns the requested data to the web tier. Load balancing, health checks, and auto-scaling groups are implemented at each layer to ensure high availability.

## File Structure

### Backend - Application Tier

#### File: `/application-code/app-tier/server.js`

This file contains the backend logic using **Node.js, Express.js, MySQL, and JWT Authentication**.

#### File: `/application-code/app-tier/.env`

Stores environment variables for database credentials and JWT secrets.

### Frontend - Web Tier

#### File: `/application-code/web-tier/src/App.jsx`

This file contains the **React.js** frontend logic for user authentication, grocery list management, and interaction with the backend API.

## Database Schema

The application uses a **MySQL relational database** to store user and grocery list information. Below is the database schema:

```sql
CREATE DATABASE grocery_app;
USE grocery_app;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE grocery_list (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

## Technologies Used

- **Frontend**: React.js, Vite
- **Backend**: Node.js (Express.js)
- **Database**: MySQL (AWS Aurora Multi-AZ)
- **Web Server**: Nginx
- **Load Balancing**: AWS ALB
- **Hosting**: AWS EC2

## Features

- **User Authentication**: Secure login and registration with password hashing.
- **Grocery List Management**: Users can create, update, and delete grocery list items.
- **Responsive UI**: A seamless and intuitive user experience built with React.js.
- **Scalability**: Load balancing and auto-scaling at each layer.

## Running the Application

### Local Development

To test and run the application locally:

1. Clone the repository:
   ```sh
   git clone https://github.com/waafi-adam/INF2006-BigCloud-Group18.git
   ```
2. Install dependencies for both frontend and backend:
   ```sh
   cd application-code/web-tier
   npm install
   cd ../../application-code/app-tier
   npm install
   ```
3. Configure environment variables in `.env` file for the backend.
4. Start the backend and frontend servers:

   ```sh
   # Start backend server
   cd ../../application-code/app-tier
   node server.js

   # Start frontend server
   cd ../../application-code/web-tier
   npm run dev  # This is for local testing only
   ```

5. The application should be running at `http://localhost:3000/`.

### Deployment on AWS (Production)

For deploying this application on AWS, follow this guide which is based on the **same architecture**:
[Deploying a Three-Tier Web Application on AWS](https://www.youtube.com/watch?v=amiIcyt-J2A)

The tutorial uses the repository: [AWS Three-Tier Web Architecture Workshop](https://github.com/aws-samples/aws-three-tier-web-architecture-workshop.git), but since our app follows the same **React.js + Node.js + MySQL** setup and folder structure, the deployment process should be the same.

## Contributing

Feel free to fork this repository, submit pull requests, and contribute to the project!

## License

This project is licensed under the MIT License.
