# Blog App 🚀

A modern, scalable blog application built with **microservices architecture**. Features user authentication (Google OAuth + JWT), blog CRUD operations, rich text editing, file uploads to Cloudinary, and responsive UI.

## 🏗️ Architecture

```
Blogapp (Monorepo)
├── frontend/          # Next.js 15 React app (TypeScript, Tailwind, shadcn/ui)
├── services/
│   ├── user/         # User auth & profiles (Express, MongoDB, Google OAuth)
│   ├── author/       # Author blog management
│   └── blog/         # Blog data & messaging (RabbitMQ consumer)
```

**Communication**: Services use RabbitMQ for async messaging, HTTP APIs for frontend-backend.

## ✨ Features

- User registration/login (Google, email/password)
- Blog creation/editing/saving with rich text (Jodit editor)
- User profiles & avatars
- Responsive navbar/sidebar
- Image uploads (Cloudinary)
- Toast notifications, loading states

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Jodit, Lucide icons
- **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB), Multer, Cloudinary, JWT, RabbitMQ
- **Tools**: Axios, React Context, nodemon, concurrently

## 📋 Prerequisites

- Node.js (v20+)
- MongoDB (local or Atlas)
- RabbitMQ server
- Cloudinary account (for uploads)
- Google OAuth credentials (for login)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo> && cd Blogapp
```

**Frontend:**

```bash
cd frontend
npm install
```

**Each Service:**

```bash
cd ../services/user && npm install
cd ../services/author && npm install
cd ../services/blog && npm install
```

### 2. Environment Variables

Create `.env` in each service/frontend:

**Common (all services):**

```
PORT=4000  # User:4000, Author:5000, Blog:5001 (adjust as needed)
DATABASE_URL=mongodb://localhost:27017/blogdb  # or Atlas
JWT_SECRET=your-super-secret-jwt-key
RABBITMQ_URL=amqp://localhost:5672
```

**User Service (extra):**

```
CLOUDINARY_URL=your-cloudinary-url
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Frontend (.env.local):**

```
NEXT_PUBLIC_API_USER=http://localhost:4000/api
NEXT_PUBLIC_API_AUTHOR=http://localhost:5000/api
NEXT_PUBLIC_API_BLOG=http://localhost:5001/api
NEXTAUTH_SECRET=your-secret  # if using NextAuth
```

### 3. Run Services (Dev Mode)

Open separate terminals:

**User Service:**

```bash
cd services/user
npm run dev
```

**Author Service:**

```bash
cd services/author
npm run dev
```

**Blog Service:**

```bash
cd services/blog
npm run dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```

Open http://localhost:3000

**Production:**

```bash
# Build & start
npm run build && npm start  # per folder
```

## 📁 Project Structure

```
frontend/src/app/
├── blog/          # Blog routes (new, edit [id], saved)
├── blogs/         # Blogs list
├── login/         # Auth page
└── profile/[id]/  # User profiles

services/*/src/
├── controllers/   # Business logic
├── routes/        # API endpoints (/api/blogs, /api/users)
├── middleware/    # Auth, uploads
└── utils/         # DB, RabbitMQ, TryCatch
```

## 🔗 API Endpoints (Examples)

- `POST /api/users/login` (user service)
- `POST /api/blogs` (author/blog services)
- `GET /api/blogs` (list blogs)

See route files for full list.

## 🧪 Testing

```bash
# No tests yet; add with Jest/Vitest
npm test  # per service
```

## 🚀 Deployment

- **Frontend**: Vercel (auto-deploys Next.js)
- **Services**: Render/Heroku/Railway (set env vars), MongoDB Atlas, RabbitMQ CloudAMQP
- Dockerize for Kubernetes if scaling.

## 🤝 Contributing

1. Fork & PR
2. Follow TypeScript/ESLint standards
3. Update README for changes

## 📄 License

MIT

Questions? Open an issue!
