import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente placeholder para configurações de perfil
 */
@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-placeholder">
      <div class="placeholder-icon">
        <i class="fa-solid fa-user"></i>
      </div>
      <h2>Meu Perfil</h2>
      <p>Esta funcionalidade está em desenvolvimento.</p>
      <p class="text-muted">Em breve você poderá editar suas informações pessoais aqui.</p>
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
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-hover));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      margin-bottom: 24px;
    }

    h2 {
      color: var(--text-color);
      margin-bottom: 8px;
    }

    p {
      color: var(--text-muted);
      margin: 0;
    }

    .text-muted {
      font-size: 14px;
      margin-top: 8px;
    }
  `]
})
export class ProfileSettingsComponent {}
