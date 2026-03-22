const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "unibuddy"
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("DB Connected");
  }
});

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

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/facility', facilityRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'UniBuddy API Server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
