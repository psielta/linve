import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { Api } from '../../../core/api/api';
import { listar4, buscar4, criar5, atualizar5, excluir3 } from '../../../core/api/functions';
import { AdicionalInput } from '../../../core/api/models/adicional-input';
import { AdicionalOutput } from '../../../core/api/models/adicional-output';

@Injectable({ providedIn: 'root' })
export class AdicionalService {
  constructor(private api: Api) {}

  /**
   * Lista grupos de adicionais.
   * O contrato OpenAPI gerou retorno como AdicionalOutput unico, mas o backend retorna lista.
   * Aqui normalizamos para sempre trabalhar com array.
   */
  listar(idCategoria?: number): Observable<AdicionalOutput[]> {
    const params = idCategoria !== undefined ? { id_categoria: idCategoria } : undefined;
    return from(this.api.invoke(listar4 as any, params as any) as Promise<any>).pipe(
      map((data: any) => {
        if (!data) {
          return [];
        }
        return Array.isArray(data) ? (data as AdicionalOutput[]) : ([data] as AdicionalOutput[]);
      })
    );
  }

  buscar(id: number): Observable<AdicionalOutput> {
    return from(this.api.invoke(buscar4 as any, { id } as any) as Promise<AdicionalOutput>);
  }

  criar(input: AdicionalInput): Observable<AdicionalOutput> {
    return from(this.api.invoke(criar5 as any, { body: input } as any) as Promise<AdicionalOutput>);
  }

  atualizar(id: number, input: AdicionalInput): Observable<AdicionalOutput> {
    return from(this.api.invoke(atualizar5 as any, { id, body: input } as any) as Promise<AdicionalOutput>);
  }

  excluir(id: number): Observable<void> {
    return from(this.api.invoke(excluir3 as any, { id } as any) as Promise<void>);
  }
}

