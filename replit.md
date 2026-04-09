# إسكنك - Real Estate Platform (Alexandria, Egypt)

## Project Overview
A fullstack React + Node.js real estate platform for the Alexandria, Egypt market. Features property browsing, search, AI-powered property assistant, image uploads, and multi-role dashboards (User, Admin, Super Admin). UI is primarily in Arabic (RTL).

## Tech Stack
### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 6 (port 5000)
- **Styling:** Tailwind CSS 4 + Radix UI components
- **Routing:** React Router 7
- **State:** React Context API (AuthContext, AppContext)
- **Icons:** Lucide React
- **Animations:** Motion (Framer Motion)

### Backend
- **Runtime:** Node.js + Express (port 3001)
- **Language:** TypeScript (tsx)
- **Database:** PostgreSQL (via pg pool)
- **Auth:** JWT + bcrypt
- **File Uploads:** Multer → /uploads directory
- **AI:** OpenAI API (gpt-4o-mini) via Replit integration

## Project Structure
```
src/app/
  components/   # Reusable UI (AIChat, Navbar, etc.)
  pages/        # AddProperty, Properties, Home, Login, etc.
  context/      # AuthContext, AppContext
  lib/api.ts    # API client + streamChat

server/
  index.ts      # Express entry point
  db.ts         # PostgreSQL pool
  setup-db.ts   # DB schema creation + seed data
  routes/
    properties.ts   # CRUD + search + save
    auth.ts         # Login, register, JWT
    ai-chat.ts      # OpenAI streaming chat + recommend
    upload.ts       # Multer image upload
    admin.ts        # Admin/superadmin routes
    support.ts      # Support tickets
    payments.ts     # Payment requests

uploads/        # Uploaded property images
```

## Database Tables
- users, properties, property_images, saved_properties
- payment_requests, support_tickets, support_messages
- ai_conversations, ai_messages

## Development
```bash
pnpm install
# Start frontend (port 5000)
pnpm run dev
# Start backend (port 3001)
npx tsx server/index.ts
# Setup DB (first time only)
npx tsx server/setup-db.ts
```

## Default Test Accounts (password: Admin@2024)
- Super Admin: superadmin@iskantek.com
- Data Entry: dataentry@iskantek.com
- User: user@example.com (password: User@2024)

## Key Features
- Property listing with image upload from device (up to 5 images)
- AI chat assistant trained on real DB properties - gives recommendations by category (family, students, investors, etc.)
- Admin approval workflow for properties
- Saved/favorite properties
- Multi-role system (user, admin, superadmin with sub-roles)
