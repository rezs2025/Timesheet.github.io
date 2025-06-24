export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'pm' | 'employee';
}