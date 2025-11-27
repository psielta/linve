import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-register',
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
          <h1 class="mb-2">Criar Conta</h1>
          <p class="text-muted mb-0">Cadastre-se para começar a organizar suas tarefas</p>
        </div>

        @if (error()) {
          <div class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="fa-solid fa-circle-exclamation me-2"></i>
            <span>{{ error() }}</span>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="nome" class="form-label">Nome</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fa-solid fa-user"></i>
              </span>
              <input
                type="text"
                id="nome"
                class="form-control"
                formControlName="nome"
                placeholder="Seu nome"
                [class.is-invalid]="f['nome'].touched && f['nome'].invalid"
              />
            </div>
            @if (f['nome'].touched && f['nome'].errors?.['required']) {
              <div class="invalid-feedback d-block">Nome é obrigatório</div>
            }
            @if (f['nome'].touched && f['nome'].errors?.['minlength']) {
              <div class="invalid-feedback d-block">Mínimo 2 caracteres</div>
            }
          </div>

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

          <div class="mb-3">
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

          <div class="mb-4">
            <label for="nomeOrganizacao" class="form-label">
              Nome da Organização
              <span class="text-muted fw-normal">(opcional)</span>
            </label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fa-solid fa-building"></i>
              </span>
              <input
                type="text"
                id="nomeOrganizacao"
                class="form-control"
                formControlName="nomeOrganizacao"
                placeholder="Minha Empresa"
              />
            </div>
            <div class="form-text">Se não informado, será criada uma organização pessoal</div>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Criando conta...
            } @else {
              <i class="fa-solid fa-user-plus me-2"></i>
              Criar Conta
            }
          </button>
        </form>

        <div class="text-center mt-4">
          <span class="text-muted">Já tem uma conta?</span>
          <a routerLink="/auth/login" class="ms-1 fw-semibold">Fazer login</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
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
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      nomeOrganizacao: ['']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const data = {
      ...this.form.value,
      nomeOrganizacao: this.form.value.nomeOrganizacao || undefined
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.router.navigate(['/todos']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail || 'Erro ao criar conta. Tente novamente.');
      }
    });
  }

  get f() {
    return this.form.controls;
  }
}
