# UniBuddy - Campus Support System

Welcome to the UniBuddy project! This is a smart campus support system that includes a Lost & Found mechanism, Facility Issue reporting, an Admin Global Announcements dashboard, and an instant AI chatbot assistant.

## Features - What Can I Do?

As a **Student / Normal User**:
- **Lost & Found:** Report items you've lost or found around campus. You can view all actively reported items.
- **Facilities:** Report any maintenance issues (e.g., Broken AC, plumbing issues) with room numbers and descriptions.
- **Chatbot:** Use the "UniBot Assistance" widget in the bottom right corner for instant help.
- **Global Announcements:** Keep up-to-date with important site-wide announcements posted by administrators at the top of the screen.

As an **Administrator**:
- **Admin Dashboard:** Log in with the admin credentials to access the hidden Admin page from the navigation bar.
- **Post Announcements:** Use the dashboard to create and publish global announcements that all users will see instantly pinned to the top of the site.

## How to Start Up the Project

### 1. Prerequisites
- **Node.js**: Make sure Node.js is installed on your computer.
- **MySQL**: Make sure you have a local MySQL server running (e.g., using XAMPP, MAMP, or normal MySQL).

### 2. Database Setup
The application requires a MySQL database called `unibuddy`.
1. Open your MySQL client (e.g., phpMyAdmin or MySQL Workbench).
2. Create the database and tables by running the provided SQL script. You can import or copy-paste the contents of:
   - `database/init.sql`

*(Note: Ensure your `config/db.js` or `server.js` matches your local MySQL username and password. By default, it expects user `root` with no password).*

### 3. Install Dependencies
Open your terminal in the `UniBuddy` folder and run the following command to install all required Node.js packages:
```bash
npm install
```

### 4. Start the Server
Start up the Node backend server by running:
```bash
node server.js
```
You should see:
> Server listening on port 3000
> DB Connected

### 5. Open the Website
Open your web browser and go to:
[http://localhost:3000](http://localhost:3000)

### Default User Accounts
If you haven't registered your own accounts yet, you can test the roles using the default credentials:

**Student Account:**
- **Email:** student@unibuddy.com
- **Password:** student123

**Admin Account:**
- **Email:** admin@unibuddy.com
- **Password:** admin123
