import { Component, computed, effect } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        StyleClassModule,
        AppConfigurator,
        MenuModule,
        SelectModule,
        FormsModule,
        ButtonModule,
        AvatarModule,
        MediaUrlPipe
    ],
    template: `
        <div class="layout-topbar">
            <div class="layout-topbar-logo-container">
                <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                    <i class="pi pi-bars"></i>
                </button>
                <a class="layout-topbar-logo" routerLink="/app">
                    <svg class="text-primary" style="width: 2rem; height: 2rem;" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                        <g><g><g><path fill="currentColor" d="M145.6,5.4c-0.8,0.4-1.8,1.3-2.1,2.1c-0.3,0.7-1.4,9-2.4,18.5c-1,9.4-1.9,17-2.1,16.8c-0.1-0.2-2.7-6.9-5.7-15c-3-8.1-5.8-15.2-6.2-15.8c-1.5-2.4-5.2-2.9-7.3-1c-0.5,0.5-1.2,1.7-1.4,2.7c-0.3,1-1.4,14.7-2.5,30.4c-1.1,15.7-2.1,29.9-2.3,31.6l-0.2,2.9l-7.3,0.3c-15.6,0.7-23.6,3-29.3,8.7c-3.1,3-4.8,6-6.3,11.3l-1.2,4.1L41,103.4l-28.5,0.2l-1.3,1.3c-1.3,1.3-1.3,1.5-1.3,6c0.2,11,5.1,20.6,12,23.9c3.9,1.9,11.8,4.2,32.2,9.4c11.7,2.9,23.7,6.2,26.7,7.1c9.8,2.9,16.3,7.1,18.2,11.6c0.5,1.3,1.4,5.3,2,9.1c5.1,33.9,14.5,59.5,26.1,71.1c5.1,5.1,11.9,8.7,15.1,7.9c2-0.5,3.6-2.6,3.6-4.6c0-2.6-1.1-3.7-5.2-5.6c-6.2-2.9-10.7-8.3-15.8-18.7c-6-12.3-10.5-29.3-14.6-54.8c-1.2-7.5-2.9-10.9-7.3-15.2c-5-4.9-11.8-8-25-11.7c-3.3-0.9-14.2-3.7-24.2-6.3c-19.9-5.1-27.3-7.4-29.1-9c-1.9-1.8-3.9-6.3-4.7-10.4l-0.2-1.5h27.4c16.2,0,27.9-0.2,28.6-0.5c1.8-0.7,2.6-2.3,3.4-7c2.4-13.4,7.5-16,32.8-17c8.1-0.3,8.4-0.3,9.5-1.5c1.5-1.5,1.5-1.8,3.4-29.2c0.8-10.6,1.5-19.4,1.6-19.4c0.1,0,2.6,6.5,5.5,14.3c5.9,15.8,6.5,17,9.7,17c2,0,3.7-0.9,4.5-2.5c0.3-0.6,1.3-9.1,2.4-19.1c1.1-10,2-18.1,2.1-18.2c0.2-0.2,4.1,11.7,5.8,17.8c4.3,15.2,6.5,33.4,5.6,47.5c-1.3,19.8-1.3,17.9,0.1,19.5c0.9,1.1,2.6,2,6.9,3.6c10.3,3.9,21.9,10.1,31,16.9c14.7,11.1,27.8,27.2,34.2,42.2c2.9,6.8,3.3,7.6,4.6,8.2c2,0.9,3.9,0.6,5.4-0.9c2.5-2.4,1.9-5.6-3.1-15.7c-8.3-16.9-24.1-34.6-41.1-45.9c-7.9-5.3-18.3-10.7-26-13.6l-3.1-1.1l0.3-3.7c2.1-25.2-0.5-45.6-9-71.3c-4.5-13.7-9.5-25.4-11.6-27.3C149.6,4.8,147.5,4.5,145.6,5.4z"/><path fill="currentColor" d="M100,102.7c-6.6,1.4-12.1,2.7-12.2,2.8c-0.6,0.6,2.9,3.9,5.3,5.2c4.9,2.5,10.4,1.6,14.8-2.4c2.8-2.6,6.2-8.4,4.7-8.3C112.3,100.1,106.6,101.3,100,102.7z"/></g></g></g>
                    </svg>
                    <span class="font-bold text-2xl">LINVE</span>
                </a>
            </div>

            <div class="layout-topbar-actions">
                <!-- Organization Selector -->
                @if (orgOptions.length > 1) {
                    <p-select
                        [options]="orgOptions"
                        [ngModel]="currentOrgId"
                        (ngModelChange)="onOrganizationChange($event)"
                        optionLabel="label"
                        optionValue="value"
                        [style]="{ minWidth: '180px' }"
                        class="hidden lg:flex"
                    >
                        <ng-template pTemplate="selectedItem" let-selected>
                            <div class="flex items-center gap-2" *ngIf="selected">
                                @if (selected.logo) {
                                    <img [src]="selected.logo | mediaUrl" class="w-6 h-6 rounded object-cover" />
                                } @else {
                                    <i class="pi pi-building text-surface-500"></i>
                                }
                                <span>{{ selected.label }}</span>
                            </div>
                        </ng-template>
                        <ng-template pTemplate="item" let-item>
                            <div class="flex items-center gap-2">
                                @if (item.logo) {
                                    <img [src]="item.logo | mediaUrl" class="w-6 h-6 rounded object-cover" />
                                } @else {
                                    <i class="pi pi-building text-surface-500"></i>
                                }
                                <span>{{ item.label }}</span>
                            </div>
                        </ng-template>
                    </p-select>
                }

                <!-- Theme Toggle, Colors & User Menu -->
                <div class="layout-config-menu">
                    <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                        <i [class]="layoutService.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'"></i>
                    </button>
                    <div class="relative">
                        <button
                            class="layout-topbar-action layout-topbar-action-highlight"
                            pStyleClass="@next"
                            enterFromClass="hidden"
                            enterActiveClass="animate-scalein"
                            leaveToClass="hidden"
                            leaveActiveClass="animate-fadeout"
                            [hideOnOutsideClick]="true"
                        >
                            <i class="pi pi-palette"></i>
                        </button>
                        <app-configurator />
                    </div>
                    <button type="button" class="layout-topbar-action" (click)="userMenu.toggle($event)">
                        @if (userAvatar()) {
                            <p-avatar [image]="$any(userAvatar() | mediaUrl)" shape="circle" />
                        } @else {
                            <p-avatar [label]="userInitials()" shape="circle" styleClass="bg-primary text-primary-contrast" />
                        }
                    </button>
                </div>
                <p-menu #userMenu [popup]="true" [model]="userMenuItems"></p-menu>
            </div>
        </div>
    `
})
export class AppTopbar {
    userMenuItems: MenuItem[] = [];

