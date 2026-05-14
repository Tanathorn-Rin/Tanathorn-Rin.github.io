README.md# MEAN Stack Portfolio Website

This is a full-stack portfolio website built with the MEAN stack (MongoDB, Express, Angular, Node.js).

## Project Structure

```
├── backend/          # Node.js + Express API
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── server.js     # Express server
│   └── package.json
│
└── frontend/         # Angular application
    ├── src/
    │   ├── app/      # Angular components
    │   └── index.html
    └── package.json
```

## Installation

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/portfolio
PORT=5000
NODE_ENV=development
```

Start MongoDB:
```bash
mongod
```

Start the backend:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

Visit `http://localhost:4200` in your browser.

## API Endpoints

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/contact` - Submit contact form

## Technologies

- **Frontend**: Angular 15, TypeScript, CSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **HTTP Client**: HttpClientModule
- **Forms**: Angular Forms

## Features

- Responsive design
- Project portfolio display
- Contact form
- MongoDB integration
- RESTful API
- Angular routing

## Development

Both frontend and backend can run simultaneously:

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
ng serve
```

## Deployment

### Backend (Heroku example)
```bash
cd backend
git init
heroku create
git push heroku main
```

### Frontend (Vercel example)
```bash
cd frontend
npm run build
vercel deploy
```
