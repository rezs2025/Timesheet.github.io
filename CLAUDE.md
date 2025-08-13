# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (runs on port 3001)
npm start

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Architecture

This is a **React TypeScript timesheet application** built with Vite and shadcn/ui components.

### Technology Stack
- **Frontend**: React 18.3.1 + TypeScript 5.8.3
- **Build Tool**: Vite 6.3.5 with HMR
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York variant)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context for global state

### Codebase Structure

**Feature-Based Organization** (current direction):
- `src/features/` - Self-contained feature modules
  - `auth/` - Authentication (components, hooks, services, pages)
  - `projects/` - Project management functionality
  - `dashboard/` - Dashboard-specific features

**Shared Resources**:
- `src/shared/` - Cross-cutting concerns
  - `components/` - Reusable UI components including shadcn/ui
  - `hooks/` - Custom React hooks
  - `services/` - API and service layer
  - `types/` - TypeScript definitions
  - `lib/` - Utility functions

**Legacy Structure** (being migrated from):
- `src/components/` - Original component organization by feature

### Key Configuration Files
- `vite.config.ts` - Build configuration with path aliases (`@/` → `src/`)
- `components.json` - shadcn/ui configuration (New York style)
- `src/index.css` - Tailwind v4 setup with CSS custom properties for theming

### Development Patterns
- **Component Architecture**: Functional components with hooks
- **Styling**: Tailwind utility classes with shadcn/ui component variants
- **State Management**: React Hook Form for forms, React context for global state
- **Authentication**: Custom auth implementation with role-based access (admin/user)
- **Routing**: Route-based organization with protected routes
- **Theming**: CSS custom properties supporting light/dark modes with theme context

### Path Aliases
- `@/` maps to `src/` directory (configured in vite.config.ts and tsconfig.json)
- Use `@/shared/components/ui/button` instead of relative imports

### Authentication & Features
- Custom authentication service in `src/shared/services/`
- Role-based access control throughout the application (admin/pm/employee)
- Dark mode support with theme toggle in header
- English language interface (timesheet application)