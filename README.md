# Bakery-Hub
Full-stack bakery management and ordering platform built with React, TypeScript, Express.js, PostgreSQL, and modern cloud deployment.
# Bakery Hub 🧁

Bakery Hub is a full-stack bakery management and online ordering application built with modern web technologies.

The application provides a customer-facing bakery interface along with backend APIs and administrative features for managing products, categories, orders, employees, attendance, salaries, payments, and customer communication.

## 🚀 Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Query

### Backend

* Node.js
* Express.js
* TypeScript
* REST APIs
* Session-based authentication

### Database

* PostgreSQL
* Drizzle ORM

### Development

* pnpm workspaces
* Monorepo architecture
* Zod validation

### Deployment

* Vercel
* GitHub

## ✨ Features

### Customer

* Browse bakery products
* View product details
* Product ratings
* Place orders
* View order history
* Catering requests
* Chat functionality
* User authentication

### Admin

* Dashboard
* Manage products
* Manage categories
* Manage orders
* Manage employees
* Manage attendance
* Manage salaries
* Manage payments
* Manage customer chat threads

## 📁 Project Structure

```text
Bakery-Hub/
├── api/                         # Vercel API entry point
├── artifacts/
│   ├── api-server/              # Express backend
│   ├── kanz-bakery/             # Main React frontend
│   └── mockup-sandbox/          # Mockup/demo application
├── lib/
│   ├── api-client-react/        # React API client
│   ├── api-spec/                # API specifications
│   ├── api-zod/                 # API validation schemas
│   └── db/                      # Database and Drizzle ORM
├── scripts/                     # Project scripts
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 🛠️ Local Development

### Requirements

* Node.js
* pnpm

### Install dependencies

```bash
pnpm install
```

### Run the frontend

```bash
pnpm --filter @workspace/kanz-bakery dev
```

### Build the project

```bash
pnpm run build
```

### Type checking

```bash
pnpm run typecheck
```

## 🔐 Environment Variables

Create the required environment variables for your local environment.

Example:

```env
DATABASE_URL=your_database_connection_string
SESSION_SECRET=your_session_secret
PORT=8080
```

Do not commit `.env` files or real secrets to GitHub.

## ☁️ Deployment

The project is structured for deployment using GitHub and Vercel.

The React frontend is located at:

```text
artifacts/kanz-bakery
```

The Vercel API entry point is:

```text
api/index.ts
```

Frontend requests use `/api/...`, allowing the frontend and backend to communicate through the same deployment domain.

## 📌 Project Status

The project is currently being prepared for production deployment and cloud database integration.

## 📄 License

MIT
