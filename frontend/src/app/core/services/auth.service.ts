import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, from, tap } from 'rxjs';
import { Router } from '@angular/router';
import {
  Api,
  login,
  register,
  refresh,
  logout,
  AuthResponse,
  LoginInput,
  RegisterInput,
  UserOutput,
  MembershipOutput
} from '../api';

export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserOutput | null;
  organizationId: number | null;
  organizationName: string | null;
  role: UserRole | null;
  memberships: MembershipOutput[];
}

const AUTH_KEY = 'auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>(this.loadAuthState());

  public authState$ = this.authState.asObservable();

  // Signals para uso com computed e effects
  private _currentRole = signal<UserRole | null>(this.authState.value.role);
  private _memberships = signal<MembershipOutput[]>(this.authState.value.memberships || []);

  // Signals públicos readonly
  readonly currentRole = this._currentRole.asReadonly();
  readonly memberships = this._memberships.asReadonly();

  // Computed para verificações de role
  readonly isOwner = computed(() => this._currentRole() === 'OWNER');
  readonly isAdmin = computed(() => ['OWNER', 'ADMIN'].includes(this._currentRole() || ''));
  readonly isMember = computed(() => this._currentRole() !== null);

  constructor(
    private api: Api,
    private router: Router
  ) {}

  get isAuthenticated(): boolean {
    return !!this.authState.value.accessToken;
  }

  get accessToken(): string | null {
    return this.authState.value.accessToken;
  }

  get refreshToken(): string | null {
    return this.authState.value.refreshToken;
  }

  get currentUser(): UserOutput | null {
    return this.authState.value.user;
  }

  get organizationId(): number | null {
    return this.authState.value.organizationId;
  }

  get organizationName(): string | null {
    return this.authState.value.organizationName;
  }

  /**
   * Verifica se o usuário tem um role específico
   */
  hasRole(role: UserRole): boolean {
    return this._currentRole() === role;
  }

  /**
   * Verifica se o usuário tem algum dos roles especificados
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const current = this._currentRole();
    return current !== null && roles.includes(current);
  }

  /**
   * Verifica se o usuário tem pelo menos o role mínimo especificado
   * Hierarquia: OWNER > ADMIN > MEMBER
   */
  hasMinimumRole(role: UserRole): boolean {
    const hierarchy: Record<UserRole, number> = { 'MEMBER': 0, 'ADMIN': 1, 'OWNER': 2 };
    const current = this._currentRole();
    return current !== null && hierarchy[current] >= hierarchy[role];
  }

  /**
   * Troca a organização ativa
   */
  switchOrganization(orgId: number): void {
    const membership = this._memberships().find(m => m.organization?.id === orgId);
    if (membership) {
      const current = this.authState.value;
      const updated: AuthState = {
        ...current,
        organizationId: membership.organization?.id ?? null,
        organizationName: membership.organization?.nome ?? null,
        role: (membership.role as UserRole) ?? null
      };
      this.authState.next(updated);
      this.saveAuthState(updated);
      this._currentRole.set(updated.role);
    }
  }

  /**
   * Retorna as iniciais do usuário para avatar
   */
  getUserInitials(): string {
    const user = this.currentUser;
    if (!user?.nome) return '?';
    const parts = user.nome.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.nome.substring(0, 2).toUpperCase();
  }

  /**
   * Retorna as iniciais da organização para avatar
   */
  getOrgInitials(orgName?: string): string {
    const name = orgName || this.organizationName;
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  login(credentials: LoginInput): Observable<AuthResponse> {
    return from(this.api.invoke(login, { body: credentials })).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  register(data: RegisterInput): Observable<AuthResponse> {
    return from(this.api.invoke(register, { body: data })).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  refreshTokens(): Observable<AuthResponse> {
    return from(this.api.invoke(refresh, { body: { refreshToken: this.refreshToken! } })).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    if (this.refreshToken) {
      this.api.invoke(logout, { body: { refreshToken: this.refreshToken } })
        .catch(() => {});
    }
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  updateTokens(accessToken: string, refreshToken: string): void {
    const current = this.authState.value;
    const updated: AuthState = {
      ...current,
      accessToken,
      refreshToken
    };
    this.authState.next(updated);
    this.saveAuthState(updated);
  }

  private handleAuthResponse(response: AuthResponse): void {
    const firstOrg = response.organizations?.[0];
    const role = (firstOrg?.role as UserRole) ?? null;

    const state: AuthState = {
      accessToken: response.accessToken ?? null,
      refreshToken: response.refreshToken ?? null,
      user: response.user ?? null,
      organizationId: firstOrg?.organization?.id ?? null,
      organizationName: firstOrg?.organization?.nome ?? null,
      role,
      memberships: response.organizations ?? []
    };

    this.authState.next(state);
    this.saveAuthState(state);

    // Atualiza signals
    this._currentRole.set(role);
    this._memberships.set(response.organizations ?? []);
  }

  private clearAuth(): void {
    const emptyState: AuthState = {
      accessToken: null,
      refreshToken: null,
      user: null,
      organizationId: null,
      organizationName: null,
      role: null,
      memberships: []
    };
    this.authState.next(emptyState);
    localStorage.removeItem(AUTH_KEY);

    // Limpa signals
    this._currentRole.set(null);
    this._memberships.set([]);
  }

  private loadAuthState(): AuthState {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Garante que memberships sempre seja um array
        return {
          ...this.getEmptyState(),
          ...parsed,
          memberships: parsed.memberships || []
        };
      } catch {
        return this.getEmptyState();
      }
    }
    return this.getEmptyState();
  }

  private saveAuthState(state: AuthState): void {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  }

  private getEmptyState(): AuthState {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
      organizationId: null,
      organizationName: null,
      role: null,
      memberships: []
    };
  }
}
