import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { OrganizationService } from '../../core/services/organization.service';
import { MembershipOutput } from '../../core/models/auth.models';

@Component({
    selector: 'app-account',
    standalone: true,
    imports: [CommonModule, FormsModule, TagModule, ButtonModule, DialogModule, InputTextModule],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <div class="col-span-12 lg:col-span-6">
                <div class="card">
                    <div class="font-semibold text-xl mb-4">Informações Pessoais</div>
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
                            <li class="flex items-center justify-between py-3 border-b border-surface last:border-b-0">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-building text-surface-500"></i>
                                    <div>
                                        <span class="font-medium">{{ membership.organization.nome }}</span>
                                        @if (isCurrentOrg(membership.organization.id)) {
                                            <span class="text-primary text-xs ml-2">(atual)</span>
                                        }
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    @if (canEdit(membership)) {
                                        <p-button
                                            icon="pi pi-pencil"
                                            [rounded]="true"
                                            [text]="true"
                                            severity="secondary"
                                            size="small"
                                            (click)="openEditDialog(membership)"
                                        />
                                    }
                                    <p-tag [value]="membership.role" [severity]="getRoleSeverity(membership.role)" />
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

    userName = computed(() => this.authService.user()?.nome ?? '');
    userEmail = computed(() => this.authService.user()?.email ?? '');
    organizations = computed(() => this.authService.organizations());
    currentOrgId = computed(() => this.tenantService.currentOrganizationId());
    currentOrgName = computed(() => this.tenantService.currentOrganizationName() ?? '');
    currentRole = computed(() => this.tenantService.currentRole());

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
                },
                error: (err) => {
                    console.error('Erro ao atualizar organização:', err);
                    this.isLoading.set(false);
                }
            });
        } else {
            this.organizationService.criar({ nome: this.orgName.trim() }).subscribe({
                next: () => {
                    this.showDialog = false;
                    this.orgName = '';
                    this.isLoading.set(false);
                },
                error: (err) => {
                    console.error('Erro ao criar organização:', err);
                    this.isLoading.set(false);
                }
            });
        }
    }
}
