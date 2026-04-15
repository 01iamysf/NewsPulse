# NewsPulse - Premium News Platform

A modern, full-stack news platform with a stunning cinematic UI, role-based authentication, and Docker support.

![NewsPulse](https://via.placeholder.com/1200x600/0a0a0f/ff3366?text=NewsPulse)

## Features

### For Visitors
- **Browse News**: Explore latest news across multiple categories
- **Responsive Design**: Fully mobile-optimized experience
- **Category Filtering**: Filter news by Politics, Technology, Business, Sports, etc.

### For Admins
- **Admin Login**: Secure login with hardcoded admin credentials
- **News Management**: Create, edit, and delete news articles
- **Dashboard**: View statistics and analytics
- **Breaking News**: Mark articles as breaking news
- **Premium Content**: Control which content is marked premium

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **CSS Modules** - Scoped styling with custom CSS
- **Lucide React** - Icon library

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Docker running

### Run with Docker (Recommended)

```bash
# Navigate to project directory
cd /home/ysf/myweb

# Build and start all containers
docker-compose up -d --build

# Watch logs
docker-compose logs -f
```

This will start:
- **MongoDB** on port `27017`
- **Backend API** on port `5000`
- **Frontend** on port `3000`

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Login**: http://localhost:3000/login

### Default Admin Credentials
```
Email:    admin@newspulse.com
Password: Admin@123456
```

### Stop Docker Containers
```bash
docker-compose down
```

### Remove Everything (including data)
```bash
docker-compose down -v
```

## Manual Setup (Without Docker)

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud instance like MongoDB Atlas)

### Installation

1. **Clone the repository**
```bash
cd /home/ysf/myweb
```

2. **Set up the backend**
```bash
cd server
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your MongoDB connection string:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/newspulse
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

4. **Set up the frontend**
```bash
cd ../client
npm install
```

5. **Seed the Admin User**
```bash
cd ../server
npm run seed
```

6. **Start the backend server**
```bash
npm start
```

7. **Start the frontend** (in a new terminal)
```bash
cd ../client
npm run dev
```

8. **Open your browser**
Navigate to `http://localhost:3000`

## Docker Services

### MongoDB
- **Image**: mongo:7
- **Port**: 27017
- **Data Volume**: mongodb_data (persistent)

### Backend
- **Port**: 5000
- **Auto-seed**: Creates admin user on startup

### Frontend
- **Port**: 3000
- **Standalone**: Built as standalone Node.js app

## Project Structure

```
/home/ysf/myweb
├── client/                 # Next.js frontend
│   ├── app/
│   │   ├── admin/         # Admin dashboard
│   │   ├── components/    # React components
│   │   ├── context/       # Auth & Toast providers
│   │   ├── dashboard/     # User dashboard
│   │   ├── lib/           # API helpers
│   │   ├── login/         # Admin login page
│   │   ├── news/[id]/     # News detail page
│   │   ├── globals.css    # Global styles
│   │   └── page.tsx       # Homepage
│   ├── Dockerfile         # Docker build file
│   └── package.json
│
├── server/                 # Express.js backend
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── middleware/         # Auth middleware
│   ├── seed.js            # Admin seed script
│   ├── start.sh           # Startup script
│   ├── Dockerfile         # Docker build file
│   └── package.json
│
├── docker-compose.yml      # Docker Compose config
├── SPEC.md                # Design specification
└── README.md              # This file
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login admin |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### News
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news` | List all news |
| GET | `/api/news/:id` | Get single news |
| POST | `/api/news` | Create news (admin) |
| PUT | `/api/news/:id` | Update news (admin) |
| DELETE | `/api/news/:id` | Delete news (admin) |
| GET | `/api/news/breaking` | Get breaking news |
| GET | `/api/news/featured` | Get featured news |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/bookmarks` | Get user bookmarks |
| POST | `/api/users/bookmarks/:newsId` | Toggle bookmark |

## Design Features

### Color Palette
- **Primary Background**: `#0a0a0f` (Deep space black)
- **Accent Primary**: `#ff3366` (Electric coral)
- **Accent Secondary**: `#00d4ff` (Cyan pulse)
- **Accent Tertiary**: `#ffd000` (Gold)

### Typography
- **Headlines**: Bebas Neue (bold, cinematic)
- **Body**: Inter (clean, readable)

### Animations
- Fade-in-up reveals with stagger delays
- Hover effects with scale and shadow elevation
- Breaking news ticker animation
- Smooth page transitions

## License

MIT License - feel free to use this project for personal or commercial purposes.
