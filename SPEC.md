# NewsPulse - Monetized News Platform

## Concept & Vision

NewsPulse is a bold, editorial-style news platform that feels like a premium digital magazine with YouTube-like monetization. The experience is immersive and cinematic—dark, elegant, with sharp typography and vivid accent colors. News isn't just displayed; it's presented as curated stories that demand attention. Content creators can build audiences through subscriptions, earn likes, and monetize their profiles when they meet specific thresholds.

## Design Language

### Aesthetic Direction
**Cinematic Editorial** — Inspired by high-end magazine layouts and film posters. Dark backgrounds create depth, while vivid accent colors draw the eye. Large typography commands presence. The overall feel is confident, bold, and premium.

### Color Palette
```css
--bg-primary: #0a0a0f;        /* Deep space black */
--bg-secondary: #12121a;      /* Elevated surface */
--bg-tertiary: #1a1a24;       /* Cards */
--accent-primary: #ff3366;     /* Electric coral - breaking news */
--accent-secondary: #00d4ff;   /* Cyan pulse - highlights */
--accent-tertiary: #ffd000;    /* Gold - premium/monetization features */
--text-primary: #ffffff;       /* Headlines */
--text-secondary: #a0a0b0;     /* Body text */
--text-muted: #606070;        /* Meta info */
--gradient-hero: linear-gradient(135deg, #ff3366 0%, #ff6b35 100%);
--gradient-card: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%);
```

### Typography
- **Headlines**: "Clash Display" (Google Fonts alternative: "Bebas Neue" + "Inter" for body)
- **Body**: "Inter" — clean, highly readable
- **Accent/Meta**: "JetBrains Mono" — for timestamps, categories
- Scale: 14px base, 1.5 line-height, modular scale 1.25

### Spatial System
- Base unit: 8px
- Section padding: 80px vertical, 24px horizontal (mobile: 48px/16px)
- Card gaps: 24px
- Border radius: 16px (cards), 8px (buttons), 24px (modals)

### Motion Philosophy
- **Page transitions**: Smooth fade with slight upward movement (300ms ease-out)
- **Card hovers**: Scale 1.02, shadow elevation, image zoom (200ms)
- **Breaking news ticker**: Continuous horizontal scroll (60s loop)
- **Stagger reveals**: Cards animate in sequence (100ms delay each)
- **Micro-interactions**: Buttons pulse on hover, icons rotate/shift

## Layout & Structure

### Homepage (Public View)
1. **Hero Section** — Full-width featured news with gradient overlay, large headline, category badge
2. **Breaking News Ticker** — Horizontal scrolling urgent headlines
3. **Latest News Grid** — Masonry-style cards (3 columns desktop, 2 tablet, 1 mobile)
4. **Premium Teaser** — Blurred/locked cards with CTA to register
5. **Footer** — Minimal with links

### User Dashboard (Registered)
1. **Personalized Header** — Welcome message, notification bell
2. **Unlocked Premium Content** — Full news access
3. **Reading History** — Recently viewed
4. **Saved Articles** — Bookmark functionality

### Profile Page (Content Creator)
1. **Cover Image & Avatar** — Profile customization
2. **Stats Banner** — Followers, articles, likes, views
3. **Monetization Status** — Eligibility check, enable option
4. **User Articles** — Published content grid
5. **About Section** — Bio, location, website, social links

### Admin Panel
1. **Dashboard Stats** — Total news, views, user engagement, earnings
2. **News Management** — CRUD operations with rich editor
3. **User Management** — View users, roles, monetization status
4. **Withdrawal Requests** — Approve/reject payouts
5. **Analytics** — Simple charts

## Features & Interactions

### Authentication
- **Register**: Name, email, password — form with validation
- **Login**: Email/password with "Remember me"
- **Sign In / Sign Up**: Both options available for all users
- **Session**: JWT tokens stored in httpOnly cookies
- **Protected routes**: Middleware for admin/user access

### User Profile & Monetization
- **Profile Editing**: Name, bio, avatar, cover image, location, website, social links
- **Monetization Requirements**:
  - 100+ Followers
  - 50+ Articles Published
  - 500+ Total Likes
