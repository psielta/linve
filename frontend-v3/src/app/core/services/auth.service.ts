import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, firstValueFrom, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginInput,
  MembershipOutput,
  RefreshTokenInput,
  RegisterInput,
  UserOutput
} from '../models/auth.models';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';
const ORGANIZATIONS_KEY = 'organizations';
const REMEMBER_ME_KEY = 'remember_me';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  private _user = signal<UserOutput | null>(this.loadUser());
  private _organizations = signal<MembershipOutput[]>(this.loadOrganizations());
  private _isAuthenticated = signal<boolean>(this.hasValidToken());

  private get storage(): Storage {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true' ? localStorage : sessionStorage;
  }

  readonly user = this._user.asReadonly();
  readonly organizations = this._organizations.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  readonly currentUserName = computed(() => this._user()?.nome ?? '');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginInput, rememberMe: boolean = false): Observable<AuthResponse> {
    // Salva preferência de rememberMe ANTES de processar resposta
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        console.error('Login error:', error);
        localStorage.removeItem(REMEMBER_ME_KEY);
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterInput): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error);
      })
    );
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const input: RefreshTokenInput = { refreshToken };
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, input).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        console.error('Refresh error:', error);
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/auth/logout`, { refreshToken }).subscribe({
        error: err => console.error('Logout error:', err)
      });
    }
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Solicita envio do magic link por email.
   * O backend não revela se o email existe ou não (segurança).
   */
  requestMagicLink(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/magic-link`, { email });
  }

  /**
   * Confirma magic link e autentica o usuário.
   */
  confirmMagicLink(token: string, rememberMe: boolean = false): Observable<AuthResponse> {
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/magic-link/confirm`, { token }).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        console.error('Magic link confirm error:', error);
        localStorage.removeItem(REMEMBER_ME_KEY);
        return throwError(() => error);
      })
    );
  }

  getAccessToken(): string | null {
    return this.storage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.storage.getItem(REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this._isAuthenticated();
  }

  addOrganization(membership: MembershipOutput): void {
    const current = this._organizations() ?? [];
    const updated = [...current, membership];
    this.storage.setItem(ORGANIZATIONS_KEY, JSON.stringify(updated));
    this._organizations.set(updated);
  }

  updateOrganization(orgId: number, updatedOrg: { nome: string }): void {
    const current = this._organizations();
    const updated = current.map(m =>
      m.organization.id === orgId
        ? { ...m, organization: { ...m.organization, nome: updatedOrg.nome } }
        : m
    );
    this.storage.setItem(ORGANIZATIONS_KEY, JSON.stringify(updated));
    this._organizations.set(updated);
  }

  updateUser(user: UserOutput): void {
    this.storage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  updateUserAvatar(avatar: string | undefined): void {
    const currentUser = this._user();
    if (currentUser) {
      const updatedUser = { ...currentUser, avatar };
      this.storage.setItem(USER_KEY, JSON.stringify(updatedUser));
      this._user.set(updatedUser);
    }
  }

  updateOrganizationData(orgId: number, org: { nome: string; logo?: string }): void {
    const current = this._organizations();
    const updated = current.map(m =>
      m.organization.id === orgId
        ? { ...m, organization: { ...m.organization, nome: org.nome, logo: org.logo } }
        : m
    );
    this.storage.setItem(ORGANIZATIONS_KEY, JSON.stringify(updated));
    this._organizations.set(updated);
  }

  updateOrganizationLogo(orgId: number, logo: string | undefined): void {
    const current = this._organizations();
    const updated = current.map(m =>
      m.organization.id === orgId
        ? { ...m, organization: { ...m.organization, logo } }
        : m
    );
    this.storage.setItem(ORGANIZATIONS_KEY, JSON.stringify(updated));
    this._organizations.set(updated);
  }

  /**
   * Carrega o perfil do usuário da API.
   * Usado pelo APP_INITIALIZER para garantir que os dados estejam atualizados.
   */
  loadProfile(): Promise<void> {
    console.log('loadProfile chamado');
    console.log('_user:', this._user());
    console.log('_organizations:', this._organizations());
    console.log('hasValidToken:', this.hasValidToken());
    console.log('refreshToken:', this.getRefreshToken());

    // Se já tem dados no storage, não precisa fazer refresh
    if (this._user() && this._organizations().length > 0) {
      console.log('Já tem dados, pulando refresh');
      return Promise.resolve();
    }

    if (!this.hasValidToken()) {
      console.log('Sem token válido');
      return Promise.resolve();
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.log('Sem refresh token');
      return Promise.resolve();
    }

    console.log('Fazendo requisição de refresh...');

    return firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
        tap(response => {
          console.log('Resposta do refresh:', response);
          console.log('User:', response?.user);
          console.log('Organizations:', response?.organizations);
          this.handleAuthResponse(response);
        }),
        catchError((error) => {
          console.error('Erro ao carregar perfil:', error);
          // Não limpa auth aqui - deixa o guard decidir
          return of(null);
        })
      )
    ).then(() => {});
  }

  private handleAuthResponse(response: AuthResponse): void {
    // Garante que sempre salvaremos um array (evita null/undefined vindo do backend)
    const organizations = Array.isArray(response.organizations) ? response.organizations : [];

    this.storage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    this.storage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    this.storage.setItem(USER_KEY, JSON.stringify(response.user));
    this.storage.setItem(ORGANIZATIONS_KEY, JSON.stringify(organizations));

    this._user.set(response.user);
    this._organizations.set(organizations);
    this._isAuthenticated.set(true);
  }

  private clearAuth(): void {
    // Limpa ambos storages para garantir logout completo
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ORGANIZATIONS_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);

    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ORGANIZATIONS_KEY);

    this._user.set(null);
    this._organizations.set([]);
    this._isAuthenticated.set(false);
  }

  private hasValidToken(): boolean {
    // Verifica em ambos storages
    return !!(localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY));
  }

  private loadUser(): UserOutput | null {
    // Verifica em ambos storages
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  private loadOrganizations(): MembershipOutput[] {
    // Verifica em ambos storages
    const orgsStr = localStorage.getItem(ORGANIZATIONS_KEY) || sessionStorage.getItem(ORGANIZATIONS_KEY);
    if (!orgsStr) return [];

    try {
      const parsed = JSON.parse(orgsStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
