---
phase: 1
plan: 1
wave: 1
gap_closure: false
---

# Plan 1.1: Core System Foundation Setup

## Objective
This plan establishes the foundational structure of the UniBuddy system, including project setup, basic architecture, authentication module, and database schema. It ensures that the core system is ready for further feature development such as lost & found, chatbot, and facility reporting.

## Context
Load these files for context:
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/server.js
- src/models/
- src/routes/

## Tasks

<task type="auto">
  <name>Initialize Project Structure</name>
  <files>
    package.json
    src/server.js
    src/routes/index.js
  </files>
  <action>
    Set up the project with Node.js and required dependencies.
    
    Steps:
    1. Initialize project using npm init
    2. Install Express and required middleware
    3. Create basic server setup in server.js
    4. Define routing structure
    
    AVOID: Mixing frontend and backend in one file because it reduces maintainability  
    USE: Modular folder structure because it improves scalability  
  </action>
  <verify>
    Run: node src/server.js  
    Check if server starts without errors
  </verify>
  <done>
    Server runs successfully on localhost and responds to test route
  </done>
</task>

<task type="auto">
  <name>Design Database Schema</name>
  <files>
    src/models/user.js
    src/models/item.js
    src/models/complaint.js
  </files>
  <action>
    Create database models for users, lost items, and facility complaints.
    
    Steps:
    1. Define User schema (name, email, password, role)
    2. Define Item schema (title, description, location, status)
    3. Define Complaint schema (issue, location, status, date)
    
    AVOID: Storing unstructured data because it reduces query efficiency  
    USE: Proper relational/structured schema for better performance  
  </action>
  <verify>
    Run database connection and test insertion queries
  </verify>
  <done>
    Data can be successfully inserted and retrieved from all tables
  </done>
</task>

<task type="auto">
  <name>Implement Authentication Module</name>
  <files>
    src/routes/auth.js
    src/controllers/authController.js
  </files>
  <action>
    Develop login and registration functionality.
    
    Steps:
    1. Create registration API
    2. Create login API
    3. Add password validation
    4. Implement session/token handling
    
    AVOID: Storing plain text passwords because it is insecure  
    USE: Password hashing for security  
  </action>
  <verify>
    Test using API calls:
    curl -X POST /register  
    curl -X POST /login  
  </verify>
  <done>
    Users can register and login successfully with proper validation
  </done>
</task>

<task type="auto">
  <name>Basic UI Setup</name>
  <files>
    public/index.html
    public/login.html
    public/styles.css
  </files>
  <action>
    Create basic frontend pages for user interaction.
    
    Steps:
    1. Design homepage layout
    2. Create login and registration forms
    3. Connect frontend with backend APIs
    
    AVOID: Complex UI at initial stage because it slows development  
    USE: Simple responsive layout for faster progress  
  </action>
  <verify>
    Open pages in browser and test form submission
  </verify>
  <done>
    Users can access UI and interact with authentication system
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Backend server is running successfully
- [ ] Database is connected and functional
- [ ] Authentication system works correctly

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] No regressions in tests