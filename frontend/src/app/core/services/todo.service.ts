import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Todo, TodoInput } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly apiUrl = `${environment.apiUrl}/todos`;

  constructor(private http: HttpClient) {}

  listar(concluido?: boolean): Observable<Todo[]> {
    let params = new HttpParams();
    if (concluido !== undefined) {
      params = params.set('concluido', concluido.toString());
    }
    return this.http.get<Todo[]>(this.apiUrl, { params });
  }

  buscarPorId(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`);
  }

  criar(input: TodoInput): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, input);
  }

  atualizar(id: number, input: TodoInput): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, input);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  concluir(id: number): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/${id}/concluir`, {});
  }

  reabrir(id: number): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/${id}/reabrir`, {});
  }
}
