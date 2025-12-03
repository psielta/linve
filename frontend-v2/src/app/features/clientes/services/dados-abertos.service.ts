import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Api } from '../../../core/api/api';
import { listarUfs, listarMunicipios } from '../../../core/api/functions';
import { UfOutput } from '../../../core/api/models/uf-output';
import { MunicipioOutput } from '../../../core/api/models/municipio-output';

@Injectable({ providedIn: 'root' })
export class DadosAbertosService {
  constructor(private api: Api) {}

  listarUfs(): Observable<UfOutput[]> {
    return from(this.api.invoke(listarUfs, {}));
  }

  listarMunicipios(ufSigla: string): Observable<MunicipioOutput[]> {
    return from(this.api.invoke(listarMunicipios, { ufSigla }));
  }
}
