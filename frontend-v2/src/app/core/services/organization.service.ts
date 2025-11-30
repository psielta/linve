import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiConfiguration } from '../api/api-configuration';
import { MembershipOutput, OrganizationOutput, OrganizationInput } from '../api/models';
import { AuthService } from './auth.service';
import { criar2 } from '../api/fn/organizations/criar-2';
import { atualizar2 } from '../api/fn/organizations/atualizar-2';
import { atualizarLogo } from '../api/fn/organizations/atualizar-logo';
import { removerLogo } from '../api/fn/organizations/remover-logo';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private apiConfig: ApiConfiguration
  ) {}

  criar(input: OrganizationInput): Observable<MembershipOutput> {
    return criar2(this.http, this.apiConfig.rootUrl, { body: input }).pipe(
      map((res) => res.body as MembershipOutput),
      tap((membership) => this.authService.addOrganization(membership))
    );
  }

  atualizar(id: number, input: OrganizationInput): Observable<OrganizationOutput> {
    return atualizar2(this.http, this.apiConfig.rootUrl, { id, body: input }).pipe(
      map((res) => res.body as OrganizationOutput),
      tap((org) => this.authService.updateOrganizationData(id, org))
    );
  }

  uploadLogo(orgId: number, file: File): Observable<OrganizationOutput> {
    return atualizarLogo(this.http, this.apiConfig.rootUrl, { id: orgId, body: { file } }).pipe(
      map((res) => res.body as OrganizationOutput),
      tap((org) => this.authService.updateOrganizationData(orgId, org))
    );
  }

  removeLogo(orgId: number): Observable<void> {
    return removerLogo(this.http, this.apiConfig.rootUrl, { id: orgId }).pipe(
      map(() => undefined),
      tap(() => this.authService.updateOrganizationLogo(orgId, undefined))
    );
  }
}
