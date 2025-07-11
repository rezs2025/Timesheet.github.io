export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'pm' | 'employee';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password?: string;
  role: 'admin' | 'pm' | 'employee';
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}

export interface PaginatedUsers {
  users: User[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export type AssignmentType = 'employee' | 'pm';

export interface UserProject {
  id: string;
  userId?: string;
  assignmentType: AssignmentType;
  project: {
    id: string;
    name: string;
    description?: string;
    address?: string;
    latitude: number;
    longitude: number;
    lunchMinutes: number;
  };
  createdDate?: string;
  updatedDate?: string;
}

export interface CreateUserProjectDto {
  userId: string;
  projectId: string;
  assignmentType: AssignmentType;
}
