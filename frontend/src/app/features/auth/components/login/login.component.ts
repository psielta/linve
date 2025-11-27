import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <!-- Theme Toggle -->
      <button class="theme-toggle position-fixed top-0 end-0 m-3" (click)="themeService.cycle()" type="button">
        <i class="fa-solid" [ngClass]="themeService.getIcon()"></i>
      </button>

      <div class="auth-card animate__animated animate__fadeIn">
        <div class="text-center mb-4">
          <h1 class="mb-2">Login</h1>
          <p class="text-muted mb-0">Entre na sua conta para gerenciar suas tarefas</p>
        </div>

        @if (error()) {
          <div class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="fa-solid fa-circle-exclamation me-2"></i>
            <span>{{ error() }}</span>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="email" class="form-label">E-mail</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fa-solid fa-envelope"></i>
              </span>
              <input
                type="email"
                id="email"
                class="form-control"
                formControlName="email"
                placeholder="seu@email.com"
                [class.is-invalid]="f['email'].touched && f['email'].invalid"
              />
            </div>
            @if (f['email'].touched && f['email'].errors?.['required']) {
              <div class="invalid-feedback d-block">E-mail é obrigatório</div>
            }
            @if (f['email'].touched && f['email'].errors?.['email']) {
              <div class="invalid-feedback d-block">E-mail inválido</div>
            }
          </div>

          <div class="mb-4">
            <label for="senha" class="form-label">Senha</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fa-solid fa-lock"></i>
              </span>
              <input
                [type]="showPassword() ? 'text' : 'password'"
                id="senha"
                class="form-control"
                formControlName="senha"
                placeholder="Digite sua senha"
                [class.is-invalid]="f['senha'].touched && f['senha'].invalid"
              />
              <button
                class="btn btn-light"
                type="button"
                (click)="showPassword.set(!showPassword())"
              >
                <i class="fa-solid" [ngClass]="showPassword() ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
            @if (f['senha'].touched && f['senha'].errors?.['required']) {
              <div class="invalid-feedback d-block">Senha é obrigatória</div>
            }
            @if (f['senha'].touched && f['senha'].errors?.['minlength']) {
              <div class="invalid-feedback d-block">Mínimo 6 caracteres</div>
            }
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Entrando...
            } @else {
              <i class="fa-solid fa-right-to-bracket me-2"></i>
              Entrar
            }
          </button>
        </form>

        <div class="text-center mt-4">
          <span class="text-muted">Não tem uma conta?</span>
          <a routerLink="/auth/register" class="ms-1 fw-semibold">Criar conta</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/todos']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    });
  }

  get f() {
    return this.form.controls;
  }
}
