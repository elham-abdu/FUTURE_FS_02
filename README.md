# Client Lead Management System (Mini CRM)

A full-stack Client Relationship Management (CRM) system built for businesses to manage leads, track interactions, and convert prospects into clients.

## Features

### Public Features

* Contact Form: Website visitors can submit their information
* Lead Source Tracking: Capture how leads found your business
* Instant Confirmation: Users receive immediate feedback

### Admin Features

* Secure Authentication: JWT-based admin login
* Dashboard Overview: Real-time analytics and statistics
* Lead Management:

  * View all leads in sortable/filterable table
  * Update lead status (New → Contacted → Converted)
  * Add follow-up notes to any lead
  * Track conversion value and dates
* Advanced Filtering:

  * Filter by status
  * Search by name or email
  * Sort by date or name
  * Date range filtering
* Analytics Dashboard:

  * Total leads count
  * Conversion rate tracking
  * Leads by source breakdown
  * Revenue tracking
  * 7-day lead activity trend

### Bonus Features

* Full-text search across leads
* Advanced filtering system
* Timestamp tracking (created/updated/converted)
* Lead source analytics
* Revenue/conversion value tracking
* Activity timeline via notes
* Responsive mobile design

## Tech Stack

### Frontend

* React.js (v18)
* React Router DOM (v6)
* Axios
* CSS3

### Backend

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication
* bcryptjs

## Prerequisites

* Node.js (v14 or higher)
* PostgreSQL (v12 or higher)
* npm (comes with Node.js)

## Installation

### Clone the Repository

```
git clone https://github.com/yourusername/CRM-Postgres.git
cd CRM-Postgres
```

### Backend Setup

```
cd backend
npm install
```

* Create `.env` manually (not pushed) with your local credentials.
* Run database setup:

```
npm run db:setup
```

* Seed database (optional):

```
node seed.js
```

* Start backend:

```
npm run dev
```

### Frontend Setup

```
cd frontend
npm install
npm start
```

## Default Login

* Email: [admin@crm.com](mailto:admin@crm.com)
* Password: admin123

## Running the Application

| Service      | Location                                       | Command                     |
| ------------ | ---------------------------------------------- | --------------------------- |
| Backend API  | [http://localhost:5000](http://localhost:5000) | `cd backend && npm run dev` |
| Frontend App | [http://localhost:3000](http://localhost:3000) | `cd frontend && npm start`  |

## API Endpoints

### Authentication

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| POST   | /api/auth/login    | Admin login        |
| POST   | /api/auth/register | Register new admin |
| GET    | /api/auth/me       | Get current user   |

### Leads

| Method | Endpoint              | Description                       |
| ------ | --------------------- | --------------------------------- |
| POST   | /api/leads            | Submit new lead (public)          |
| GET    | /api/leads            | Get all leads (filters available) |
| GET    | /api/leads/:id        | Get single lead with notes        |
| PUT    | /api/leads/:id/status | Update lead status                |
| POST   | /api/leads/:id/notes  | Add note to lead                  |
| DELETE | /api/leads/:id        | Delete lead                       |

### Analytics

| Method | Endpoint               | Description         |
| ------ | ---------------------- | ------------------- |
| GET    | /api/analytics/summary | Get dashboard stats |

## Usage Guide

### For Website Visitors

1. Go to [http://localhost:3000](http://localhost:3000)
2. Fill out the contact form
3. Select how you heard about us
4. Submit → See thank you message

### For Administrators

1. Go to [http://localhost:3000/login](http://localhost:3000/login)
2. Login with [admin@crm.com](mailto:admin@crm.com) / admin123
3. View dashboard with analytics
4. Click any lead to see details
5. Update status as you progress
6. Add follow-up notes
7. Use filters to find specific leads

## Project Structure

```
CRM-Postgres/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── leads.js
│   │   └── analytics.js
│   ├── .env
│   ├── server.js
│   ├── setupDatabase.js
│   ├── seed.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── LeadDetail.js
│   │   │   └── PublicForm.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── App.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License

## Contact

Your Name - +251944300770 - [koniabdu81@gmail.com](mailto:koniabdu81@gmail.com)
Project Link: [https://github.com/yourusername/CRM-Postgres](https://github.com/yourusername/CRM-Postgres)
