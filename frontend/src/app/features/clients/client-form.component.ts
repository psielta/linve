import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Placeholder - Formulário de Novo Cliente
 */
@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-placeholder">
      <div class="placeholder-icon">
        <i class="fa-solid fa-user-plus"></i>
      </div>
      <h2>Novo Cliente</h2>
      <p>Formulário de cadastro de cliente será implementado em breve.</p>
      <a routerLink="/clients" class="btn btn-primary">
        <i class="fa-solid fa-arrow-left me-2"></i>
        Voltar para Clientes
      </a>
    </div>
  `,
  styles: [`
    .page-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      text-align: center;
      padding: 40px;
    }

    .placeholder-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(var(--info-rgb), 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;

      i {
        font-size: 2.5rem;
        color: var(--info-color);
      }
    }

    h2 {
      margin: 0 0 10px;
      color: var(--text-color);
    }

    p {
      color: var(--text-muted);
      margin-bottom: 20px;
    }
  `]
})
export class ClientFormComponent {}
