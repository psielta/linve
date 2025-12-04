import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewChildren,
  QueryList,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import {
  BrAvatar,
  BrButton,
  BrCard,
  BrDivider,
  BrInput,
  BrMessage,
  BrModal,
  BrScrim,
  BrTag,
  BrUpload,
} from '@govbr-ds/webcomponents-angular/standalone';
import { computed, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { TenantService } from '../../../core/services/tenant.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { MediaUrlPipe } from '../../../core/pipes/media-url.pipe';
import { ApiConfiguration } from '../../../core/api/api-configuration';
import { atualizarAvatar1 } from '../../../core/api/fn/conta/atualizar-avatar-1';
import { removerAvatar1 } from '../../../core/api/fn/conta/remover-avatar-1';
import { MembershipOutput } from '../../../core/models/auth.models';

interface FeedbackMessage {
  id: number;
  type: 'success' | 'info' | 'warning' | 'danger';
  text: string;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MediaUrlPipe,
    BrAvatar,
    BrButton,
    BrCard,
    BrDivider,
    BrInput,
    BrMessage,
    BrModal,
    BrScrim,
    BrTag,
    BrUpload,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private tenantService = inject(TenantService);
  private organizationService = inject(OrganizationService);
  private apiConfig = inject(ApiConfiguration);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  // Formulário para criar/editar organização
  orgForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
  });

  // Upload refs
  @ViewChild('avatarUpload', { read: ElementRef }) avatarUpload?: ElementRef<HTMLBrUploadElement>;
  @ViewChildren('logoUpload', { read: ElementRef }) logoUploads?: QueryList<ElementRef<HTMLBrUploadElement>>;

  // Estados
  isEditMode = signal(false);
  editingOrgId: number | null = null;
  showOrgModal = signal(false);
  isSavingOrg = signal(false);
  isRemovingAvatar = signal(false);
  avatarLoading = signal(false);
  logoLoading = signal<Record<number, boolean>>({});
  feedbacks = signal<FeedbackMessage[]>([]);
  avatarVersion = signal(Date.now()); // Cache busting para avatar

  // Computed
  userName = computed(() => this.authService.user()?.nome ?? '');
  userEmail = computed(() => this.authService.user()?.email ?? '');
  userAvatar = computed(() => this.authService.user()?.avatar);
  // URL completa do avatar com cache busting para forçar recarregamento após upload
  userAvatarUrl = computed(() => {
    const avatar = this.userAvatar();
    if (!avatar) return null;
    const version = this.avatarVersion();
    const baseUrl = this.apiConfig.rootUrl.replace(/\/$/, '');
    const path = avatar.startsWith('/') ? avatar : `/${avatar}`;
    return `${baseUrl}${path}?v=${version}`;
  });
  organizations = computed(() => this.authService.organizations() ?? []);
  currentOrgId = computed(() => this.tenantService.currentOrganizationId());
  currentOrgName = computed(() => this.tenantService.currentOrganizationName() ?? '');
  currentRole = computed(() => this.tenantService.currentRole());

  private uploadListeners = new Map<EventTarget, EventListener>();
  private feedbackCounter = 0;
  private logoUploadsSub?: Subscription;

  // Helpers de apresentação
  userInitials = computed(() => {
    const nome = this.userName();
    const parts = nome.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (nome || 'U').substring(0, 2).toUpperCase();
  });

  currentRoleLabel = computed(() => {
    switch (this.currentRole()) {
      case 'OWNER':
        return 'Proprietário';
      case 'ADMIN':
        return 'Administrador';
      case 'MEMBER':
        return 'Membro';
      default:
        return '';
    }
  });

  private readonly avatarColors = [
    '#1351B4', // Azul
    '#168821', // Verde
    '#D4570A', // Laranja
    '#9C27B0', // Roxo
    '#00796B', // Teal
    '#C2185B', // Rosa
    '#5D4037', // Marrom
    '#455A64', // Cinza azulado
  ];

  getAvatarBgColor(orgId: number | undefined | null): string {
    if (!orgId) return this.avatarColors[0];
    return this.avatarColors[orgId % this.avatarColors.length];
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'OWNER': return 'Proprietário';
      case 'ADMIN': return 'Administrador';
      case 'MEMBER': return 'Membro';
      default: return role;
    }
  }

  roleColor(role: string): string {
    switch (role) {
      case 'OWNER':
        return 'green-vivid-50';
      case 'ADMIN':
        return 'yellow-vivid-40';
      case 'MEMBER':
        return 'blue-warm-vivid-50';
      default:
        return 'gray-20';
    }
  }

  isCurrentOrg(orgId?: number | null): boolean {
    if (orgId == null) return false;
    return this.currentOrgId() === orgId;
  }

  canEdit(membership: MembershipOutput): boolean {
    return membership.role === 'OWNER' || membership.role === 'ADMIN';
  }

  ngAfterViewInit(): void {
    // Avatar listener
    this.attachUploadListener(this.avatarUpload?.nativeElement, (files) => this.onAvatarSelected(files));

    // Logo listeners for dynamic list
    this.logoUploadsSub = this.logoUploads?.changes.subscribe(() => this.attachLogoListeners());
    this.attachLogoListeners();
  }

  ngOnDestroy(): void {
    this.uploadListeners.forEach((handler, target) => {
      target.removeEventListener('change', handler);
    });
    this.uploadListeners.clear();
    this.logoUploadsSub?.unsubscribe();
  }

  // Upload listeners setup
  private attachLogoListeners(): void {
    this.logoUploads?.forEach((ref) => {
      const orgId = Number(ref.nativeElement.getAttribute('data-org-id'));
      this.attachUploadListener(ref.nativeElement, (files) => this.onLogoSelected(orgId, files));
    });
  }

  private attachUploadListener(
    element: HTMLBrUploadElement | undefined,
    callback: (files: FileList | null) => void
  ): void {
    if (!element) return;
    const input = element.shadowRoot?.querySelector('input[type="file"]');
    if (!input) {
      // Tenta novamente após renderização do shadow DOM
      setTimeout(() => this.attachUploadListener(element, callback), 50);
      return;
    }
    if (this.uploadListeners.has(input)) return;

    const handler = (event: Event) => {
      const target = event.target as HTMLInputElement;
      callback(target.files);
    };

    input.addEventListener('change', handler);
    this.uploadListeners.set(input, handler);
  }

  // Feedback
  private pushFeedback(type: FeedbackMessage['type'], text: string): void {
    const id = ++this.feedbackCounter;
    this.feedbacks.update((list) => [...list, { id, type, text }]);
  }

  dismissFeedback(id: number): void {
    this.feedbacks.update((list) => list.filter((f) => f.id !== id));
  }

  trackFeedback(_: number, item: FeedbackMessage) {
    return item.id;
  }

  trackOrg(_: number, membership: MembershipOutput) {
    return membership?.organization?.id ?? _;
  }

  // Avatar actions
  private onAvatarSelected(files: FileList | null): void {
    const file = files?.item(0);
    if (!file) return;

    this.avatarLoading.set(true);
    atualizarAvatar1(this.http, this.apiConfig.rootUrl, { body: { file } }).subscribe({
      next: (res) => {
        const user = res.body;
        if (user) {
          this.authService.updateUser(user);
          // Atualiza versão para invalidar cache e forçar recarregamento da imagem
          this.avatarVersion.set(Date.now());
          this.pushFeedback('success', 'Foto atualizada com sucesso.');
        }
      },
      error: (error: unknown) => {
        console.error('Erro ao atualizar avatar', error);
        this.pushFeedback('danger', 'Não foi possível atualizar a foto.');
      },
      complete: () => this.avatarLoading.set(false),
    });
  }

  removeAvatar(): void {
    this.isRemovingAvatar.set(true);
    removerAvatar1(this.http, this.apiConfig.rootUrl).subscribe({
      next: () => {
        this.authService.updateUserAvatar(undefined);
        this.pushFeedback('success', 'Foto removida com sucesso.');
      },
      error: (error: unknown) => {
        console.error('Erro ao remover avatar', error);
        this.pushFeedback('danger', 'Não foi possível remover a foto.');
      },
      complete: () => this.isRemovingAvatar.set(false),
    });
  }

  // Logo actions
  private setLogoLoading(orgId: number, value: boolean): void {
    this.logoLoading.update((state) => ({ ...state, [orgId]: value }));
  }

  isLogoLoading(orgId?: number | null): boolean {
    if (orgId == null) return false;
    return !!this.logoLoading()[orgId];
  }

  private onLogoSelected(orgId: number | null | undefined, files: FileList | null): void {
    if (orgId == null) return;
    const file = files?.item(0);
    if (!file) return;

    this.setLogoLoading(orgId, true);
    this.organizationService.uploadLogo(orgId, file).subscribe({
      next: () => this.pushFeedback('success', 'Logo atualizado com sucesso.'),
      error: (error: unknown) => {
        console.error('Erro ao atualizar logo', error);
        this.pushFeedback('danger', 'Não foi possível atualizar o logo.');
      },
      complete: () => this.setLogoLoading(orgId, false),
    });
  }

  removeLogo(orgId: number | null | undefined): void {
    if (orgId == null) return;
    this.setLogoLoading(orgId, true);
    this.organizationService.removeLogo(orgId).subscribe({
      next: () => this.pushFeedback('success', 'Logo removido com sucesso.'),
      error: (error: unknown) => {
        console.error('Erro ao remover logo', error);
        this.pushFeedback('danger', 'Não foi possível remover o logo.');
      },
      complete: () => this.setLogoLoading(orgId, false),
    });
  }

  // Modal handlers
  openCreate(): void {
    this.isEditMode.set(false);
    this.editingOrgId = null;
    this.orgForm.reset();
    this.showOrgModal.set(true);
  }

  openEdit(membership: MembershipOutput): void {
    this.isEditMode.set(true);
    this.editingOrgId = membership.organization.id;
    this.orgForm.patchValue({ nome: membership.organization.nome });
    this.showOrgModal.set(true);
  }

  closeModal(): void {
    this.showOrgModal.set(false);
    this.orgForm.reset();
    this.editingOrgId = null;
  }

  saveOrganization(): void {
    if (this.orgForm.invalid) {
      this.orgForm.markAllAsTouched();
      return;
    }

    const nome = this.orgForm.value.nome?.trim();
    if (!nome) return;

    this.isSavingOrg.set(true);
    if (this.isEditMode() && this.editingOrgId) {
      this.organizationService.atualizar(this.editingOrgId, { nome }).subscribe({
        next: () => {
          this.pushFeedback('success', 'Organização atualizada.');
          this.closeModal();
        },
        error: (error: unknown) => {
          console.error('Erro ao salvar organização', error);
          this.pushFeedback('danger', 'Não foi possível salvar a organização.');
        },
        complete: () => this.isSavingOrg.set(false),
      });
    } else {
      this.organizationService.criar({ nome }).subscribe({
        next: () => {
          this.pushFeedback('success', 'Organização criada.');
          this.closeModal();
        },
        error: (error: unknown) => {
          console.error('Erro ao salvar organização', error);
          this.pushFeedback('danger', 'Não foi possível salvar a organização.');
        },
        complete: () => this.isSavingOrg.set(false),
      });
    }
  }
}
