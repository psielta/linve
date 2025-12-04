import { Pipe, PipeTransform, inject } from '@angular/core';
import { ApiConfiguration } from '../api/api-configuration';

@Pipe({
  name: 'mediaUrl',
  standalone: true
})
export class MediaUrlPipe implements PipeTransform {
  private apiConfig = inject(ApiConfiguration);

  transform(path: string | null | undefined): string | undefined {
    if (!path) return undefined;

    // URL absoluta: retorna direto
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const baseUrl = this.apiConfig.rootUrl.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }
}
