import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  private _user = signal<UserOutput | null>(this.loadUser());
  private _organizations = signal<MembershipOutput[]>(this.loadOrganizations());
  private _isAuthenticated = signal<boolean>(this.hasValidToken());

  readonly user = this._user.asReadonly();
  readonly organizations = this._organizations.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  readonly currentUserName = computed(() => this._user()?.nome ?? '');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginInput): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        console.error('Login error:', error);
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

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this._isAuthenticated();
  }

  addOrganization(membership: MembershipOutput): void {
    const current = this._organizations();
    const updated = [...current, membership];
    localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(updated));
    this._organizations.set(updated);
  }

  updateOrganization(orgId: number, updatedOrg: { nome: string }): void {
    const current = this._organizations();
    const updated = current.map(m =>
      m.organization.id === orgId
        ? { ...m, organization: { ...m.organization, nome: updatedOrg.nome } }
        : m
    );
    localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(updated));
    this._organizations.set(updated);
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(response.organizations));

    this._user.set(response.user);
    this._organizations.set(response.organizations);
    this._isAuthenticated.set(true);
  }

  private clearAuth(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ORGANIZATIONS_KEY);

    this._user.set(null);
    this._organizations.set([]);
    this._isAuthenticated.set(false);
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private loadUser(): UserOutput | null {
    const userStr = localStorage.getItem(USER_KEY);
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
    const orgsStr = localStorage.getItem(ORGANIZATIONS_KEY);
    if (orgsStr) {
      try {
        return JSON.parse(orgsStr);
      } catch {
        return [];
      }
    }
    return [];
  }
}
