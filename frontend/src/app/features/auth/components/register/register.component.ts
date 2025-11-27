import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-container">
      <button mat-icon-button class="theme-toggle" (click)="themeService.toggle()" aria-label="Alternar tema">
        <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Criar Conta</mat-card-title>
          <mat-card-subtitle>Cadastre-se para começar a organizar suas tarefas</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (error()) {
            <div class="error-alert">
              <mat-icon>error</mat-icon>
              <span>{{ error() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome</mat-label>
              <input matInput type="text" formControlName="nome" placeholder="Seu nome">
              <mat-icon matSuffix>person</mat-icon>
              @if (f['nome'].touched && f['nome'].errors?.['required']) {
                <mat-error>Nome é obrigatório</mat-error>
              }
              @if (f['nome'].touched && f['nome'].errors?.['minlength']) {
                <mat-error>Mínimo 2 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput type="email" formControlName="email" placeholder="seu@email.com">
              <mat-icon matSuffix>email</mat-icon>
              @if (f['email'].touched && f['email'].errors?.['required']) {
                <mat-error>E-mail é obrigatório</mat-error>
              }
              @if (f['email'].touched && f['email'].errors?.['email']) {
                <mat-error>E-mail inválido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="senha" placeholder="••••••••">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (f['senha'].touched && f['senha'].errors?.['required']) {
                <mat-error>Senha é obrigatória</mat-error>
              }
              @if (f['senha'].touched && f['senha'].errors?.['minlength']) {
                <mat-error>Mínimo 6 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome da Organização (opcional)</mat-label>
              <input matInput type="text" formControlName="nomeOrganizacao" placeholder="Minha Empresa">
              <mat-icon matSuffix>business</mat-icon>
              <mat-hint>Se não informado, será criada uma organização pessoal</mat-hint>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="full-width submit-btn" [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
                <span>Criando conta...</span>
              } @else {
                <ng-container>
                  <mat-icon>person_add</mat-icon>
                  <span>Criar Conta</span>
                </ng-container>
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <span class="switch-text">Já tem uma conta?</span>
          <a mat-button color="accent" routerLink="/auth/login">Fazer login</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      padding: 20px;
      position: relative;
    }

    .theme-toggle {
      position: absolute;
      top: 16px;
      right: 16px;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 24px;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      font-size: 28px !important;
      font-weight: 500;
    }

    mat-card-subtitle {
      margin-top: 8px !important;
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #ffebee;
      color: #c62828;
      border-radius: 8px;
      margin-bottom: 16px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    :host-context(.dark-theme) .error-alert {
      background: #4a1c1c;
      color: #ef9a9a;
    }

    mat-form-field {
      margin-bottom: 8px;
    }

    .submit-btn {
      height: 48px;
      font-size: 16px;
      margin-top: 16px;

      mat-spinner {
        display: inline-block;
        margin-right: 8px;
      }

      mat-icon {
        margin-right: 8px;
      }
    }

    mat-card-actions {
      padding: 16px 0 0 0 !important;
      margin: 0 !important;
    }

    .switch-text {
      color: var(--text-secondary);
      margin-right: 4px;
    }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  hidePassword = signal(true);

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
