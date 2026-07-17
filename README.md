# Vedaz Real-Time Chat Application

Welcome to **Vedaz Chat**! This repository houses the codebase for a high-performance, responsive real-time chat application powered by standard monorepo workspaces.

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62B" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/Better_Auth-FF4500?style=for-the-badge&logo=auth0&logoColor=white" alt="Better Auth" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

---

## 1. Techstack

### 💻 Frontend

- ⚛️ **Framework**: React 19 (via Vite)
- 🎨 **Styling**: Tailwind CSS v4 & Shadcn UI (optimized with vanilla HSL custom property styling and custom transitions)
- 🛣️ **Routing**: React Router v7
- 🔄 **State & Data Fetching**: TanStack React Query v5 & Axios
- ⚡ **Real-Time Client**: Socket.io Client
- 🔒 **Authentication Wrapper**: Better Auth Client (Google Social Login integration)

### ⚙️ Backend

- 🚀 **Framework**: Node.js & Express
- 🔌 **Real-Time Server**: Socket.io (managing online/offline list sync and direct message broadcasting)
- 💾 **Database Layer**: Neon Serverless PostgreSQL with Drizzle ORM
- 🛡️ **Authentication**: Better Auth (Google OAuth 2.0 flow middleware)

### 📦 Infrastructure

- 🗃️ **Monorepo Manager**: `pnpm` workspaces

---

## 🚀 2. How to Start Frontend

1. Ensure dependencies are installed from the root workspace directory:

   ```bash
   pnpm install
   ```

2. Populate the environment variables:
   Create a `.env` file in `apps/web/` using the template below (see Section 4).

3. Run the frontend application in development mode:

   ```bash
   pnpm --dir apps/web run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## ⚡ 3. How to Start Backend

1. Populate the backend environment variables:
   Create a `.env` file in `apps/server/` using the template below (see Section 4).

2. Apply database schemas / run Drizzle push to synchronize tables with Neon PostgreSQL:

   ```bash
   pnpm --dir apps/server exec drizzle-kit push
   ```

3. Start the Express & Socket.io server in development mode:
   ```bash
   pnpm --dir apps/server run dev
   ```
   The backend server will run at [http://localhost:3000](http://localhost:3000).

---

## 📝 4. Environment Variables Templates

### Frontend Env Template

Save this as `apps/web/.env`:

```env
# URL where the Express + Socket.io server is running
VITE_BACKEND-URL=http://localhost:3000
```

### Backend Env Template

Save this as `apps/server/.env`:

```env
# Neon PostgreSQL Connection URL
DATABASE_URL=postgresql://user:pass@host/db

# Better Auth Secret Token
BETTER_AUTH_SECRET=your_random_auth_secret_here

# Better Auth Base Address
BETTER_AUTH_URL=http://localhost:3000

# Client Application URL
FRONTEND_URL=http://localhost:5173

# Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

---

## ✨ 5. Features

- 🔑 **Google Social Authentication**: Safe login flow utilizing Better Auth library and Google SSO.
- 💬 **Real-Time Messaging**: Deliver and receive direct chat messages instantly over Socket.io.
- 🟢 **Online/Offline Tracking**: Visual indicator badges on avatars display active statuses synced automatically through connection socket heartbeats.
- 🗄️ **Persistent Message Store**: Messages are saved in a Neon serverless PostgreSQL database using Drizzle ORM before broadcasting, eliminating client synchronization races.
- 📱 **Unified Mobile Layout**: Standardized layout resets margins and features responsive viewport heights (`min-h-screen`) to prevent squishing or clipping on mobile emulation.
- 📱 **Integrated Sidebar Menu**: A mobile drawer trigger button integrated directly into active subpage headers (chat and profile settings) allows drawer navigation on mobile viewports.
