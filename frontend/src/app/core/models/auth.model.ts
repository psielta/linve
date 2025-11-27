export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  nomeOrganizacao?: string;
}

export interface User {
  id: number;
  nome: string;
  email: string;
}

export interface Organization {
  id: number;
  nome: string;
  slug: string;
}

export interface Membership {
  organization: Organization;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  organizations: Membership[];
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  organizationId: number | null;
  organizationName: string | null;
}
