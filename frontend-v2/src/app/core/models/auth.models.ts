export interface LoginInput {
  email: string;
  senha: string;
}

export interface RegisterInput {
  nome: string;
  email: string;
  senha: string;
  nomeOrganizacao?: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface UserOutput {
  id: number;
  nome: string;
  email: string;
}

export interface OrganizationOutput {
  id: number;
  nome: string;
  slug: string;
  logo?: string;
}

export interface MembershipOutput {
  organization: OrganizationOutput;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserOutput;
  organizations: MembershipOutput[];
  senhaExpirada: boolean;
}
