# NewsPulse - Premium News Platform

## Concept & Vision

NewsPulse is a bold, editorial-style news platform that feels like a premium digital magazine. The experience is immersive and cinematic—dark, elegant, with sharp typography and vivid accent colors. News isn't just displayed; it's presented as curated stories that demand attention. The platform balances urgency (breaking news) with sophistication (long-form reading experience).

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
--accent-tertiary: #ffd000;    /* Gold - premium features */
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

### Visual Assets
- **Icons**: Lucide React (consistent stroke width)
- **Images**: Unsplash via URL (high-quality news imagery)
- **Decorative**: Gradient orbs, noise texture overlay, geometric accents

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

### Admin Panel
1. **Dashboard Stats** — Total news, views, user engagement
2. **News Management** — CRUD operations with rich editor
3. **User Management** — View users, roles
4. **Analytics** — Simple charts

### Responsive Strategy
- **Desktop (1200px+)**: Full 3-column grid, all effects enabled
- **Tablet (768px-1199px)**: 2-column grid, reduced animations
- **Mobile (<768px)**: Single column, hamburger menu, touch-optimized

## Features & Interactions

### Authentication
- **Register**: Email, password, name — form with validation
- **Login**: Email/password with "Remember me"
- **Session**: JWT tokens stored in httpOnly cookies
- **Protected routes**: Middleware for admin/user access

### News Management (Admin)
- **Create**: Rich text editor, image URL, category selector, tags, "breaking" toggle
- **Edit**: Same as create with pre-filled data
- **Delete**: Confirmation modal with undo option
- **View count**: Auto-incremented on each view

### News Viewing (User)
- **Public**: First 3 news items visible, rest blurred with lock icon
- **Registered**: Full access to all content
- **Bookmark**: Save articles for later
- **Share**: Copy link functionality

### Interactions
- **Card hover**: Lift effect, image zoom, gradient reveal
- **Category filter**: Click to filter with smooth transition
- **Search**: Real-time search with debounce
- **Infinite scroll**: Load more news on scroll (optional)

### Edge Cases
- **Empty state**: "No news yet" with illustration
- **Loading**: Skeleton cards with pulse animation
- **Error**: Toast notifications with retry option
- **404**: Custom page with navigation back

## Component Inventory

### NewsCard
- **States**: Default, hover (elevated), loading (skeleton), locked (blurred)
- **Variants**: Featured (large), standard, compact
- **Elements**: Image, category badge, headline, excerpt, author, date, read time

### Button
- **Variants**: Primary (gradient), secondary (outline), ghost, danger
- **States**: Default, hover (glow), active (pressed), disabled, loading
- **Sizes**: Small, medium, large

### Input
- **Types**: Text, email, password
- **States**: Default, focus (glow border), error (red border + message), disabled

### Modal
- **Overlay**: Backdrop blur with fade
- **Content**: Centered, slide-up animation
- **Close**: X button + click outside + ESC key

### Navigation
- **Desktop**: Horizontal links with underline animation
- **Mobile**: Slide-out drawer with backdrop

### Toast Notification
- **Types**: Success (green), error (red), info (blue)
- **Behavior**: Auto-dismiss after 5s, stack multiple

### Badge
- **Variants**: Category (colored), Breaking (pulsing red), Premium (gold)

## Technical Approach

### Frontend (Next.js 14 App Router)
```
/app
  /page.tsx              # Homepage
  /login/page.tsx       # Login
  /register/page.tsx    # Register
  /dashboard/page.tsx   # User dashboard
  /admin/page.tsx       # Admin panel
  /api/auth/[...nextauth]/route.ts  # Auth endpoints
  /api/news/route.ts    # News CRUD
  /api/users/route.ts   # User management
```

### Backend (Express.js)
```
/server
  /index.js             # Express app entry
  /routes/auth.js       # Login, register, logout
  /routes/news.js       # News CRUD
  /routes/users.js      # User management
  /middleware/auth.js   # JWT verification
  /models/              # Mongoose schemas
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
  author: ObjectId,
  createdAt: Date
}
```

### API Design
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Get JWT token
- `GET /api/news` — List news (paginated)
- `POST /api/news` — Create news (admin)
- `PUT /api/news/:id` — Update news (admin)
- `DELETE /api/news/:id` — Delete news (admin)
- `GET /api/users/me` — Get current user
- `POST /api/users/bookmark/:newsId` — Toggle bookmark

### Authentication Flow
1. User submits credentials
2. Server validates and returns JWT
3. Frontend stores in localStorage/cookie
4. Protected routes check token validity
5. Role-based access control on API and UI
