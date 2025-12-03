import { Injectable, computed, effect, signal } from '@angular/core';
import { MembershipOutput } from '../models/auth.models';
import { AuthService } from './auth.service';

const SELECTED_ORG_KEY = 'selected_organization_id';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private _currentOrganization = signal<MembershipOutput | null>(null);

  readonly currentOrganization = this._currentOrganization.asReadonly();
  readonly currentOrganizationId = computed(() => this._currentOrganization()?.organization.id ?? null);
  readonly currentOrganizationName = computed(() => this._currentOrganization()?.organization.nome ?? '');
  readonly currentRole = computed(() => this._currentOrganization()?.role ?? null);

  readonly isOwner = computed(() => this._currentOrganization()?.role === 'OWNER');
  readonly isAdmin = computed(() => {
    const role = this._currentOrganization()?.role;
    return role === 'OWNER' || role === 'ADMIN';
  });

  constructor(private authService: AuthService) {
    // Quando as organizações mudam, atualiza a organização atual
    effect(() => {
      const orgs = this.authService.organizations();
      if (orgs.length > 0) {
        this.initializeOrganization(orgs);
      } else {
        this._currentOrganization.set(null);
      }
    });
  }

  setOrganization(organizationId: number): void {
    const orgs = this.authService.organizations();
    const org = orgs.find(o => o.organization.id === organizationId);

    if (org) {
      this._currentOrganization.set(org);
      localStorage.setItem(SELECTED_ORG_KEY, organizationId.toString());
    }
  }

  getOrganizationId(): number | null {
    return this.currentOrganizationId();
  }

  private initializeOrganization(orgs: MembershipOutput[]): void {
    // Tenta restaurar a organização salva
    const savedOrgId = localStorage.getItem(SELECTED_ORG_KEY);
    if (savedOrgId) {
      const savedOrg = orgs.find(o => o.organization.id === parseInt(savedOrgId, 10));
      if (savedOrg) {
        this._currentOrganization.set(savedOrg);
        return;
      }
    }

    // Se não encontrar, usa a primeira organização
    if (orgs.length > 0) {
      this._currentOrganization.set(orgs[0]);
      localStorage.setItem(SELECTED_ORG_KEY, orgs[0].organization.id.toString());
    }
  }
}
