# NewsPulse - Monetized News Platform

A modern, full-stack news platform with YouTube-like monetization, subscriber system, and a stunning cinematic UI. Content creators can build audiences, earn likes, and monetize their profiles when they meet specific thresholds.

![NewsPulse](https://via.placeholder.com/1200x600/0a0a0f/ff3366?text=NewsPulse)

## Features

### For Visitors
- **Browse News**: Explore latest news across multiple categories
- **Responsive Design**: Fully mobile-optimized experience
- **Category Filtering**: Filter news by Politics, Technology, Business, Sports, etc.
- **Like Articles**: Show appreciation for articles you enjoy

### For Content Creators
- **Create Account**: Register with email and password
- **Publish Articles**: Create and manage your news content
- **Build Audience**: Gain subscribers who follow your content
- **Like System**: Receive likes on your articles
- **Monetization**: Earn money when you meet thresholds:
  - 100+ Followers
  - 50+ Articles Published
  - 500+ Total Likes
- **Earnings Dashboard**: Track your total, pending, and withdrawn earnings
- **Withdrawal System**: Request payouts via PayPal or Bank Transfer

### For Admins
- **Admin Login**: Secure login with admin credentials
- **News Management**: Create, edit, and delete news articles
- **User Management**: View users, roles, monetization status
- **Withdrawal Requests**: Approve/reject payout requests
- **Dashboard**: View statistics and analytics
- **Breaking News**: Mark articles as breaking news

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
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
cd /home/mishkat/Downloads/myweb

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
- **Sign In**: http://localhost:3000/login
- **Sign Up**: http://localhost:3000/signup

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
cd /home/mishkat/Downloads/myweb
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
/home/mishkat/Downloads/myweb
├── client/                 # Next.js frontend
│   ├── app/
│   │   ├── admin/         # Admin dashboard
│   │   ├── components/    # React components
│   │   │   ├── Header.tsx       # Navigation
│   │   │   ├── Footer.tsx       # Footer
│   │   │   ├── NewsCard.tsx     # Article card
│   │   │   ├── SubscribeButton.tsx  # Subscribe button
│   │   │   └── LikeButton.tsx   # Like button
│   │   ├── context/       # Auth & Toast providers
│   │   ├── dashboard/     # User dashboard
│   │   ├── lib/           # API helpers
│   │   ├── login/         # Sign In page
│   │   ├── signup/        # Sign Up page
│   │   ├── profile/       # User profile pages
│   │   │   ├── page.tsx        # View profile
│   │   │   └── edit/page.tsx   # Edit profile
│   │   ├── news/[id]/     # News detail page
│   │   ├── globals.css    # Global styles
│   │   └── page.tsx       # Homepage
│   ├── Dockerfile         # Docker build file
│   └── package.json
│
├── server/                 # Express.js backend
│   ├── models/            # Mongoose schemas
│   │   ├── User.js        # User with monetization
│   │   ├── News.js        # News with likes
│   │   ├── Subscription.js # Follower relationships
│   │   ├── Like.js        # Article likes
│   │   └── Withdrawal.js  # Withdrawal requests
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication
│   │   ├── news.js        # News CRUD
│   │   ├── users.js       # Users & subscriptions
│   │   └── earnings.js    # Earnings & withdrawals
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
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Get current user |

### News
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news` | List all news |
| GET | `/api/news/:id` | Get single news |
| POST | `/api/news` | Create news |
| PUT | `/api/news/:id` | Update news |
| DELETE | `/api/news/:id` | Delete news |
| POST | `/api/news/:id/like` | Like/unlike article |
| GET | `/api/news/breaking` | Get breaking news |
| GET | `/api/news/featured` | Get featured news |
| GET | `/api/news/popular` | Get popular news |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get my profile |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/subscribe/:id` | Subscribe/unsubscribe |
| GET | `/api/users/:id/subscribers` | Get followers |
| GET | `/api/users/:id/articles` | Get user articles |
| GET | `/api/users/bookmarks` | Get bookmarks |
| POST | `/api/users/bookmarks/:id` | Toggle bookmark |
| GET | `/api/users/earnings/stats` | Get earnings |
| POST | `/api/users/monetization/enable` | Enable monetization |

### Earnings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/earnings/request` | Request withdrawal |
| GET | `/api/earnings/history` | Get withdrawal history |
| GET | `/api/earnings/summary` | Get earnings summary |

## Design Features

### Color Palette
- **Primary Background**: `#0a0a0f` (Deep space black)
- **Accent Primary**: `#ff3366` (Electric coral)
- **Accent Secondary**: `#00d4ff` (Cyan pulse)
- **Accent Tertiary**: `#ffd000` (Gold - monetization)

### Typography
- **Headlines**: Bebas Neue (bold, cinematic)
- **Body**: Inter (clean, readable)

### Animations
- Fade-in-up reveals with stagger delays
- Hover effects with scale and shadow elevation
- Breaking news ticker animation
- Smooth page transitions
- Like heart animation
- Subscribe button transitions

## Monetization System

### Requirements
To enable monetization, users must meet ALL criteria:
1. **100 Followers** - Build an audience
2. **50 Articles Published** - Create enough content
3. **500 Total Likes** - Generate engagement

### How It Works
1. Users publish articles and attract subscribers
2. Each subscriber and like brings them closer to eligibility
3. When eligible, user enables monetization in profile settings
4. User adds PayPal or bank account details
5. User can request withdrawals (minimum $10)
6. Admin reviews and processes withdrawals

## License

MIT License - feel free to use this project for personal or commercial purposes.
