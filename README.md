# Expense Management System

## Overview

This is a full-stack **Expense Management System** built using **React.js** for the frontend and **Node.js with Express.js** for the backend. The application follows a three-tier architecture to ensure scalability, availability, and security.

## Architecture Overview

![Architecture Diagram](https://github.com/aws-samples/aws-three-tier-web-architecture-workshop/blob/main/application-code/web-tier/src/assets/3TierArch.png)

The system is designed using a three-tier architecture, where:

- The **Web Tier** serves the React frontend.
- The **Application Tier** handles the backend logic with Node.js and Express.js.
- The **Database Tier** stores user and expense data using MySQL.

## File Structure

### Backend - Application Tier

#### File: `/application-code/app-tier/server.js`

Contains the backend logic using **Node.js, Express.js, MySQL, and JWT Authentication**.

#### File: `/application-code/app-tier/.env`

Stores environment variables for database credentials and JWT secrets.

### Frontend - Web Tier

#### File: `/application-code/web-tier/src/App.jsx`

Contains the **React.js** frontend logic for user authentication, expense management, and interaction with the backend API.

## Database Schema

The application uses a **MySQL relational database** to store user, category, and expense information. Below is the database schema:

To set up the database, install MySQL from [MySQL official website](https://dev.mysql.com/downloads/mysql/), then log in as root using the MySQL CLI and execute the following:

```sql
CREATE DATABASE expense_manager;
USE expense_manager;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    user_id INT NOT NULL,
    item VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE report_settings (
    user_id INT PRIMARY KEY,
    enabled BOOLEAN DEFAULT FALSE,
    frequency ENUM('daily', 'weekly', 'monthly') DEFAULT 'weekly',
    email VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Technologies Used

- **Frontend**: React.js, Vite, Material UI
- **Backend**: Node.js (Express.js)
- **Database**: MySQL
- **Web Server**: Nginx
- **Hosting**: AWS EC2

## Features

- **User Authentication**: Secure login and registration with password hashing.
- **Category & Expense Management**: Users can create, update, and delete categories and expenses.
- **Tabbed UI for Categories**: Categories are displayed as tabs for easy navigation.
- **Total Expense Calculation**: Displays total expenses for each category and overall expenses.
- **Scalability**: Load balancing and auto-scaling at each layer.

## Running the Application

### Local Development

To test and run the application locally:

1. Clone the repository:
   ```sh
   git clone https://github.com/waafi-adam/Expense-Management-System.git
   ```
2. Install dependencies for both frontend and backend:
   ```sh
   cd application-code/web-tier
   npm install
   cd ../../application-code/app-tier
   npm install
   ```
3. Configure environment variables in `.env` file for the backend.
4. Install MySQL and log in as root, then execute the provided database schema.
5. Start the backend and frontend servers:

   ```sh
   # Start backend server
   cd ../../application-code/app-tier
   node server.js

   # Start frontend server
   cd ../../application-code/web-tier
   npm run dev
   ```

6. The application should be running at `http://localhost:5173/`.

## Deployment on AWS (Production)

For deploying this application on AWS, follow this guide based on the **React.js + Node.js + MySQL** architecture:
[Deploying a Three-Tier Web Application on AWS](https://www.youtube.com/watch?v=amiIcyt-J2A)

## Contributing

Feel free to fork this repository, submit pull requests, and contribute to the project!

## License

This project is licensed under the MIT License.
