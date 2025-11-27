import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import {
  Api,
  listar,
  buscar,
  criar,
  atualizar,
  excluir,
  marcarConcluido,
  reabrir,
  TodoOutput,
  TodoInput
} from '../api';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  constructor(private api: Api) {}

  listar(concluido?: boolean): Observable<TodoOutput[]> {
    return from(this.api.invoke(listar, { concluido }));
  }

  buscarPorId(id: number): Observable<TodoOutput> {
    return from(this.api.invoke(buscar, { id }));
  }

  criar(input: TodoInput): Observable<TodoOutput> {
    return from(this.api.invoke(criar, { body: input }));
  }

  atualizar(id: number, input: TodoInput): Observable<TodoOutput> {
    return from(this.api.invoke(atualizar, { id, body: input }));
  }

  excluir(id: number): Observable<void> {
    return from(this.api.invoke(excluir, { id }));
  }

  concluir(id: number): Observable<TodoOutput> {
    return from(this.api.invoke(marcarConcluido, { id }));
  }

  reabrir(id: number): Observable<TodoOutput> {
    return from(this.api.invoke(reabrir, { id }));
  }
}
