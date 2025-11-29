import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TodoInput, TodoOutput } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly apiUrl = `${environment.apiUrl}/todos`;

  constructor(private http: HttpClient) {}

  list(concluido?: boolean): Observable<TodoOutput[]> {
    let params = new HttpParams();
    if (concluido !== undefined) {
      params = params.set('concluido', concluido.toString());
    }
    return this.http.get<TodoOutput[]>(this.apiUrl, { params });
  }

  get(id: number): Observable<TodoOutput> {
    return this.http.get<TodoOutput>(`${this.apiUrl}/${id}`);
  }

  create(todo: TodoInput): Observable<TodoOutput> {
    return this.http.post<TodoOutput>(this.apiUrl, todo);
  }

  update(id: number, todo: TodoInput): Observable<TodoOutput> {
    return this.http.put<TodoOutput>(`${this.apiUrl}/${id}`, todo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  concluir(id: number): Observable<TodoOutput> {
    return this.http.patch<TodoOutput>(`${this.apiUrl}/${id}/concluir`, {});
  }

  reabrir(id: number): Observable<TodoOutput> {
    return this.http.patch<TodoOutput>(`${this.apiUrl}/${id}/reabrir`, {});
  }
}