- **Payment Information**: PayPal email or bank account details
- **Earnings Dashboard**: View total, pending, withdrawn amounts
- **Withdrawal Requests**: Request payouts (min $10)

### Subscription System (YouTube-like)
- **Subscribe to Creators**: Follow your favorite content creators
- **Subscriber Count**: Displayed on profiles and articles
- **Unsubscribe**: Easy unfollow option
- **Notifications**: (Future) Get notified when creators publish

### News Management
- **Create**: Rich text editor, image URL, category selector, tags, "breaking" toggle
- **Edit**: Same as create with pre-filled data
- **Delete**: Confirmation modal with undo option
- **View count**: Auto-incremented on each view
- **Like count**: Users can like articles

### News Viewing (User)
- **Public**: First 3 news items visible, rest blurred with lock icon
- **Registered**: Full access to all content
- **Bookmark**: Save articles for later
- **Like**: Show appreciation for articles
- **Share**: Copy link functionality

### Interactions
- **Card hover**: Lift effect, image zoom, gradient reveal
- **Category filter**: Click to filter with smooth transition
- **Search**: Real-time search with debounce
- **Subscribe button**: Toggle between Subscribe/Subscribed states
- **Like button**: Heart animation with count update

### Edge Cases
- **Empty state**: "No news yet" with illustration
- **Loading**: Skeleton cards with pulse animation
- **Error**: Toast notifications with retry option
- **404**: Custom page with navigation back

## Component Inventory

### NewsCard
- **States**: Default, hover (elevated), loading (skeleton), locked (blurred)
- **Variants**: Featured (large), standard, compact
- **Elements**: Image, category badge, headline, excerpt, author, date, read time, likes, subscriber count

### Button
- **Variants**: Primary (gradient), secondary (outline), ghost, danger
- **States**: Default, hover (glow), active (pressed), disabled, loading
- **Sizes**: Small, medium, large

### SubscribeButton
- **States**: Default (Subscribe), Subscribed, Loading
- **Variants**: Small, medium, large
- **Animation**: Smooth transition between states

### LikeButton
- **States**: Default (outline heart), Liked (filled heart), Loading
- **Animation**: Heart fill animation on click
- **Display**: Like count next to heart

### Input
- **Types**: Text, email, password, url, textarea
- **States**: Default, focus (glow border), error (red border + message), disabled

### Modal
- **Overlay**: Backdrop blur with fade
- **Content**: Centered, slide-up animation
- **Close**: X button + click outside + ESC key

### Navigation
- **Desktop**: Horizontal links with underline animation
- **Mobile**: Slide-out drawer with backdrop
- **Auth Buttons**: Sign In / Sign Up (replaces Admin Login)

### Toast Notification
- **Types**: Success (green), error (red), info (blue)
- **Behavior**: Auto-dismiss after 5s, stack multiple

### Badge
- **Variants**: Category (colored), Breaking (pulsing red), Premium (gold), Monetized (gold gradient)

## Technical Approach

### Frontend (Next.js 16 App Router)
```
/app
  /page.tsx                    # Homepage
  /login/page.tsx             # Sign In
  /signup/page.tsx            # Sign Up (Registration)
  /dashboard/page.tsx          # User dashboard
  /admin/page.tsx             # Admin panel
  /profile/[id]/page.tsx      # User profile
  /profile/edit/page.tsx      # Edit profile
  /news/[id]/page.tsx         # News detail
  /components/                # Shared components
    /Header.tsx               # Navigation with auth buttons
    /Footer.tsx               # Site footer
    /NewsCard.tsx             # Article card
    /SubscribeButton.tsx      # Subscribe/Unsubscribe
    /LikeButton.tsx           # Like/Unlike article
    /BreakingTicker.tsx       # Breaking news ticker
  /context/                   # React Context
    /AuthContext.tsx          # Authentication state
    /ToastContext.tsx         # Toast notifications
  /lib/
    /api.ts                   # API client
```

### Backend (Express.js)
```
/server
  /index.js                   # Express app entry
  /routes/
    /auth.js                  # Register, login, logout, me
    /news.js                  # News CRUD, likes, subscriptions feed
    /users.js                 # Profile, subscribe/unsubscribe, earnings
    /earnings.js              # Withdrawal requests
  /middleware/auth.js         # JWT verification
  /models/
    /User.js                  # User with monetization fields
    /News.js                  # News with likes count
    /Subscription.js          # Follower relationships
    /Like.js                  # Article likes
    /Withdrawal.js            # Withdrawal requests
```

