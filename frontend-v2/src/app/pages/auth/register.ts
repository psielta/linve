import { Component, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        ButtonModule,
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
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-12 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Criar Conta</div>
                            <span class="text-muted-color font-medium">Preencha os dados para se registrar</span>
                        </div>

                        @if (errorMessage()) {
                            <p-message severity="error" [text]="errorMessage()" styleClass="w-full mb-6" />
                        }

                        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                            <label for="nome" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Nome</label>
                            <input
                                pInputText
                                id="nome"
                                type="text"
                                placeholder="Digite seu nome"
                                class="w-full md:w-120 mb-2"
                                formControlName="nome"
                            />
                            @if (registerForm.get('nome')?.invalid && registerForm.get('nome')?.touched) {
                                <small class="text-red-500 block mb-4">Nome é obrigatório (mínimo 2 caracteres)</small>
                            } @else {
                                <div class="mb-4"></div>
                            }

                            <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input
                                pInputText
                                id="email"
                                type="email"
                                placeholder="Digite seu email"
                                class="w-full md:w-120 mb-2"
                                formControlName="email"
                            />
                            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                                <small class="text-red-500 block mb-4">Email válido é obrigatório</small>
                            } @else {
                                <div class="mb-4"></div>
                            }

                            <label for="senha" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Senha</label>
                            <p-password
                                id="senha"
                                formControlName="senha"
                                placeholder="Digite sua senha"
                                [toggleMask]="true"
                                styleClass="mb-2"
                                [fluid]="true"
                                [feedback]="true"
                            />
                            @if (registerForm.get('senha')?.invalid && registerForm.get('senha')?.touched) {
                                <small class="text-red-500 block mb-4">Senha é obrigatória (mínimo 6 caracteres)</small>
                            } @else {
                                <div class="mb-4"></div>
                            }

                            <label for="confirmarSenha" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Confirmar Senha</label>
                            <p-password
                                id="confirmarSenha"
                                formControlName="confirmarSenha"
                                placeholder="Confirme sua senha"
                                [toggleMask]="true"
                                styleClass="mb-2"
                                [fluid]="true"
                                [feedback]="false"
                            />
                            @if (registerForm.get('confirmarSenha')?.touched && registerForm.hasError('passwordMismatch')) {
                                <small class="text-red-500 block mb-4">As senhas não conferem</small>
                            } @else {
                                <div class="mb-4"></div>
                            }

                            <label for="nomeOrganizacao" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">
                                Nome da Organização <span class="text-muted-color text-sm">(opcional)</span>
                            </label>
                            <input
                                pInputText
                                id="nomeOrganizacao"
                                type="text"
                                placeholder="Ex: Minha Empresa"
                                class="w-full md:w-120 mb-8"
                                formControlName="nomeOrganizacao"
                            />

                            <p-button
                                type="submit"
                                label="Criar Conta"
                                styleClass="w-full"
                                [loading]="loading()"
                                [disabled]="registerForm.invalid || loading()"
                            />
                        </form>

                        <div class="mt-6 text-center">
                            <span class="text-muted-color">Já tem uma conta? </span>
                            <a routerLink="/auth/login" class="text-primary font-medium cursor-pointer">Entrar</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Register {
    registerForm: FormGroup;
    loading = signal(false);
    errorMessage = signal('');

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email]],
            senha: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
            confirmarSenha: ['', [Validators.required]],
            nomeOrganizacao: ['', [Validators.maxLength(100)]]
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const senha = control.get('senha');
        const confirmarSenha = control.get('confirmarSenha');

        if (senha && confirmarSenha && senha.value !== confirmarSenha.value) {
            return { passwordMismatch: true };
        }
        return null;
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.errorMessage.set('');

        const { nome, email, senha, nomeOrganizacao } = this.registerForm.value;

        this.authService.register({
            nome,
            email,
            senha,
            nomeOrganizacao: nomeOrganizacao || undefined
        }).subscribe({
            next: () => {
                this.loading.set(false);
                this.router.navigate(['/app']);
            },
            error: (error) => {
                this.loading.set(false);
                if (error.status === 409) {
                    this.errorMessage.set('Este email já está cadastrado');
                } else if (error.error?.detail) {
                    this.errorMessage.set(error.error.detail);
                } else {
                    this.errorMessage.set('Erro ao criar conta. Tente novamente.');
                }
            }
        });
    }
}
