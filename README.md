# SkillLink – Trusted Services,Just a Click Away

## Introduction

SkillLink is a full-stack web application developed as a semester project for the Web Technologies course. The platform provides a secure and transparent way for clients to hire verified daily wage workers and skilled professionals.

The main objective of SkillLink is to solve the issue of trust and reliability when hiring workers from unverified roadside locations. Clients often lack information about workers’ skills, experience, and credibility. SkillLink offers a structured digital solution where workers can create professional profiles and clients can hire trusted service providers with confidence.

---

# Features

## Verified Worker Profiles

* Verified service provider accounts
* Detailed worker profiles including skills and experience
* Professional profile management

## Secure Hiring System

* Easy and secure hiring process
* Transparent communication between clients and workers

## Emergency Services

* Emergency hiring feature for urgent situations
* Quick access to workers for immediate assistance

## Review and Rating System

* Client reviews and ratings
* Transparent feedback system to maintain service quality

---

# System Architecture

## Admin Dashboard

The admin dashboard is responsible for maintaining the credibility and management of the platform.

### Functionalities

* Verify and approve worker profiles
* Manage users and platform data
* Monitor platform activities

---

## Worker Dashboard

Workers can manage their professional profiles and service information.

### Functionalities

* Create and update profiles
* Add skills and experience details
* Manage bookings
* View client reviews and ratings

---

## Client Dashboard

Clients can search and hire verified workers through a user-friendly interface.

### Functionalities

* Search service providers
* View worker profiles
* Manage bookings
* Submit reviews and ratings

---

# Technologies Used

## Frontend

* React.js
* Responsive user interface
* Component-based architecture

## Backend

* Node.js
* Express.js
* RESTful APIs
* Authentication and role-based authorization

## Database

* MongoDB

## Cloud Storage

* Cloudinary for secure profile image storage

---

# Authentication and Security

* Role-based access control
* Secure authentication system
* Protected routes and user verification

---

# Project Structure

```bash id="0h0e4g"
SkillLink/
│
├── frontend/       # React Frontend
├── backend/        # Node.js & Express Backend
├── models/         # Database Models
├── routes/         # API Routes
├── controllers/    # Business Logic
├── middleware/     # Authentication Middleware
├── config/         # Configuration Files
└── README.md
```

---

# Installation and Setup

## Clone the Repository

```bash id="58pvip"
git clone https://github.com/your-username/SkillLink.git
```

## Navigate to Project Directory

```bash id="3pnw5f"
cd SkillLink
```

## Install Dependencies

### Frontend

```bash id="2n7yvv"
cd frontend
npm install
```

### Backend

```bash id="6d13d2"
cd backend
npm install
```

---

# Running the Project

## Run Frontend

```bash id="9h2c7n"
cd frontend
npm run dev
```

## Run Backend

```bash id="b9wq74"
cd backend
node server.js
```

---

# Environment Variables

Create a `.env` file inside the backend folder and add the following:

```env id="r67d9s"
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

# Learning Outcomes

This project enhanced our understanding of:

* Full-stack web development
* RESTful API development
* Authentication and authorization systems
* Database design and management
* Cloud storage integration
* Real-world problem solving using technology

---


# Future Improvements

* Real-time chat system
* Online payment integration
* GPS-based worker tracking
* AI-based service recommendations
* Mobile application development

---

# Conclusion

SkillLink is a practical solution that improves trust, transparency, and accessibility in hiring skilled workers and daily wage professionals. The platform combines modern web technologies with a structured management system to create a reliable and efficient service marketplace.
