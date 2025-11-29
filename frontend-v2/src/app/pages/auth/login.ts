import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        PasswordModule,
        ReactiveFormsModule,
        RouterModule,
        RippleModule,
        MessageModule,
        AppFloatingConfigurator
    ],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Bem-vindo ao Linve!</div>
                            <span class="text-muted-color font-medium">Entre para continuar</span>
                        </div>

                        @if (errorMessage()) {
                            <p-message severity="error" [text]="errorMessage()" styleClass="w-full mb-6" />
                        }

                        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                            <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input
                                pInputText
                                id="email"
                                type="email"
                                placeholder="Digite seu email"
                                class="w-full md:w-120 mb-2"
                                formControlName="email"
                                [class.ng-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                            />
                            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                                <small class="text-red-500 block mb-4">Email é obrigatório</small>
                            } @else {
                                <div class="mb-6"></div>
                            }

                            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Senha</label>
                            <p-password
                                id="password"
                                formControlName="senha"
                                placeholder="Digite sua senha"
                                [toggleMask]="true"
                                styleClass="mb-2"
                                [fluid]="true"
                                [feedback]="false"
                            />
                            @if (loginForm.get('senha')?.invalid && loginForm.get('senha')?.touched) {
                                <small class="text-red-500 block mb-4">Senha é obrigatória</small>
                            } @else {
                                <div class="mb-4"></div>
                            }

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox formControlName="rememberMe" id="rememberme" binary class="mr-2" />
                                    <label for="rememberme">Lembrar de mim</label>
                                </div>
                            </div>

                            <p-button
                                type="submit"
                                label="Entrar"
                                styleClass="w-full"
                                [loading]="loading()"
                                [disabled]="loginForm.invalid || loading()"
                            />
                        </form>

                        <div class="mt-6 text-center">
                            <span class="text-muted-color">Não tem uma conta? </span>
                            <a routerLink="/auth/register" class="text-primary font-medium cursor-pointer">Criar conta</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    loginForm: FormGroup;
    loading = signal(false);
    errorMessage = signal('');

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
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.errorMessage.set('');

        const { email, senha } = this.loginForm.value;

        this.authService.login({ email, senha }).subscribe({
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
}