### Database (MongoDB)
**Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "user" | "admin",
  profile: {
    bio: String,
    avatar: String,
    coverImage: String,
    location: String,
    website: String,
    socialLinks: { twitter, facebook, instagram, linkedin }
  },
  stats: {
    followersCount: Number,
    followingCount: Number,
    totalLikesReceived: Number,
    totalViewsReceived: Number,
    articlesPublished: Number
  },
  monetization: {
    isEnabled: Boolean,
    isEligible: Boolean,
    totalEarnings: Number,
    pendingEarnings: Number,
    withdrawnAmount: Number,
    monetizationEnabledAt: Date
  },
  paymentInfo: {
    paypalEmail: String,
    bankName: String,
    accountNumber: String,
    accountHolderName: String
  },
  bookmarks: [ObjectId],
  createdAt: Date
}
```

**News Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  excerpt: String,
  content: String,
  imageUrl: String,
  category: String,
  tags: [String],
  isBreaking: Boolean,
  isPremium: Boolean,
  views: Number,
  likesCount: Number,
  author: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

**Subscription Collection**
```javascript
{
  _id: ObjectId,
  subscriber: ObjectId (User),
  creator: ObjectId (User),
  createdAt: Date
}
```

**Like Collection**
```javascript
{
  _id: ObjectId,
  user: ObjectId (User),
  news: ObjectId (News),
  createdAt: Date
}
```

**Withdrawal Collection**
```javascript
{
  _id: ObjectId,
  user: ObjectId (User),
  amount: Number,
  status: "pending" | "approved" | "rejected" | "paid",
  paymentMethod: "paypal" | "bank_transfer",
  paymentDetails: {...},
  transactionId: String,
  createdAt: Date,
  processedAt: Date
}
```

### API Design

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Get current user |

#### News
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news` | List news (paginated) |
| GET | `/api/news/:id` | Get single news |
| POST | `/api/news` | Create news (user) |
| PUT | `/api/news/:id` | Update news (owner/admin) |
| DELETE | `/api/news/:id` | Delete news (owner/admin) |
| POST | `/api/news/:id/like` | Like/unlike article |
| GET | `/api/news/breaking` | Get breaking news |
| GET | `/api/news/featured` | Get most viewed news |
| GET | `/api/news/popular` | Get most liked news |
| GET | `/api/news/subscriptions` | Get followed creators' news |

#### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/subscribe/:id` | Subscribe/unsubscribe |
| GET | `/api/users/:id/subscribers` | Get user's followers |
| GET | `/api/users/:id/subscribing` | Get who user follows |
| GET | `/api/users/check-subscription/:id` | Check if subscribed |
| GET | `/api/users/:id/articles` | Get user's articles |
| GET | `/api/users/bookmarks` | Get bookmarked news |
| POST | `/api/users/bookmarks/:id` | Toggle bookmark |
| GET | `/api/users/earnings/stats` | Get earnings statistics |
| POST | `/api/users/monetization/enable` | Enable monetization |
| GET | `/api/users/top-creators` | Get top creators |

#### Earnings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/earnings/request` | Request withdrawal |
| GET | `/api/earnings/history` | Get withdrawal history |
| GET | `/api/earnings/summary` | Get earnings summary |
| GET | `/api/earnings` | List all withdrawals (admin) |
| PUT | `/api/earnings/:id/status` | Update status (admin) |

### Authentication Flow
1. User submits registration/login credentials
2. Server validates and returns JWT
3. Frontend stores in httpOnly cookie
4. Protected routes check token validity
5. Role-based access control on API and UI

### Monetization Flow
1. User publishes articles and gains followers
2. System tracks: followers, articles, likes
3. When all thresholds met (100 followers, 50 articles, 500 likes), user becomes eligible
4. User enables monetization in profile settings
5. User adds payment information (PayPal or bank)
6. User can request withdrawal (min $10)
7. Admin approves/rejects withdrawal
8. Payment processed and marked as paid
