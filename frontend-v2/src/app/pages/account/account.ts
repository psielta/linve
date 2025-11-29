import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule, FileSelectEvent } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { OrganizationService } from '../../core/services/organization.service';
import { MembershipOutput } from '../../core/models/auth.models';
import { ApiConfiguration } from '../../core/api/api-configuration';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';
import { atualizarAvatar1 } from '../../core/api/fn/conta/atualizar-avatar-1';
import { removerAvatar1 } from '../../core/api/fn/conta/remover-avatar-1';
import { map } from 'rxjs';

@Component({
    selector: 'app-account',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TagModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        AvatarModule,
        FileUploadModule,
        ToastModule,
        MediaUrlPipe
    ],
    providers: [MessageService],
    template: `
        <p-toast />
        <div class="grid grid-cols-12 gap-8">
            <!-- Avatar e Informações Pessoais -->
            <div class="col-span-12 lg:col-span-6">
                <div class="card">
                    <div class="font-semibold text-xl mb-6">Informações Pessoais</div>

                    <!-- Seção Avatar -->
                    <div class="flex items-center gap-6 mb-6 pb-6 border-b border-surface">
                        <div class="relative">
                            @if (userAvatar()) {
                                <p-avatar [image]="$any(userAvatar() | mediaUrl)" size="xlarge" shape="circle" />
                            } @else {
                                <p-avatar [label]="userInitials()" size="xlarge" shape="circle"
                                    styleClass="bg-primary text-primary-contrast text-2xl" />
                            }
                        </div>
                        <div class="flex flex-col gap-2">
                            <p-fileUpload
                                mode="basic"
                                accept="image/png,image/jpeg,image/webp"
                                [maxFileSize]="5000000"
                                chooseLabel="Alterar foto"
                                chooseIcon="pi pi-camera"
                                [auto]="true"
                                [customUpload]="true"
                                (uploadHandler)="onAvatarUpload($event)"
                            />
                            @if (userAvatar()) {
                                <p-button
                                    label="Remover foto"
                                    icon="pi pi-trash"
                                    severity="danger"
                                    [text]="true"
                                    size="small"
                                    [loading]="isRemovingAvatar()"
                                    (click)="removeAvatar()"
                                />
                            }
                        </div>
                    </div>

                    <!-- Dados do Usuário -->
                    <div class="flex flex-col gap-4">
                        <div>
                            <span class="text-surface-500 dark:text-surface-400 text-sm block mb-1">Nome</span>
                            <span class="font-medium">{{ userName() }}</span>
                        </div>
                        <div>
                            <span class="text-surface-500 dark:text-surface-400 text-sm block mb-1">Email</span>
                            <span class="font-medium">{{ userEmail() }}</span>
                        </div>
                        <div>
                            <span class="text-surface-500 dark:text-surface-400 text-sm block mb-1">Organização Atual</span>
                            <span class="font-medium">{{ currentOrgName() }}</span>
                        </div>
                        <div>
                            <span class="text-surface-500 dark:text-surface-400 text-sm block mb-1">Seu Papel</span>
                            <p-tag [value]="currentRoleLabel()" [severity]="currentRoleSeverity()" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Organizações -->
            <div class="col-span-12 lg:col-span-6">
                <div class="card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="font-semibold text-xl">Minhas Organizações</div>
                        <p-button
                            icon="pi pi-plus"
                            label="Nova"
                            [text]="true"
                            (click)="openCreateDialog()"
                        />
                    </div>
                    <ul class="list-none p-0 m-0">
                        @for (membership of organizations(); track membership.organization.id) {
                            <li class="flex items-center gap-4 py-4 border-b border-surface last:border-b-0">
                                <!-- Logo da Organização -->
                                <div class="relative flex-shrink-0">
                                    @if (membership.organization.logo) {
                                        <img [src]="membership.organization.logo | mediaUrl"
                                             class="w-12 h-12 rounded-lg object-cover border border-surface" />
                                    } @else {
                                        <div class="w-12 h-12 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center border border-surface">
                                            <i class="pi pi-building text-xl text-surface-500"></i>
                                        </div>
                                    }
                                </div>

                                <!-- Info da Organização -->
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium truncate">
                                        {{ membership.organization.nome }}
                                        @if (isCurrentOrg(membership.organization.id)) {
                                            <span class="text-primary text-xs ml-1">(atual)</span>
                                        }
                                    </div>
                                    <p-tag [value]="membership.role" [severity]="getRoleSeverity(membership.role)" class="mt-1" />
                                </div>

                                <!-- Ações -->
                                <div class="flex items-center gap-1 flex-shrink-0">
                                    @if (canEdit(membership)) {
                                        <p-fileUpload
                                            mode="basic"
                                            accept="image/png,image/jpeg,image/webp"
                                            [maxFileSize]="5000000"
                                            chooseLabel=""
                                            chooseIcon="pi pi-image"
                                            [auto]="true"
                                            [customUpload]="true"
                                            (uploadHandler)="onLogoUpload($event, membership.organization.id)"
                                            styleClass="p-button-text p-button-secondary p-button-sm"
                                        />
                                        @if (membership.organization.logo) {
                                            <p-button
                                                icon="pi pi-trash"
                                                [rounded]="true"
                                                [text]="true"
                                                severity="danger"
                                                size="small"
                                                pTooltip="Remover logo"
                                                (click)="removeLogo(membership.organization.id)"
                                            />
                                        }
                                        <p-button
                                            icon="pi pi-pencil"
                                            [rounded]="true"
                                            [text]="true"
                                            severity="secondary"
                                            size="small"
                                            pTooltip="Editar nome"
                                            (click)="openEditDialog(membership)"
                                        />
                                    }
                                </div>
                            </li>
                        } @empty {
                            <li class="py-3 text-surface-500">Nenhuma organização encontrada</li>
                        }
                    </ul>
                </div>
            </div>
        </div>

        <!-- Dialog para criar/editar organização -->
        <p-dialog
            [header]="isEditMode ? 'Editar Organização' : 'Nova Organização'"
            [(visible)]="showDialog"
            [modal]="true"
            [style]="{ width: '400px' }"
            [closable]="true"
        >
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label for="orgName" class="font-medium">Nome da Organização</label>
                    <input
                        pInputText
                        id="orgName"
                        [(ngModel)]="orgName"
                        placeholder="Ex: Minha Empresa"
                        class="w-full"
                    />
                </div>
            </div>
            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <p-button
                        label="Cancelar"
                        [text]="true"
                        (click)="cancelDialog()"
                    />
                    <p-button
                        [label]="isEditMode ? 'Salvar' : 'Criar'"
                        icon="pi pi-check"
                        [loading]="isLoading()"
                        [disabled]="!orgName.trim()"
                        (click)="salvarOrganizacao()"
                    />
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class Account {
    private authService = inject(AuthService);
    private tenantService = inject(TenantService);
    private organizationService = inject(OrganizationService);
    private messageService = inject(MessageService);
    private http = inject(HttpClient);
    private apiConfig = inject(ApiConfiguration);

    userName = computed(() => this.authService.user()?.nome ?? '');
    userEmail = computed(() => this.authService.user()?.email ?? '');
    userAvatar = computed(() => this.authService.user()?.avatar);
    organizations = computed(() => this.authService.organizations());
    currentOrgId = computed(() => this.tenantService.currentOrganizationId());
    currentOrgName = computed(() => this.tenantService.currentOrganizationName() ?? '');
    currentRole = computed(() => this.tenantService.currentRole());

    userInitials = computed(() => {
        const nome = this.userName();
        const parts = nome.split(' ').filter(p => p.length > 0);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return nome.substring(0, 2).toUpperCase() || 'U';
    });

    currentRoleLabel = computed(() => {
        const role = this.currentRole();
        switch (role) {
            case 'OWNER': return 'Proprietário';
            case 'ADMIN': return 'Administrador';
            case 'MEMBER': return 'Membro';
            default: return '';
        }
    });

    currentRoleSeverity = computed((): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' => {
        const role = this.currentRole();
        switch (role) {
            case 'OWNER': return 'success';
            case 'ADMIN': return 'warn';
            case 'MEMBER': return 'info';
            default: return 'secondary';
        }
    });

    showDialog = false;
    isEditMode = false;
    orgName = '';
    editingOrgId: number | null = null;
    isLoading = signal(false);
    isRemovingAvatar = signal(false);

    isCurrentOrg(orgId: number): boolean {
        return this.currentOrgId() === orgId;
    }

    canEdit(membership: MembershipOutput): boolean {
        return membership.role === 'OWNER' || membership.role === 'ADMIN';
    }

    getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (role) {
            case 'OWNER': return 'success';
            case 'ADMIN': return 'warn';
            case 'MEMBER': return 'info';
            default: return 'secondary';
        }
    }

    // Avatar methods
    onAvatarUpload(event: { files: File[] }): void {
        const file = event.files[0];
        if (!file) return;

        atualizarAvatar1(this.http, this.apiConfig.rootUrl, { body: { file } }).pipe(
            map(res => res.body)
        ).subscribe({
            next: (user) => {
                this.authService.updateUser(user);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Foto atualizada com sucesso'
                });
            },
            error: (err) => {
                console.error('Erro ao atualizar avatar:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Não foi possível atualizar a foto'
                });
            }
        });
    }

    removeAvatar(): void {
        this.isRemovingAvatar.set(true);

        removerAvatar1(this.http, this.apiConfig.rootUrl).subscribe({
            next: () => {
                this.authService.updateUserAvatar(undefined);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Foto removida com sucesso'
                });
                this.isRemovingAvatar.set(false);
            },
            error: (err) => {
                console.error('Erro ao remover avatar:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Não foi possível remover a foto'
                });
                this.isRemovingAvatar.set(false);
            }
        });
    }

    // Logo methods
    onLogoUpload(event: { files: File[] }, orgId: number): void {
        const file = event.files[0];
        if (!file) return;

        this.organizationService.uploadLogo(orgId, file).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Logo atualizado com sucesso'
                });
            },
            error: (err) => {
                console.error('Erro ao atualizar logo:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Não foi possível atualizar o logo'
                });
            }
        });
    }

    removeLogo(orgId: number): void {
        this.organizationService.removeLogo(orgId).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Logo removido com sucesso'
                });
            },
            error: (err) => {
                console.error('Erro ao remover logo:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Não foi possível remover o logo'
                });
            }
        });
    }

    // Organization dialog methods
    openCreateDialog(): void {
        this.isEditMode = false;
        this.orgName = '';
        this.editingOrgId = null;
        this.showDialog = true;
    }

    openEditDialog(membership: MembershipOutput): void {
        this.isEditMode = true;
        this.orgName = membership.organization.nome;
        this.editingOrgId = membership.organization.id;
        this.showDialog = true;
    }

    cancelDialog(): void {
        this.showDialog = false;
        this.orgName = '';
        this.editingOrgId = null;
    }

    salvarOrganizacao(): void {
        if (!this.orgName.trim()) return;

        this.isLoading.set(true);

        if (this.isEditMode && this.editingOrgId) {
            this.organizationService.atualizar(this.editingOrgId, { nome: this.orgName.trim() }).subscribe({
                next: () => {
                    this.showDialog = false;
                    this.orgName = '';
                    this.editingOrgId = null;
                    this.isLoading.set(false);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Organização atualizada com sucesso'
                    });
                },
                error: (err) => {
                    console.error('Erro ao atualizar organização:', err);
                    this.isLoading.set(false);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Não foi possível atualizar a organização'
                    });
                }
            });
        } else {
            this.organizationService.criar({ nome: this.orgName.trim() }).subscribe({
                next: () => {
                    this.showDialog = false;
                    this.orgName = '';
                    this.isLoading.set(false);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Organização criada com sucesso'
                    });
                },
                error: (err) => {
                    console.error('Erro ao criar organização:', err);
                    this.isLoading.set(false);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Não foi possível criar a organização'
                    });
                }
            });
        }
    }
}
