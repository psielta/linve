import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MembershipOutput, OrganizationOutput } from '../models/auth.models';
import { AuthService } from './auth.service';

export interface OrganizationInput {
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  criar(input: OrganizationInput): Observable<MembershipOutput> {
    return this.http.post<MembershipOutput>(`${this.apiUrl}/organizations`, input).pipe(
      tap(membership => this.authService.addOrganization(membership))
    );
  }

  atualizar(id: number, input: OrganizationInput): Observable<OrganizationOutput> {
    return this.http.put<OrganizationOutput>(`${this.apiUrl}/organizations/${id}`, input).pipe(
      tap(org => this.authService.updateOrganization(id, { nome: org.nome }))
    );
  }
}