    userAvatar = computed(() => this.authService.user()?.avatar);

    userInitials = computed(() => {
        const nome = this.authService.user()?.nome || '';
        const parts = nome.split(' ').filter(p => p.length > 0);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return nome.substring(0, 2).toUpperCase() || 'U';
    });

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private tenantService: TenantService,
        private router: Router
    ) {
        // Rebuild menu when user or organization changes
        effect(() => {
            // Subscribe to reactive signals
            const user = this.authService.user();
            const orgId = this.tenantService.currentOrganizationId();
            const orgName = this.tenantService.currentOrganizationName();
            const role = this.tenantService.currentRole();

            // Rebuild menu with current data
            this.userMenuItems = this.buildUserMenu(user, orgName || '', role || '');
        });
    }

    get currentOrgId() {
        return this.tenantService.currentOrganizationId();
    }

    get orgOptions() {
        return this.authService.organizations().map(m => ({
            label: m.organization.nome,
            value: m.organization.id,
            logo: m.organization.logo
        }));
    }

    private buildUserMenu(user: any, orgName: string, role: string): MenuItem[] {
        return [
            {
                label: user?.nome || 'Usuário',
                icon: 'pi pi-user',
                disabled: true
            },
            {
                label: user?.email || '',
                icon: 'pi pi-envelope',
                disabled: true
            },
            {
                label: orgName || '',
                icon: 'pi pi-building',
                disabled: true
            },
            {
                separator: true
            },
            {
                label: 'Minha Conta',
                icon: 'pi pi-cog',
                command: () => {
                    this.router.navigate(['/app/account']);
                }
            },
            {
                separator: true
            },
            {
                label: 'Sair',
                icon: 'pi pi-sign-out',
                command: () => {
                    this.logout();
                }
            }
        ];
    }

    onOrganizationChange(orgId: number): void {
        this.tenantService.setOrganization(orgId);
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    logout() {
        this.authService.logout();
    }
}
