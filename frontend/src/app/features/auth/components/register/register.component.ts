import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Criar Conta</h1>
        <p class="subtitle">Cadastre-se para começar a organizar suas tarefas</p>

        @if (error()) {
          <div class="error-message">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="nome">Nome</label>
            <input
              type="text"
              id="nome"
              formControlName="nome"
              placeholder="Seu nome"
              [class.invalid]="f['nome'].touched && f['nome'].invalid"
            />
            @if (f['nome'].touched && f['nome'].errors?.['required']) {
              <span class="error">Nome é obrigatório</span>
            }
            @if (f['nome'].touched && f['nome'].errors?.['minlength']) {
              <span class="error">Mínimo 2 caracteres</span>
            }
          </div>

          <div class="form-group">
            <label for="email">E-mail</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="seu@email.com"
              [class.invalid]="f['email'].touched && f['email'].invalid"
            />
            @if (f['email'].touched && f['email'].errors?.['required']) {
              <span class="error">E-mail é obrigatório</span>
            }
            @if (f['email'].touched && f['email'].errors?.['email']) {
              <span class="error">E-mail inválido</span>
            }
          </div>

          <div class="form-group">
            <label for="senha">Senha</label>
            <input
              type="password"
              id="senha"
              formControlName="senha"
              placeholder="••••••••"
              [class.invalid]="f['senha'].touched && f['senha'].invalid"
            />
            @if (f['senha'].touched && f['senha'].errors?.['required']) {
              <span class="error">Senha é obrigatória</span>
            }
            @if (f['senha'].touched && f['senha'].errors?.['minlength']) {
              <span class="error">Mínimo 6 caracteres</span>
            }
          </div>

          <div class="form-group">
            <label for="nomeOrganizacao">Nome da Organização <span class="optional">(opcional)</span></label>
            <input
              type="text"
              id="nomeOrganizacao"
              formControlName="nomeOrganizacao"
              placeholder="Minha Empresa"
            />
            <span class="hint">Se não informado, será criada uma organização pessoal</span>
          </div>

          <button type="submit" [disabled]="loading()" class="btn-primary">
            @if (loading()) {
              <span class="spinner"></span> Criando conta...
            } @else {
              Criar Conta
            }
          </button>
        </form>

        <p class="switch-auth">
          Já tem uma conta? <a routerLink="/auth/login">Fazer login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .auth-card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 28px;
      font-weight: 700;
    }

    .subtitle {
      color: #666;
      margin: 0 0 24px 0;
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      color: #444;
      font-weight: 500;
    }

    .optional {
      color: #999;
      font-weight: 400;
      font-size: 13px;
    }

    .hint {
      color: #888;
      font-size: 12px;
      margin-top: 4px;
      display: block;
    }

    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: #667eea;
      }

      &.invalid {
        border-color: #e53935;
      }
    }

    .error {
      color: #e53935;
      font-size: 12px;
      margin-top: 4px;
      display: block;
    }

    .btn-primary {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .switch-auth {
      text-align: center;
      margin-top: 24px;
      color: #666;

      a {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
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
