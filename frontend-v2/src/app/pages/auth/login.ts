import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { FluidModule } from 'primeng/fluid';
import { DividerModule } from 'primeng/divider';
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
        FluidModule,
        DividerModule,
        AppFloatingConfigurator
    ],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 min-h-screen min-w-screen overflow-hidden px-6 lg:px-20 py-8 flex items-center justify-center">
            <div class="grid grid-cols-12 w-full">
                <div class="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4 xl:col-span-4 xl:col-start-5">
                    <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                        <div class="w-full bg-surface-0 dark:bg-surface-900 py-12 px-6 md:px-12" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <a routerLink="/" class="inline-block cursor-pointer">
                                <svg class="text-primary mx-auto mb-4" style="width: 4rem; height: 4rem;" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                                    <g><g><g><path fill="currentColor" d="M145.6,5.4c-0.8,0.4-1.8,1.3-2.1,2.1c-0.3,0.7-1.4,9-2.4,18.5c-1,9.4-1.9,17-2.1,16.8c-0.1-0.2-2.7-6.9-5.7-15c-3-8.1-5.8-15.2-6.2-15.8c-1.5-2.4-5.2-2.9-7.3-1c-0.5,0.5-1.2,1.7-1.4,2.7c-0.3,1-1.4,14.7-2.5,30.4c-1.1,15.7-2.1,29.9-2.3,31.6l-0.2,2.9l-7.3,0.3c-15.6,0.7-23.6,3-29.3,8.7c-3.1,3-4.8,6-6.3,11.3l-1.2,4.1L41,103.4l-28.5,0.2l-1.3,1.3c-1.3,1.3-1.3,1.5-1.3,6c0.2,11,5.1,20.6,12,23.9c3.9,1.9,11.8,4.2,32.2,9.4c11.7,2.9,23.7,6.2,26.7,7.1c9.8,2.9,16.3,7.1,18.2,11.6c0.5,1.3,1.4,5.3,2,9.1c5.1,33.9,14.5,59.5,26.1,71.1c5.1,5.1,11.9,8.7,15.1,7.9c2-0.5,3.6-2.6,3.6-4.6c0-2.6-1.1-3.7-5.2-5.6c-6.2-2.9-10.7-8.3-15.8-18.7c-6-12.3-10.5-29.3-14.6-54.8c-1.2-7.5-2.9-10.9-7.3-15.2c-5-4.9-11.8-8-25-11.7c-3.3-0.9-14.2-3.7-24.2-6.3c-19.9-5.1-27.3-7.4-29.1-9c-1.9-1.8-3.9-6.3-4.7-10.4l-0.2-1.5h27.4c16.2,0,27.9-0.2,28.6-0.5c1.8-0.7,2.6-2.3,3.4-7c2.4-13.4,7.5-16,32.8-17c8.1-0.3,8.4-0.3,9.5-1.5c1.5-1.5,1.5-1.8,3.4-29.2c0.8-10.6,1.5-19.4,1.6-19.4c0.1,0,2.6,6.5,5.5,14.3c5.9,15.8,6.5,17,9.7,17c2,0,3.7-0.9,4.5-2.5c0.3-0.6,1.3-9.1,2.4-19.1c1.1-10,2-18.1,2.1-18.2c0.2-0.2,4.1,11.7,5.8,17.8c4.3,15.2,6.5,33.4,5.6,47.5c-1.3,19.8-1.3,17.9,0.1,19.5c0.9,1.1,2.6,2,6.9,3.6c10.3,3.9,21.9,10.1,31,16.9c14.7,11.1,27.8,27.2,34.2,42.2c2.9,6.8,3.3,7.6,4.6,8.2c2,0.9,3.9,0.6,5.4-0.9c2.5-2.4,1.9-5.6-3.1-15.7c-8.3-16.9-24.1-34.6-41.1-45.9c-7.9-5.3-18.3-10.7-26-13.6l-3.1-1.1l0.3-3.7c2.1-25.2-0.5-45.6-9-71.3c-4.5-13.7-9.5-25.4-11.6-27.3C149.6,4.8,147.5,4.5,145.6,5.4z"/><path fill="currentColor" d="M100,102.7c-6.6,1.4-12.1,2.7-12.2,2.8c-0.6,0.6,2.9,3.9,5.3,5.2c4.9,2.5,10.4,1.6,14.8-2.4c2.8-2.6,6.2-8.4,4.7-8.3C112.3,100.1,106.6,101.3,100,102.7z"/></g></g></g>
                                </svg>
                            </a>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Bem-vindo ao Linve!</div>
                            <span class="text-muted-color font-medium">Entre para continuar</span>
                        </div>

                        @if (errorMessage()) {
                            <p-message severity="error" [text]="errorMessage()" styleClass="w-full mb-6" />
                        }

                        @if (magicLinkSent()) {
                            <p-message severity="success" text="Link de acesso enviado! Verifique seu email." styleClass="w-full mb-6" />
                        }

                        <p-fluid>
                            @if (!showMagicLinkForm()) {
                                <!-- Formulário de login com senha -->
                                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label for="email" class="text-surface-900 dark:text-surface-0 font-medium">Email</label>
                                        <input pInputText id="email" type="email" placeholder="Digite seu email" formControlName="email" />
                                        @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                                            <small class="text-red-500">Email é obrigatório</small>
                                        }
                                    </div>

                                    <div class="flex flex-col gap-2">
                                        <label for="password" class="text-surface-900 dark:text-surface-0 font-medium">Senha</label>
                                        <p-password id="password" formControlName="senha" placeholder="Digite sua senha" [toggleMask]="true" [feedback]="false" />
                                        @if (loginForm.get('senha')?.invalid && loginForm.get('senha')?.touched) {
                                            <small class="text-red-500">Senha é obrigatória</small>
                                        }
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <p-checkbox formControlName="rememberMe" id="rememberme" binary />
                                        <label for="rememberme">Lembrar de mim</label>
                                    </div>

                                    <p-button type="submit" label="Entrar" [loading]="loading()" [disabled]="loginForm.invalid || loading()" />
                                </form>

                                <p-divider align="center">
                                    <span class="text-muted-color text-sm">ou</span>
                                </p-divider>

                                <p-button label="Entrar com Magic Link" icon="pi pi-envelope" [outlined]="true" styleClass="w-full" (onClick)="toggleMagicLinkForm()" />
                            } @else {
                                <!-- Formulário de Magic Link -->
                                <form [formGroup]="magicLinkForm" (ngSubmit)="onRequestMagicLink()" class="flex flex-col gap-4">
                                    <div class="flex flex-col gap-2">
                                        <label for="magicEmail" class="text-surface-900 dark:text-surface-0 font-medium">Email</label>
                                        <input pInputText id="magicEmail" type="email" placeholder="Digite seu email" formControlName="email" />
                                        @if (magicLinkForm.get('email')?.invalid && magicLinkForm.get('email')?.touched) {
                                            <small class="text-red-500">Email é obrigatório</small>
                                        }
                                    </div>

                                    <p-button type="submit" label="Enviar Link de Acesso" icon="pi pi-send" [loading]="magicLinkLoading()" [disabled]="magicLinkForm.invalid || magicLinkLoading()" />
                                </form>

                                <div class="mt-4 text-center">
                                    <a (click)="toggleMagicLinkForm()" class="text-primary font-medium cursor-pointer">
                                        <i class="pi pi-arrow-left mr-2"></i>Voltar ao login com senha
                                    </a>
                                </div>
                            }
                        </p-fluid>

                        <div class="mt-6 text-center">
                            <span class="text-muted-color">Não tem uma conta? </span>
                            <a routerLink="/auth/register" class="text-primary font-medium cursor-pointer">Criar conta</a>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    loginForm: FormGroup;
    magicLinkForm: FormGroup;
    loading = signal(false);
    errorMessage = signal('');

    // Magic Link states
    showMagicLinkForm = signal(false);
    magicLinkSent = signal(false);
    magicLinkLoading = signal(false);

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
