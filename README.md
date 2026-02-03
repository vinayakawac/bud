# O-Hub

## Introduction

Welcome to O-Hub, a production-grade full-stack collaboration platform designed for creators to showcase their projects. Whether you're a creator, admin, or visitor, our platform provides an engaging way to explore, manage, and rate projects.

## Languages and Frameworks Used

[![My Skills](https://skillicons.dev/icons?i=nextjs,ts,postgres,prisma,tailwind,react)](https://skillicons.dev)

---

## Key Features

### Multi-Role Authentication

O-Hub supports three distinct user roles with secure JWT-based authentication and bcrypt password hashing:

- **Creators**: Register, login, manage projects, and collaborate with other creators
- **Admins**: Platform management, analytics, and moderation capabilities  
- **Visitors**: Browse projects, rate, and comment with IP-based rate limiting

### Role-Based Access Control (RBAC)

Comprehensive permission system with explicit access controls, ownership verification, and fail-closed security patterns ensuring users can only access authorized resources.

### Enterprise Audit Logging

Complete audit trail of all significant platform actions including authentication events, CRUD operations, permission denials, and security events for compliance and monitoring.

### Collaboration System

Creators can invite other creators to collaborate on projects with invitation management and shared project ownership capabilities.

### Rating & Feedback System

1-5 star rating system with optional feedback, IP-based rate limiting to prevent abuse, and aggregated statistics stored in project metadata.

---

**Built by [Vinayaka](https://github.com/vinayakawac)**
