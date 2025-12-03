import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BrButton, BrInput, BrMessage, BrCheckbox } from '@govbr-ds/webcomponents-angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    BrButton,
    BrInput,
    BrMessage,
    BrCheckbox
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  magicLinkForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');

  // Magic Link states
  showMagicLinkForm = signal(false);
  magicLinkSent = signal(false);
  magicLinkLoading = signal(false);

  // Password visibility
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]],
      rememberMe: [false]
    });

    this.magicLinkForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, senha, rememberMe } = this.loginForm.value;

    this.authService.login({ email, senha }, rememberMe).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/app']);
      },
      error: (error) => {
        this.loading.set(false);
        if (error.status === 401) {
          this.errorMessage.set('Email ou senha inválidos');
        } else if (error.status === 423) {
          this.errorMessage.set('Conta bloqueada. Entre em contato com o administrador.');
        } else {
          this.errorMessage.set('Erro ao fazer login. Tente novamente.');
        }
      }
    });
  }

  toggleMagicLinkForm(): void {
    this.showMagicLinkForm.update(v => !v);
    this.errorMessage.set('');
    this.magicLinkSent.set(false);
  }

  onRequestMagicLink(): void {
    if (this.magicLinkForm.invalid) {
      this.magicLinkForm.markAllAsTouched();
      return;
    }

    this.magicLinkLoading.set(true);
    this.errorMessage.set('');
    this.magicLinkSent.set(false);

    const { email } = this.magicLinkForm.value;

    this.authService.requestMagicLink(email).subscribe({
      next: () => {
        this.magicLinkLoading.set(false);
        this.magicLinkSent.set(true);
      },
      error: () => {
        this.magicLinkLoading.set(false);
        // Por segurança, sempre mostra sucesso mesmo se email não existe
        this.magicLinkSent.set(true);
      }
    });
  }
}
