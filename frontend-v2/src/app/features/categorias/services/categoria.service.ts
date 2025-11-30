import { Injectable } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { Api } from '../../../core/api/api';
import {
  adicionarOpcao,
  atualizar3,
  atualizarOpcao,
  buscar2,
  criar3,
  desativarOpcao,
  excluir2,
  listar2,
  listarOpcoes
} from '../../../core/api/functions';
import { CategoriaInput } from '../../../core/api/models/categoria-input';
import { CategoriaOpcaoOutput } from '../../../core/api/models/categoria-opcao-output';
import { CategoriaOutput } from '../../../core/api/models/categoria-output';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  constructor(private api: Api) {}

  listar(idCulinaria?: number): Observable<CategoriaOutput[]> {
    const params = idCulinaria !== undefined ? { id_culinaria: idCulinaria } : undefined;
    return from(this.api.invoke(listar2, params, {} as HttpContext));
  }

  buscar(id: number): Observable<CategoriaOutput> {
    return from(this.api.invoke(buscar2, { id }));
  }

  criar(input: CategoriaInput): Observable<CategoriaOutput> {
    return from(this.api.invoke(criar3, { body: input }));
  }

  atualizar(id: number, input: CategoriaInput): Observable<CategoriaOutput> {
    return from(this.api.invoke(atualizar3, { id, body: input }));
  }

  excluir(id: number): Observable<void> {
    return from(this.api.invoke(excluir2, { id }));
  }

  listarOpcoes(categoriaId: number): Observable<CategoriaOpcaoOutput[]> {
    return from(this.api.invoke(listarOpcoes, { idCategoria: categoriaId }));
  }

  adicionarOpcao(categoriaId: number, nome: string): Observable<CategoriaOpcaoOutput> {
    return from(this.api.invoke(adicionarOpcao, { idCategoria: categoriaId, body: { nome } }));
  }

  atualizarOpcao(categoriaId: number, opcaoId: number, nome: string): Observable<CategoriaOpcaoOutput> {
    return from(this.api.invoke(atualizarOpcao, { idCategoria: categoriaId, idOpcao: opcaoId, body: { nome } }));
  }

  desativarOpcao(categoriaId: number, opcaoId: number): Observable<void> {
    return from(this.api.invoke(desativarOpcao, { idCategoria: categoriaId, idOpcao: opcaoId }));
  }
}
