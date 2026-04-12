CREATE DATABASE IF NOT EXISTS unibuddy;
USE unibuddy;

CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS LostFoundItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('electronics', 'documents', 'accessories', 'other') NOT NULL,
    type ENUM('lost', 'found') NOT NULL,
    status ENUM('open', 'resolved') DEFAULT 'open',
    image_url VARCHAR(255),
    reported_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS FacilityIssues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    room VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'in_progress', 'resolved') DEFAULT 'pending',
    reported_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS KnowledgeBase (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS RoomInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('room', 'helpline') NOT NULL,
    keyword VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
