import { Pipe, PipeTransform, inject } from '@angular/core';
import { ApiConfiguration } from '../api/api-configuration';

@Pipe({
  name: 'mediaUrl',
  standalone: true
})
export class MediaUrlPipe implements PipeTransform {
  private apiConfig = inject(ApiConfiguration);

  transform(path: string | null | undefined): string | undefined {
    if (!path) {
      return undefined;
    }

    // Se já é uma URL completa, retorna como está
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Concatena com a URL base da API
    const baseUrl = this.apiConfig.rootUrl.replace(/\/$/, ''); // Remove trailing slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
  }
}
