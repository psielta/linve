import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../core/services/auth.service';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-magic-link-confirm',
    standalone: true,
    imports: [
        RouterModule,
        ButtonModule,
        MessageModule,
        ProgressSpinnerModule,
        AppFloatingConfigurator
    ],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 min-h-screen min-w-screen overflow-hidden px-6 lg:px-20 py-8 flex items-center justify-center">
            <div class="grid grid-cols-12 w-full">
                <div class="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4 xl:col-span-4 xl:col-start-5">
                    <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                        <div class="w-full bg-surface-0 dark:bg-surface-900 py-12 px-6 md:px-12" style="border-radius: 53px">
                            <div class="text-center">
                                <a routerLink="/" class="inline-block cursor-pointer">
                                    <svg class="text-primary mx-auto mb-4" style="width: 4rem; height: 4rem;" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                                        <g><g><g><path fill="currentColor" d="M145.6,5.4c-0.8,0.4-1.8,1.3-2.1,2.1c-0.3,0.7-1.4,9-2.4,18.5c-1,9.4-1.9,17-2.1,16.8c-0.1-0.2-2.7-6.9-5.7-15c-3-8.1-5.8-15.2-6.2-15.8c-1.5-2.4-5.2-2.9-7.3-1c-0.5,0.5-1.2,1.7-1.4,2.7c-0.3,1-1.4,14.7-2.5,30.4c-1.1,15.7-2.1,29.9-2.3,31.6l-0.2,2.9l-7.3,0.3c-15.6,0.7-23.6,3-29.3,8.7c-3.1,3-4.8,6-6.3,11.3l-1.2,4.1L41,103.4l-28.5,0.2l-1.3,1.3c-1.3,1.3-1.3,1.5-1.3,6c0.2,11,5.1,20.6,12,23.9c3.9,1.9,11.8,4.2,32.2,9.4c11.7,2.9,23.7,6.2,26.7,7.1c9.8,2.9,16.3,7.1,18.2,11.6c0.5,1.3,1.4,5.3,2,9.1c5.1,33.9,14.5,59.5,26.1,71.1c5.1,5.1,11.9,8.7,15.1,7.9c2-0.5,3.6-2.6,3.6-4.6c0-2.6-1.1-3.7-5.2-5.6c-6.2-2.9-10.7-8.3-15.8-18.7c-6-12.3-10.5-29.3-14.6-54.8c-1.2-7.5-2.9-10.9-7.3-15.2c-5-4.9-11.8-8-25-11.7c-3.3-0.9-14.2-3.7-24.2-6.3c-19.9-5.1-27.3-7.4-29.1-9c-1.9-1.8-3.9-6.3-4.7-10.4l-0.2-1.5h27.4c16.2,0,27.9-0.2,28.6-0.5c1.8-0.7,2.6-2.3,3.4-7c2.4-13.4,7.5-16,32.8-17c8.1-0.3,8.4-0.3,9.5-1.5c1.5-1.5,1.5-1.8,3.4-29.2c0.8-10.6,1.5-19.4,1.6-19.4c0.1,0,2.6,6.5,5.5,14.3c5.9,15.8,6.5,17,9.7,17c2,0,3.7-0.9,4.5-2.5c0.3-0.6,1.3-9.1,2.4-19.1c1.1-10,2-18.1,2.1-18.2c0.2-0.2,4.1,11.7,5.8,17.8c4.3,15.2,6.5,33.4,5.6,47.5c-1.3,19.8-1.3,17.9,0.1,19.5c0.9,1.1,2.6,2,6.9,3.6c10.3,3.9,21.9,10.1,31,16.9c14.7,11.1,27.8,27.2,34.2,42.2c2.9,6.8,3.3,7.6,4.6,8.2c2,0.9,3.9,0.6,5.4-0.9c2.5-2.4,1.9-5.6-3.1-15.7c-8.3-16.9-24.1-34.6-41.1-45.9c-7.9-5.3-18.3-10.7-26-13.6l-3.1-1.1l0.3-3.7c2.1-25.2-0.5-45.6-9-71.3c-4.5-13.7-9.5-25.4-11.6-27.3C149.6,4.8,147.5,4.5,145.6,5.4z"/><path fill="currentColor" d="M100,102.7c-6.6,1.4-12.1,2.7-12.2,2.8c-0.6,0.6,2.9,3.9,5.3,5.2c4.9,2.5,10.4,1.6,14.8-2.4c2.8-2.6,6.2-8.4,4.7-8.3C112.3,100.1,106.6,101.3,100,102.7z"/></g></g></g>
                                    </svg>
                                </a>

                                @if (loading()) {
                                    <div class="mt-8">
                                        <p-progressSpinner styleClass="w-12 h-12" />
                                        <p class="text-surface-600 dark:text-surface-300 mt-4">Validando seu acesso...</p>
                                    </div>
                                }

                                @if (error()) {
                                    <div class="mt-8">
                                        <i class="pi pi-times-circle text-red-500 text-5xl mb-4"></i>
                                        <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-4">Acesso Negado</h2>
                                        <p-message severity="error" [text]="error()" styleClass="w-full mb-6" />
                                        <p-button label="Voltar ao Login" routerLink="/auth/login" styleClass="w-full mt-4" />
                                    </div>
                                }

                                @if (success()) {
                                    <div class="mt-8">
                                        <i class="pi pi-check-circle text-green-500 text-5xl mb-4"></i>
                                        <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-4">Acesso Autorizado!</h2>
                                        <p class="text-surface-600 dark:text-surface-300">Redirecionando...</p>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class MagicLinkConfirm implements OnInit {
    loading = signal(true);
    error = signal('');
    success = signal(false);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        const token = this.route.snapshot.queryParamMap.get('token');

        if (!token) {
            this.loading.set(false);
            this.error.set('Link de acesso inválido. Token não encontrado.');
            return;
        }

        this.authService.confirmMagicLink(token, true).subscribe({
            next: () => {
                this.loading.set(false);
                this.success.set(true);
                setTimeout(() => {
                    this.router.navigate(['/app']);
                }, 1000);
            },
            error: (err) => {
                this.loading.set(false);
                if (err.status === 401) {
                    this.error.set('Link de acesso inválido ou expirado. Solicite um novo link.');
                } else if (err.status === 423) {
                    this.error.set('Conta bloqueada. Entre em contato com o administrador.');
                } else {
                    this.error.set('Erro ao validar acesso. Tente novamente.');
                }
            }
        });
    }
}
