import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthState, LoginRequest, RegisterRequest, User } from '../models/auth.model';

const AUTH_KEY = 'auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private authState = new BehaviorSubject<AuthState>(this.loadAuthState());

  public authState$ = this.authState.asObservable();

  constructor(
    private http: HttpClient,
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

  get currentUser(): User | null {
    return this.authState.value.user;
  }

  get organizationId(): number | null {
    return this.authState.value.organizationId;
  }

  get organizationName(): string | null {
    return this.authState.value.organizationName;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {
      refreshToken: this.refreshToken
    }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    if (this.refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken: this.refreshToken })
        .subscribe({ error: () => {} });
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

    const state: AuthState = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
      organizationId: firstOrg?.organization?.id ?? null,
      organizationName: firstOrg?.organization?.nome ?? null
    };

    this.authState.next(state);
    this.saveAuthState(state);
  }

  private clearAuth(): void {
    const emptyState: AuthState = {
      accessToken: null,
      refreshToken: null,
      user: null,
      organizationId: null,
      organizationName: null
    };
    this.authState.next(emptyState);
    localStorage.removeItem(AUTH_KEY);
  }

  private loadAuthState(): AuthState {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
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
      organizationName: null
    };
  }
}
