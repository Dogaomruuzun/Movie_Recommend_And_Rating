# MovieRec - Advanced Movie Rental & Recommendation Platform

A full-stack web application for renting movies, tracking watch history, and getting personalized recommendations. Built with **React** and **Node.js**, powered by **MySQL**.

## 🚀 Features

### User Features
-   **Authentication**: Secure Sign Up, Login, and **Profile Management** (Edit Username/Password).
-   **Movie Rentals**: Rent up to **3 movies** at a time. Real-time availability checks.
-   **Watchlist**: maintain a list of movies to watch. Items are automatically removed when you rent/return them.
-   **History & Reviews**: Track watched movies. **Rate and Review** movies you've seen. You can **edit your reviews** at any time.
-   **Smart Interface**: Dark/Light mode, responsive design, and dynamic search/filtering.

### Admin Panel
-   **Dashboard**: Overview of movies, users, and recent activity.
-   **Movie Management**: Add new movies with a full genre selector. Delete movies.
-   **User Management**: Promote users to Admins or demote them.

## 🛠️ Tech Stack

-   **Frontend**: React, React Router, Vite, Axios
-   **Backend**: Node.js, Express, JWT, bcryptjs
-   **Database**: MySQL (using `mysql2`)

## 📦 Local Setup

### 1. Prerequisites
-   Node.js (v18 or higher)
-   MySQL Server installed and running

### 2. Database Setup
1.  Open your MySQL tool (Workbench, Command Line, etc.).
2.  Create a new database (e.g., `movie_app`).
3.  **Import the Database Dump**:
    -   Locate the `server/data/full_backup.sql` file in this repository (if provided) or allow the server to auto-seed (if configured).
    -   *Note: If you have a SQL dump, import it to restore all data.*

### 3. Configuration
1.  Navigate to the `server/` directory.
2.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
3.  Open `.env` and fill in your database credentials:
    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=movie_app
    JWT_SECRET=some_secret_key
    ```

### 4. Installation & Running
From the root directory of the project:

```bash
# Install dependencies for both client and server
npm install

# Start the development server (runs client and server concurrently)
npm run dev
```

-   **Frontend**: http://localhost:5173
-   **Backend**: http://localhost:4000

## 📂 Project Structure
-   `/client`: React frontend application.
-   `/server`: Node.js/Express backend API.
-   `/server/data`: Database SQL scripts and backups.

## 🔑 Default Access
-   The **first registered user** automatically becomes an **Admin**.
-   Subsequent users are standard Users (roles can be updated in the Admin panel).
