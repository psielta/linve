import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CulinariaOutput } from '../api/models/culinaria-output';

@Injectable({ providedIn: 'root' })
export class CulinariaService {
    private readonly apiUrl = `${environment.apiUrl}/culinarias`;

    constructor(private http: HttpClient) {}

    listar(meioMeio?: boolean): Observable<CulinariaOutput[]> {
        let params = new HttpParams();
        if (meioMeio !== undefined) {
            params = params.set('meioMeio', meioMeio.toString());
        }
        return this.http.get<CulinariaOutput[]>(this.apiUrl, { params });
    }

    buscarPorId(id: number): Observable<CulinariaOutput> {
        return this.http.get<CulinariaOutput>(`${this.apiUrl}/${id}`);
    }
}
