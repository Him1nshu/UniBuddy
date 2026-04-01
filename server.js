const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const pool = require('./config/db');

// Ensure default users exist in the DB so foreign key constraints don't fail
(async () => {
  try {
    await pool.query(`INSERT IGNORE INTO Users (id, name, email, password_hash, role) VALUES 
      (999, 'Admin User', 'admin@unibuddy.com', 'hardcoded', 'admin'),
      (888, 'Student User', 'student@unibuddy.com', 'hardcoded', 'student')
    `);
    console.log("Default users verified.");
  } catch (err) {
    console.error("Error creating default users:", err);
  }
})();

// Ensure uploads directory exists to prevent multer crashes
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'client')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const facilityRoutes = require('./routes/facility');
const chatbotRoutes = require('./routes/chatbot');
const notifRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const announcementsRoutes = require('./routes/announcements');

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/facility', facilityRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/announcements', announcementsRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'UniBuddy API Server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
