import { Injectable } from '@angular/core';
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
  UserOutput
} from '../api';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserOutput | null;
  organizationId: number | null;
  organizationName: string | null;
}

const AUTH_KEY = 'auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>(this.loadAuthState());

  public authState$ = this.authState.asObservable();

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

    const state: AuthState = {
      accessToken: response.accessToken ?? null,
      refreshToken: response.refreshToken ?? null,
      user: response.user ?? null,
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
