export interface RouteConfig {
  path: string;
  name: string;
  exact?: boolean;
}

export const ROUTES = {
  // Auth routes
  LOGIN: {
    path: '/login',
    name: 'Login',
    exact: true,
  },
  REGISTER: {
    path: '/register',
    name: 'Register',
    exact: true,
  },
  
  // Main routes
  DASHBOARD: {
    path: '/',
    name: 'Dashboard',
    exact: true,
  },
  TIME_ENTRY: {
    path: '/time-entry',
    name: 'Time Entry',
    exact: true,
  },
  WEEKLY_SUMMARY: {
    path: '/weekly-summary',
    name: 'Weekly Summary',
    exact: true,
  },
  
  // Projects routes
  PROJECTS: {
    path: '/projects',
    name: 'Projects',
    exact: true,
  },
  PROJECT_DETAIL: {
    path: '/projects/:id',
    name: 'Project Details',
    exact: false,
    basePath: '/projects/',
  },
  
  // Users routes
  USERS: {
    path: '/users',
    name: 'Users',
    exact: true,
  },
  USER_PROJECTS: {
    path: '/users/:userId/projects',
    name: 'User Projects',
    exact: false,
    basePath: '/users/',
  },
} as const;

// Helper function to get route name by path
export const getRouteNameByPath = (pathname: string, userRole?: string): string => {
  // Handle exact matches first
  const exactRoute = Object.values(ROUTES).find(
    route => route.exact && route.path === pathname
  );
  
  if (exactRoute) {
    // Special handling for dashboard based on user role
    if (exactRoute === ROUTES.DASHBOARD && userRole) {
      switch (userRole) {
        case 'employee':
          return 'Time Entry';
        case 'admin':
          return 'Administration Panel';
        case 'pm':
          return 'Project Management';
        default:
          return exactRoute.name;
      }
    }
    return exactRoute.name;
  }
  
  // Handle dynamic routes (non-exact)
  const dynamicRoute = Object.values(ROUTES).find(
    route => !route.exact && route.basePath && pathname.startsWith(route.basePath)
  );
  
  if (dynamicRoute) {
    return dynamicRoute.name;
  }
  
  // Default fallback
  return 'TimeSheet';
};

// Helper function to generate route paths
export const generatePath = (route: RouteConfig, params?: Record<string, string>): string => {
  if (!params) return route.path;
  
  let path = route.path;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  
  return path;
};