# Timesheet Application

A modern React TypeScript timesheet application for tracking work hours across projects with role-based access control.

## Features

- 📊 **Project Management** - Create and manage projects with location tracking
- ⏱️ **Time Tracking** - Clock in/out functionality with lunch time management
- 👥 **User Management** - Role-based access (Admin, Project Manager, Employee)
- 📈 **Dashboard & Reports** - Weekly summaries and project analytics
- 🌓 **Dark Mode** - Full dark/light theme support with system preference detection
- 📱 **Responsive Design** - Mobile-first design that works on all devices
- 🗺️ **Location Integration** - Project location mapping with coordinates

## Technology Stack

- **Frontend**: React 18.3.1 + TypeScript 5.8.3
- **Build Tool**: Vite 6.3.5 with Hot Module Replacement
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York variant)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context for global state
- **UI Components**: shadcn/ui component library
- **Icons**: Lucide React
- **Maps**: React Leaflet

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd timesheet-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3001` (or next available port).

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── features/              # Feature-based organization
│   ├── auth/             # Authentication features
│   ├── dashboard/        # Dashboard functionality
│   ├── projects/         # Project management
│   ├── time-entry/       # Time tracking
│   ├── users/            # User management
│   └── weekly-summary/   # Reports and summaries
├── shared/               # Shared resources
│   ├── components/       # Reusable UI components
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/         # React contexts (theme, auth)
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API and service layer
│   ├── types/            # TypeScript definitions
│   └── lib/              # Utility functions
├── layouts/              # Layout components
└── App.tsx              # Main application component
```

## User Roles

### Admin
- Full system access
- User management
- Project creation and management
- Access to all reports and analytics

### Project Manager (PM)
- Project management for assigned projects
- Team member oversight
- Project-specific reports

### Employee
- Time tracking (clock in/out)
- View personal timesheet data
- Access to assigned projects

## Key Features

### Time Tracking
- One-click clock in/out functionality
- Automatic lunch time calculation
- Real-time work status indicators
- Bulk actions for multiple users

### Project Management
- Project creation with location coordinates
- User assignment to projects
- Project-specific lunch time settings
- Interactive map integration

### Dark Mode
- Automatic system preference detection
- Manual toggle in header
- Persistent theme selection
- Comprehensive component support

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface elements

## Development Guidelines

### Component Architecture
- Functional components with hooks
- Feature-based organization
- Reusable UI components in `shared/components`

### Styling
- Tailwind CSS utility classes
- shadcn/ui component variants
- CSS custom properties for theming
- Consistent design system

### State Management
- React Hook Form for form state
- React Context for global state
- Local component state for UI interactions

### Path Aliases
Use the configured path alias for imports:
```typescript
import { Button } from '@/shared/components/ui/button'
// Instead of: import { Button } from '../../../shared/components/ui/button'
```

## Contributing

1. Follow the existing code style and conventions
2. Use TypeScript for all new components
3. Implement responsive design for all UI components
4. Test both light and dark themes
5. Ensure accessibility best practices

## License

[Your License Here]