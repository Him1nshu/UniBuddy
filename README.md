# UniBuddy – Campus Support System

A full-stack web application that helps university students report lost items, raise facility issues, and get instant campus assistance through a smart chatbot — all managed through a dedicated admin dashboard.

---

## Features

### Student / Normal User
| Feature | Description |
|---|---|
| **Lost & Found** | Report a lost or found item with title, description, category, and an optional photo. The system automatically checks for matching items and sends notifications. |
| **Facility Issues** | Report maintenance problems with a title, room number, category (electrical, plumbing, cleanliness, infrastructure), and severity level (low / medium / high). |
| **Upvoting** | Upvote facility issues to help admins prioritise the most impactful problems. |
| **UniBot Chatbot** | Ask the chatbot for staff room numbers, notice headlines, or general campus queries. |
| **Announcements** | See live site-wide announcements posted by admins pinned to the top of every page. |

### Admin
| Feature | Description |
|---|---|
| **Admin Dashboard** | Accessible only when logged in with an admin account — hidden from regular students. |
| **Manage Lost & Found** | Update the status (open / resolved) or delete any reported item. |
| **Manage Facility Issues** | Update the status (pending / in progress / resolved) or delete any issue. |
| **Post Announcements** | Create global announcements that appear as a banner for all logged-in users. |
| **Chatbot Knowledge Base** | Upload PDF notices — content is extracted and made searchable by the chatbot. |
| **Room & Helpline Info** | Add keyword-to-detail mappings (e.g. "Prof. Smith" → "Room A301") that the chatbot uses to answer student queries. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express 5 |
| **Database** | MySQL 2 (async/promise) |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **File Uploads** | Multer (images & PDFs) |
| **PDF Parsing** | pdf-parse |
| **Email** | Nodemailer |
| **Frontend** | Vanilla HTML, CSS, JavaScript (no framework) |

---

## Getting Started

### Prerequisites
- **Node.js** (v16 or higher recommended)
- **MySQL** server running locally (e.g. via XAMPP, MAMP, or a standalone MySQL install)

### 1 – Database Setup

1. Open your MySQL client (MySQL Workbench, phpMyAdmin, or the `mysql` CLI).
2. Run the initialisation script to create the database and all tables:

   ```sql
   source database/init.sql
   ```

   Or import the file through phpMyAdmin → **Import**.

> **Note:** The server also auto-creates any missing tables on startup, so a fresh `node server.js` on an empty `unibuddy` database is enough for a quick start.

### 2 – Environment Variables

Create a `.env` file in the project root (a sample is shown below). The defaults work for a local MySQL install with no root password.

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=unibuddy
JWT_SECRET=super_secret_unibuddy_key_123
```

### 3 – Install Dependencies

```bash
npm install
```

### 4 – Start the Server

```bash
node server.js
```

You should see:
```
Server listening on port 3000
Database tables and default users verified.
```

### 5 – Open the App

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Default Credentials

Use these accounts to explore both roles without registering:

| Role | Email | Password |
|---|---|---|
| Student | student@unibuddy.com | student123 |
| Admin | admin@unibuddy.com | admin123 |

---

## Project Structure

```
UniBuddy/
├── client/                  # Static frontend (served by Express)
│   ├── index.html           # Single-page application
│   ├── css/style.css        # All styles and component classes
│   └── js/main.js           # Frontend logic
├── routes/                  # Express API route handlers
│   ├── auth.js              # Register & login
│   ├── items.js             # Lost & Found CRUD + auto-matching
│   ├── facility.js          # Facility issues CRUD + upvoting
│   ├── chatbot.js           # Chatbot query logic
│   ├── notifications.js     # User notifications
│   ├── admin.js             # Admin-only actions
│   └── announcements.js     # Global announcements
├── config/db.js             # MySQL connection pool
├── middleware/auth.js       # JWT authentication middleware
├── database/init.sql        # Full database schema
├── uploads/                 # Uploaded images and PDFs
├── server.js                # App entry point and auto-migration
├── package.json
└── .env                     # Environment variables (not committed)
```

---

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register a new student account |
| POST | `/api/auth/login` | — | Log in and receive a JWT |
| GET | `/api/items` | — | List all lost & found items |
| POST | `/api/items` | Student | Report a lost or found item |
| PUT | `/api/items/:id/status` | Admin | Update item status |
| DELETE | `/api/items/:id` | Admin | Delete an item |
| GET | `/api/facility` | Student | List all facility issues |
| POST | `/api/facility` | Student | Report a new facility issue |
| PUT | `/api/facility/:id/status` | Admin | Update issue status |
| DELETE | `/api/facility/:id` | Admin | Delete an issue |
| POST | `/api/facility/:id/upvote` | Student | Toggle upvote on an issue |
| POST | `/api/chatbot` | — | Send a query to UniBot |
| GET | `/api/announcements/active` | — | Get the active announcement |
| POST | `/api/admin/announcements` | Admin | Post a new announcement |
| GET | `/api/admin/announcements` | Admin | List all announcements |
| POST | `/api/admin/upload-notice` | Admin | Upload a PDF to the knowledge base |
| POST | `/api/admin/rooms` | Admin | Add a room / helpline mapping |
| GET | `/api/notifications` | Student | Get user notifications |

---

## Notes

- JWT tokens are stored in `localStorage` and expire after 2 hours.
- The hardcoded admin/student demo accounts bypass database password hashing for convenience.
- Uploaded files are stored in the `uploads/` directory and served as static assets.
- The `FacilityIssues` table gains `category` and `severity` columns automatically via the startup migration in `server.js`, so existing databases do not need to be rebuilt.
