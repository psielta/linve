import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Api } from '../../../core/api/api';
import { listar1, buscar1, criar1, atualizar1, excluir1 } from '../../../core/api/functions';
import { ProdutoInput } from '../../../core/api/models/produto-input';
import { ProdutoOutput } from '../../../core/api/models/produto-output';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  constructor(private api: Api) {}

  listar(idCategoria?: number): Observable<ProdutoOutput[]> {
    const params = idCategoria !== undefined ? { id_categoria: idCategoria } : undefined;
    return from(this.api.invoke(listar1, params));
  }

  buscar(id: number): Observable<ProdutoOutput> {
    return from(this.api.invoke(buscar1, { id }));
  }

  criar(input: ProdutoInput): Observable<ProdutoOutput> {
    return from(this.api.invoke(criar1, { body: input }));
  }

  atualizar(id: number, input: ProdutoInput): Observable<ProdutoOutput> {
    return from(this.api.invoke(atualizar1, { id, body: input }));
  }

  excluir(id: number): Observable<void> {
    return from(this.api.invoke(excluir1, { id }));
  }
}

