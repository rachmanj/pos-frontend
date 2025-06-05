export interface ExtendedSession {
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
  accessToken: string;
}

export interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions?: string[];
  accessToken: string;
}

export interface ExtendedJWT {
  sub?: string;
  accessToken?: string;
  roles?: string[];
  permissions?: string[];
}

// User Profile Types
export interface UserProfile {
  phone?: string;
  address?: string;
  avatar?: string;
  employee_id?: string;
  status: "active" | "inactive" | "suspended";
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  profile?: UserProfile;
  roles: string[];
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
  profile?: Partial<UserProfile>;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: string;
  profile?: Partial<UserProfile>;
}

// Role and Permission Types
export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: string[];
  users_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRoleData {
  name: string;
  permissions: string[];
}

export interface UpdateRoleData {
  name?: string;
  permissions?: string[];
}

// API Response Types
export interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationData;
}

export interface UserResponse {
  user: User;
}

export interface RolesResponse {
  roles: Role[];
}

export interface PermissionsResponse {
  permissions: Record<string, Permission[]>;
}
