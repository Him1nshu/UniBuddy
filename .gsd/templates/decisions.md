# DECISIONS.md — Architecture Decision Records

> Purpose: Log significant technical decisions and their rationale.

## Template

## [DECISION-XXX] Title

Date: YYYY-MM-DD  
Status: Proposed | Accepted | Deprecated | Superseded  

### Context
What is the issue we're facing?

### Decision
What have we decided to do?

### Rationale
Why did we make this decision?

### Consequences
What are the trade-offs?

### Alternatives Considered
What other options were evaluated?

---

## Decisions

## [DECISION-001] Web-Based Architecture

Date: 2026-03-22  
Status: Accepted  

### Context
The system must be accessible to all students across different devices without requiring installation.

### Decision
The application will be developed as a web-based system using HTML, CSS, and JavaScript.

### Rationale
Web applications are platform-independent, easy to deploy, and accessible via browsers on mobile and desktop devices.

### Consequences
- Requires continuous internet connectivity
- Limited offline functionality

### Alternatives Considered
- Native Android application
- Desktop-based application

---

## [DECISION-002] Backend Technology Selection

Date: 2026-03-22  
Status: Accepted  

### Context
A backend system is required to handle authentication, data processing, and storage.

### Decision
Use Node.js as the backend with either Firebase or MySQL for database management.

### Rationale
Node.js supports asynchronous operations and handles multiple users efficiently, while Firebase/MySQL provides reliable storage solutions.

### Consequences
- Requires backend development and maintenance
- Additional complexity compared to frontend-only applications

### Alternatives Considered
- PHP backend
- Python frameworks (Django/Flask)

---

## [DECISION-003] Database Choice

Date: 2026-03-22  
Status: Accepted  

### Context
The system needs structured storage for users, lost items, and facility complaints.

### Decision
Use MySQL as the primary database, with Firebase as an alternative option.

### Rationale
MySQL ensures structured relational storage, while Firebase provides real-time updates and easier integration.

### Consequences
- MySQL requires schema design and management
- Firebase may have limitations on free usage

### Alternatives Considered
- MongoDB
- PostgreSQL

---

## [DECISION-004] Chatbot Implementation Approach

Date: 2026-03-22  
Status: Accepted  

### Context
The system includes a chatbot to assist users with common queries.

### Decision
Implement a rule-based or keyword-based chatbot.

### Rationale
A rule-based chatbot is simple to implement, efficient, and sufficient for handling frequently asked campus-related questions.

### Consequences
- Limited ability to understand complex queries
- Requires manual updates for new responses

### Alternatives Considered
- AI-based chatbot using NLP
- Third-party chatbot APIs

---

## [DECISION-005] Facility Reporting Module Design

Date: 2026-03-22  
Status: Accepted  

### Context
Students need a system to report campus issues and track their resolution.

### Decision
Develop a facility reporting module with status tracking (Pending, In Progress, Resolved).

### Rationale
Status tracking improves transparency and allows administrators to efficiently manage complaints.

### Consequences
- Requires active admin monitoring
- Adds complexity to database design

### Alternatives Considered
- Email-based reporting
- Manual complaint system

---

## [DECISION-006] Authentication Mechanism

Date: 2026-03-22  
Status: Accepted  

### Context
Secure access control is required to prevent unauthorized usage of the system.

### Decision
Implement user authentication with login and registration functionality.

### Rationale
Ensures that only authorized users can access the platform and perform actions.

### Consequences
- Requires password management and security measures
- Additional development effort

### Alternatives Considered
- Guest access without login
- Third-party authentication (Google login)

---

## [DECISION-007] Notification System

Date: 2026-03-22  
Status: Accepted  

### Context
Users need to be informed about updates such as matched items and complaint status.

### Decision
Implement an in-app notification system with optional email alerts.

### Rationale
Improves user engagement and ensures timely communication.

### Consequences
- Requires additional backend logic
- Email integration setup needed

### Alternatives Considered
- No notification system
- Manual checking by users

---

## [DECISION-008] Admin Dashboard

Date: 2026-03-22  
Status: Accepted  

### Context
Administrators need a centralized interface to manage users, reports, and system data.

### Decision
Develop a dedicated admin dashboard with role-based access control.

### Rationale
Allows efficient monitoring, validation, and management of system data.

### Consequences
- Additional UI and backend development
- Requires role-based security implementation

### Alternatives Considered
- No admin dashboard
- Direct database access for management

---

Last updated: 22-03-2026