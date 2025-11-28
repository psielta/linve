import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatsCardData {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
}

/**
 * Card de estatísticas estilo Metronic
 */
@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-card" [class]="'stats-card-' + data().color">
      @if (data().loading) {
        <div class="stats-card-loading">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>
      } @else {
        <div class="stats-card-body">
          <div class="stats-info">
            <span class="stats-title">{{ data().title }}</span>
            <span class="stats-value">{{ data().value }}</span>
            @if (data().change !== undefined) {
              <div class="stats-change" [class.positive]="data().change! >= 0" [class.negative]="data().change! < 0">
                <i class="fa-solid" [ngClass]="data().change! >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'"></i>
                <span>{{ Math.abs(data().change!) }}%</span>
                @if (data().changeLabel) {
                  <span class="change-label">{{ data().changeLabel }}</span>
                }
              </div>
            }
          </div>
          <div class="stats-icon">
            <i [class]="data().icon"></i>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-card {
      background: var(--card-bg);
      border-radius: 12px;
      padding: 20px;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
      height: 100%;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }

    .stats-card-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
    }

    .stats-card-body {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .stats-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stats-title {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stats-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-color);
      line-height: 1.2;
    }

    .stats-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
      margin-top: 4px;

      &.positive {
        color: var(--success-color);
      }

      &.negative {
        color: var(--danger-color);
      }

      i {
        font-size: 10px;
      }

      .change-label {
        color: var(--text-muted);
        font-weight: 400;
      }
    }

    .stats-icon {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    // Color variants
    .stats-card-primary .stats-icon {
      background: rgba(var(--primary-rgb), 0.1);
      color: var(--primary-color);
    }

    .stats-card-success .stats-icon {
      background: rgba(var(--success-rgb), 0.1);
      color: var(--success-color);
    }

    .stats-card-warning .stats-icon {
      background: rgba(var(--warning-rgb), 0.1);
      color: var(--warning-color);
    }

    .stats-card-danger .stats-icon {
      background: rgba(var(--danger-rgb), 0.1);
      color: var(--danger-color);
    }

    .stats-card-info .stats-icon {
      background: rgba(var(--info-rgb), 0.1);
      color: var(--info-color);
    }
  `]
})
export class StatsCardComponent {
  data = input.required<StatsCardData>();

  // Expor Math para o template
  Math = Math;
}
