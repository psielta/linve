import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiConfiguration } from '../api/api-configuration';
import { MembershipOutput, OrganizationOutput } from '../api/models';
import { criar1 } from '../api/fn/organizations/criar-1';
import { atualizar1 } from '../api/fn/organizations/atualizar-1';
import { atualizarLogo } from '../api/fn/organizations/atualizar-logo';
import { removerLogo } from '../api/fn/organizations/remover-logo';

export interface OrganizationInput {
  nome: string;
}

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
    return criar1(this.http, this.apiConfig.rootUrl, { body: input }).pipe(
      map(res => res.body),
      tap(membership => this.authService.addOrganization(membership))
    );
  }

  atualizar(id: number, input: OrganizationInput): Observable<OrganizationOutput> {
    return atualizar1(this.http, this.apiConfig.rootUrl, { id, body: input }).pipe(
      map(res => res.body),
      tap(org => this.authService.updateOrganizationData(id, org))
    );
  }

  uploadLogo(orgId: number, file: File): Observable<OrganizationOutput> {
    return atualizarLogo(this.http, this.apiConfig.rootUrl, { id: orgId, body: { file } }).pipe(
      map(res => res.body),
      tap(org => this.authService.updateOrganizationData(orgId, org))
    );
  }

  removeLogo(orgId: number): Observable<void> {
    return removerLogo(this.http, this.apiConfig.rootUrl, { id: orgId }).pipe(
      map(() => undefined),
      tap(() => this.authService.updateOrganizationLogo(orgId, undefined))
    );
  }
}
