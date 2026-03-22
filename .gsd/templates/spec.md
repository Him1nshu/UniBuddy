# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: No code may be written until this spec is marked `FINALIZED`.

## Vision
UniBuddy is an intelligent campus support system that integrates lost-and-found services, facility issue reporting, chatbot assistance, and campus communication into a single platform. It aims to simplify student life by providing quick access to essential services, improving response times, and enhancing campus management efficiency through a centralized digital solution.

## Goals
1. **Smart Lost & Found System** — Allow students to report and retrieve lost items efficiently through a searchable and structured platform.
2. **Facility Issue Reporting** — Enable users to report campus issues (e.g., broken equipment, cleanliness, infrastructure problems) for quick resolution.
3. **AI-based Chatbot Assistance** — Provide instant responses to student queries related to campus services and guidance.
4. **Centralized Campus Communication** — Deliver announcements and important updates in one place.

## Non-Goals (Out of Scope)
- Real-time GPS tracking of items or users
- Advanced AI/ML-based image recognition system
- Full conversational AI (chatbot will be rule-based or basic NLP)
- Integration with external commercial systems
- Multi-campus deployment (initially single campus only)

## Constraints
- **Technical Constraint** — Implementation using web technologies (HTML, CSS, JavaScript, backend like Node.js / Firebase / MySQL).
- **Business Constraint** — Academic project only, no commercial deployment.
- **Timeline Constraint** — Must be completed within one semester (3–4 months).

## Success Criteria
- [ ] 90% of lost/found items are successfully recorded and searchable
- [ ] Facility complaints are logged and tracked with status updates
- [ ] Chatbot successfully answers at least 70% of common queries
- [ ] System supports 100+ users without performance degradation
- [ ] Admin can efficiently manage reports and user data

## User Stories (Optional)

### As a student
- I want to report a lost item
- So that others can help me find it

### As a student
- I want to report facility issues
- So that campus problems are resolved quickly

### As a student
- I want to interact with a chatbot
- So that I can get instant help without waiting

### As an admin
- I want to verify lost/found entries
- So that the system remains authentic

### As an admin
- I want to monitor facility complaints
- So that I can ensure timely resolution

## Technical Requirements (Optional)

| Requirement | Priority | Notes |
|-------------|----------|-------|
| User Authentication System | Must-have | Secure login and registration |
| Lost & Found Module | Must-have | Item reporting, searching, matching |
| Facility Reporting Module | Must-have | Complaint submission with status tracking |
| Chatbot System | Must-have | Rule-based or simple NLP chatbot |
| Search & Filter System | Must-have | Keyword and category-based search |
| Admin Dashboard | Should-have | Manage users, reports, approvals |
| Notification System | Should-have | Alerts for matches and updates |
| Database Management | Must-have | MySQL / Firebase |
| Responsive UI | Nice-to-have | Mobile-friendly interface |

---

*Last updated: 22-03-2026*