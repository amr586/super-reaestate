# إسكنك - Real Estate Website (Alexandria, Egypt)

## Project Overview
A React + TypeScript frontend application for a real estate platform serving the Alexandria, Egypt market. Features property browsing, search, and multi-role dashboards (User, Admin, Super Admin). The UI is primarily in Arabic (RTL).

## Tech Stack
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4 + Radix UI components (shadcn/ui-like)
- **Routing:** React Router 7
- **State:** React Context API
- **Charts:** Recharts
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Animations:** Motion (Framer Motion)
- **Package Manager:** pnpm

## Project Structure
```
src/
  app/
    components/   # Reusable UI components (ui/, figma/)
    pages/        # Page-level components
    context/      # AppContext global state
    data/         # Mock data and TypeScript interfaces
    routes.ts     # Centralized route definitions
  styles/         # Global CSS + Tailwind
  main.tsx        # App entry point
index.html        # HTML entry
vite.config.ts    # Vite config (port 5000, host 0.0.0.0, allowedHosts: true)
```

## Development
```bash
pnpm install
pnpm run dev     # Starts on http://0.0.0.0:5000
```

## Deployment
- Type: Static site
- Build command: `pnpm run build`
- Output directory: `dist`

## Key Notes
- Frontend only — all data is mocked in `src/app/data/mockData.ts`
- Supports English and Arabic content (bilingual mock data)
- Configured for Replit: host=0.0.0.0, port=5000, allowedHosts=true
