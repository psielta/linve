import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Api } from '../../../core/api/api';
import { listar6, buscar5, criar6, atualizar6, excluir4 } from '../../../core/api/functions';
import { ClienteInput } from '../../../core/api/models/cliente-input';
import { ClienteOutput } from '../../../core/api/models/cliente-output';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  constructor(private api: Api) {}

  listar(): Observable<ClienteOutput[]> {
    return from(this.api.invoke(listar6, {}));
  }

  buscar(id: number): Observable<ClienteOutput> {
    return from(this.api.invoke(buscar5, { id }));
  }

  criar(input: ClienteInput): Observable<ClienteOutput> {
    return from(this.api.invoke(criar6, { body: input }));
  }

  atualizar(id: number, input: ClienteInput): Observable<ClienteOutput> {
    return from(this.api.invoke(atualizar6, { id, body: input }));
  }

  excluir(id: number): Observable<void> {
    return from(this.api.invoke(excluir4, { id }));
  }
}
