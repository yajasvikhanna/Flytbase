# 🛰️ Drone Survey System

An end-to-end real-time drone management and mission control system built using the MERN stack and modern frontend tooling.

---

## 🚀 Live Project
## 🚀 Live Demo

👉 **[Try the Live App (Login)](https://flytbase-three.vercel.app/login)** 
- 🌐 **Frontend:** https://flytbase-three.vercel.app/
- 🌐 **Backend API:** https://flytbase-e1ns.onrender.com
- 📦 **GitHub Repository:** [Flytbase on GitHub](https://github.com/yajasvikhanna/Flytbase)
- 

> Access granted to `assignments@flytbase.com` as a contributor.

---

## 🧭 Project Structure

```
Flytbase/
├── backend/               # Node.js + Express backend
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth, error handlers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API route files
│   ├── services/          # Business logic
│   ├── socket/            # WebSocket integration (Socket.IO)
│   ├── config/            # DB and env config
│   ├── server.js
│   └── .env
│
├── public/                # React public assets
├── src/                   # React + Vite frontend source code
│   ├── assets/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Main route pages (Dashboard, Reports, etc.)
│   ├── services/          # API and auth services
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── vite.config.js
├── index.html
├── package.json
├── README.md
└── .gitignore
```

---

## 🛠️ Tech Stack

### Frontend
- **React** (with Vite for fast builds)
- **Mapbox GL JS** (map interface)
- **Axios** (API calls)
- **Socket.IO-client** (WebSocket integration)
- **Tailwind CSS** (UI styling)

### Backend
- **Node.js** + **Express.js**
- **MongoDB Atlas** (cloud DB)
- **Mongoose** (ODM for MongoDB)
- **JWT** (authentication)
- **Socket.IO** (WebSocket server)

### Deployment
- **Frontend**: Vercel — [flytbase-three.vercel.app](https://flytbase-three.vercel.app/)
- **Backend**: Render — [flytbase-e1ns.onrender.com](https://flytbase-e1ns.onrender.com)

---

## 🔧 Project Setup

### 🔹 Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas account
- Vite CLI (`npm create vite@latest`)

---

### 🔹 Backend Setup

```bash
cd backend
npm install
# Create .env file based on .env.example
npm start
```

`.env` example:
```
PORT=5000
MONGO_URI=<your_mongo_uri>
JWT_SECRET=<your_jwt_secret>
CLIENT_URL=http://localhost:5173
```

---

### 🔹 Frontend Setup

```bash
npm install
npm run dev
```

---

## ✅ Key Features

### 1. **Authentication Module**
- Secure JWT-based login/signup.
- Form validation on both client & server.

### 2. **Dashboard**
- Overview of drone status and active missions.
- Real-time updates via WebSocket.

### 3. **Fleet Management**
- Displays all drones.
- Statistics: ID, current state, past usage.

### 4. **Active Missions**
- List of all ongoing drone missions.
- Live progress and location updates.

### 5. **Create Mission**
- Multi-step form with validation.
- Mapbox interface to set boundaries/routes.

### 6. **Reports Module**
- Summary of completed missions.
- Data on usage, time, and involved drones.

### 7. **Profile Module**
- Update user profile and preferences.
- Toggle real-time notification settings.

---

## 🧠 Development Approach

| Area                | Implementation |
|---------------------|----------------|
| **Modularity**      | Separate concerns (routes, services, components) |
| **Real-Time**       | WebSocket via Socket.IO |
| **Mapping**         | Lightweight & customizable Mapbox integration |
| **Scalability**     | Frontend & backend decoupled for microservice readiness |

---

## ⚖️ Trade-offs Considered

| Decision                    | Trade-off |
|-----------------------------|-----------|
| Mapbox vs Google Maps       | Chose Mapbox for flexibility & cost-efficiency |
| Socket.IO over MQTT         | Simpler real-time setup, less performant for massive scale |
| Client-side form validation | Fast UX, server still handles secure validation |
| Vercel + Render Hosting     | Easy CI/CD, but CORS handling needed |

---

## 🛡️ Safety & Adaptability

- 🔐 JWT Authentication
- 🧩 Role-Based Access (extensible)
- 🧪 Robust Validation (both sides)
- 📡 Real-Time Monitoring via Socket.IO
- 🔌 Modular Features (easy to extend)

---

## 📹 Demo Video

A recorded demo showcasing all modules will be submitted separately.

---

## 🎁 Bonus Features

- Real-time drone tracking with WebSocket
- Modular UI components with Tailwind
- Notification preference management
- Optimized Vite builds for performance

---

## 📩 Feedback & Contributions

For feedback or collaboration, feel free to open issues or pull requests on the [GitHub Repo](https://github.com/yajasvikhanna/Flytbase).
