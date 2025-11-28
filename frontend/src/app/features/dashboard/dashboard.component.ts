import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatsCardComponent, StatsCardData } from './components/stats-card/stats-card.component';

/**
 * Dashboard principal com estatísticas e resumo
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatsCardComponent],
  template: `
    <!-- Stats Cards Row -->
    <div class="row g-4 mb-4">
      @for (stat of statsCards(); track stat.title) {
        <div class="col-12 col-sm-6 col-xl-3">
          <app-stats-card [data]="stat" />
        </div>
      }
    </div>

    <!-- Charts & Tables Row -->
    <div class="row g-4 mb-4">
      <!-- Gráfico de Entregas -->
      <div class="col-12 col-lg-8">
        <div class="dashboard-card">
          <div class="card-header">
            <h5 class="card-title">Entregas por Período</h5>
            <div class="card-actions">
              <select class="form-select form-select-sm" [(ngModel)]="selectedPeriod" (change)="onPeriodChange()">
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
                <option value="quarter">Último Trimestre</option>
              </select>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-placeholder">
              <i class="fa-solid fa-chart-line"></i>
              <p>Gráfico de entregas será exibido aqui</p>
              <span class="text-muted">Integração com Chart.js em breve</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Atividade Recente -->
      <div class="col-12 col-lg-4">
        <div class="dashboard-card">
          <div class="card-header">
            <h5 class="card-title">Atividade Recente</h5>
            <a routerLink="/notifications" class="view-all-link">Ver todas</a>
          </div>
          <div class="card-body p-0">
            <div class="activity-list">
              @for (activity of recentActivities(); track activity.id) {
                <div class="activity-item">
                  <div class="activity-icon" [class]="'bg-light-' + activity.color">
                    <i [class]="activity.icon"></i>
                  </div>
                  <div class="activity-content">
                    <p class="activity-text">{{ activity.text }}</p>
                    <span class="activity-time">{{ activity.time }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tarefas e Entregas Row -->
    <div class="row g-4">
      <!-- Tarefas Pendentes -->
      <div class="col-12 col-lg-6">
        <div class="dashboard-card">
          <div class="card-header">
            <h5 class="card-title">Tarefas Pendentes</h5>
            <a routerLink="/todos" class="view-all-link">Ver todas</a>
          </div>
          <div class="card-body p-0">
            <div class="task-list">
              @for (task of pendingTasks(); track task.id) {
                <div class="task-item">
                  <div class="task-checkbox">
                    <input
                      type="checkbox"
                      [id]="'task-' + task.id"
                      [checked]="task.completed"
                      (change)="toggleTask(task)" />
                  </div>
                  <div class="task-content">
                    <label [for]="'task-' + task.id" class="task-title">{{ task.title }}</label>
                    <div class="task-meta">
                      <span class="badge badge-light-{{ task.priorityColor }}">{{ task.priority }}</span>
                      <span class="task-due">{{ task.dueDate }}</span>
                    </div>
                  </div>
                </div>
              }

              @if (pendingTasks().length === 0) {
                <div class="empty-state">
                  <i class="fa-solid fa-clipboard-check"></i>
                  <p>Nenhuma tarefa pendente</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Próximas Entregas -->
      <div class="col-12 col-lg-6">
        <div class="dashboard-card">
          <div class="card-header">
            <h5 class="card-title">Próximas Entregas</h5>
            <a routerLink="/deliveries" class="view-all-link">Ver todas</a>
          </div>
          <div class="card-body p-0">
            <div class="delivery-list">
              @for (delivery of upcomingDeliveries(); track delivery.id) {
                <div class="delivery-item">
                  <div class="delivery-status" [class]="'status-' + delivery.status"></div>
                  <div class="delivery-content">
                    <p class="delivery-title">{{ delivery.client }}</p>
                    <p class="delivery-address">{{ delivery.address }}</p>
                  </div>
                  <div class="delivery-time">
                    <span class="delivery-eta">{{ delivery.eta }}</span>
                    <span class="badge badge-light-{{ delivery.statusColor }}">{{ delivery.statusLabel }}</span>
                  </div>
                </div>
              }

              @if (upcomingDeliveries().length === 0) {
                <div class="empty-state">
                  <i class="fa-solid fa-truck"></i>
                  <p>Nenhuma entrega agendada</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-card {
      background: var(--card-bg);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      height: 100%;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .card-title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-color);
    }

    .card-actions {
      .form-select {
        padding: 4px 28px 4px 10px;
        font-size: 12px;
        border-radius: 6px;
      }
    }

    .view-all-link {
      font-size: 12px;
      color: var(--primary-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .card-body {
      padding: 20px;
    }

    // Chart placeholder
    .chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 250px;
      color: var(--text-muted);

      i {
        font-size: 3rem;
        margin-bottom: 15px;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

    // Activity list
    .activity-list {
      max-height: 320px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      gap: 12px;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }
    }

    .activity-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i {
        font-size: 14px;
      }
    }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-text {
      margin: 0;
      font-size: 13px;
      color: var(--text-color);
      line-height: 1.4;
    }

    .activity-time {
      font-size: 11px;
      color: var(--text-muted);
    }

    // Task list
    .task-list {
      max-height: 320px;
      overflow-y: auto;
    }

    .task-item {
      display: flex;
      gap: 12px;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-color);
      transition: background 0.2s ease;

      &:hover {
        background: var(--bg-hover);
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .task-checkbox {
      padding-top: 2px;

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
    }

    .task-content {
      flex: 1;
      min-width: 0;
    }

    .task-title {
      display: block;
      margin: 0 0 4px;
      font-size: 13px;
      color: var(--text-color);
      cursor: pointer;
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 8px;

      .badge {
        font-size: 10px;
        padding: 2px 6px;
      }
    }

    .task-due {
      font-size: 11px;
      color: var(--text-muted);
    }

    // Delivery list
    .delivery-list {
      max-height: 320px;
      overflow-y: auto;
    }

    .delivery-item {
      display: flex;
      gap: 12px;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-color);
      transition: background 0.2s ease;

      &:hover {
        background: var(--bg-hover);
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .delivery-status {
      width: 4px;
      border-radius: 2px;
      flex-shrink: 0;

      &.status-pending { background: var(--warning-color); }
      &.status-in-transit { background: var(--info-color); }
      &.status-delivered { background: var(--success-color); }
    }

    .delivery-content {
      flex: 1;
      min-width: 0;
    }

    .delivery-title {
      margin: 0 0 2px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-color);
    }

    .delivery-address {
      margin: 0;
      font-size: 12px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .delivery-time {
      text-align: right;
      flex-shrink: 0;
    }

    .delivery-eta {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-color);
      margin-bottom: 4px;
    }

    // Empty state
    .empty-state {
      padding: 40px 20px;
      text-align: center;
      color: var(--text-muted);

      i {
        font-size: 2.5rem;
        margin-bottom: 10px;
        display: block;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 13px;
      }
    }

    // Badge colors (light variants)
    .badge-light-primary {
      background: rgba(var(--primary-rgb), 0.1);
      color: var(--primary-color);
    }

    .badge-light-success {
      background: rgba(var(--success-rgb), 0.1);
      color: var(--success-color);
    }

    .badge-light-warning {
      background: rgba(var(--warning-rgb), 0.1);
      color: var(--warning-color);
    }

    .badge-light-danger {
      background: rgba(var(--danger-rgb), 0.1);
      color: var(--danger-color);
    }

    .badge-light-info {
      background: rgba(var(--info-rgb), 0.1);
      color: var(--info-color);
    }

    // Background light variants
    .bg-light-primary {
      background: rgba(var(--primary-rgb), 0.1);
      color: var(--primary-color);
    }

    .bg-light-success {
      background: rgba(var(--success-rgb), 0.1);
      color: var(--success-color);
    }

    .bg-light-warning {
      background: rgba(var(--warning-rgb), 0.1);
      color: var(--warning-color);
    }

    .bg-light-danger {
      background: rgba(var(--danger-rgb), 0.1);
      color: var(--danger-color);
    }

    .bg-light-info {
      background: rgba(var(--info-rgb), 0.1);
      color: var(--info-color);
    }
  `]
})
export class DashboardComponent implements OnInit {
  selectedPeriod = 'week';

  // Stats Cards
  statsCards = signal<StatsCardData[]>([
    {
      title: 'Total Entregas',
      value: '1,234',
      change: 12.5,
      changeLabel: 'vs mês anterior',
      icon: 'fa-solid fa-truck',
      color: 'primary'
    },
    {
      title: 'Entregas Hoje',
      value: '48',
      change: 8.2,
      changeLabel: 'vs ontem',
      icon: 'fa-solid fa-box',
      color: 'success'
    },
    {
      title: 'Em Trânsito',
      value: '23',
      change: -3.1,
      changeLabel: 'vs média',
      icon: 'fa-solid fa-route',
      color: 'warning'
    },
    {
      title: 'Taxa de Sucesso',
      value: '98.5%',
      change: 2.3,
      changeLabel: 'vs mês anterior',
      icon: 'fa-solid fa-chart-line',
      color: 'info'
    }
  ]);

  // Atividades recentes (mock)
  recentActivities = signal([
    {
      id: '1',
      text: 'Nova entrega agendada para Cliente ABC',
      time: '5 min atrás',
      icon: 'fa-solid fa-plus',
      color: 'primary'
    },
    {
      id: '2',
      text: 'Entrega #1234 concluída com sucesso',
      time: '15 min atrás',
      icon: 'fa-solid fa-check',
      color: 'success'
    },
    {
      id: '3',
      text: 'Motorista João atualizou status',
      time: '30 min atrás',
      icon: 'fa-solid fa-user',
      color: 'info'
    },
    {
      id: '4',
      text: 'Problema reportado na entrega #1230',
      time: '1 hora atrás',
      icon: 'fa-solid fa-exclamation',
      color: 'warning'
    },
    {
      id: '5',
      text: 'Nova rota otimizada criada',
      time: '2 horas atrás',
      icon: 'fa-solid fa-route',
      color: 'primary'
    }
  ]);

  // Tarefas pendentes (mock)
  pendingTasks = signal([
    {
      id: '1',
      title: 'Revisar relatório mensal de entregas',
      priority: 'Alta',
      priorityColor: 'danger',
      dueDate: 'Hoje',
      completed: false
    },
    {
      id: '2',
      title: 'Atualizar cadastro de clientes',
      priority: 'Média',
      priorityColor: 'warning',
      dueDate: 'Amanhã',
      completed: false
    },
    {
      id: '3',
      title: 'Verificar veículos para manutenção',
      priority: 'Baixa',
      priorityColor: 'info',
      dueDate: 'Em 3 dias',
      completed: false
    },
    {
      id: '4',
      title: 'Preparar apresentação trimestral',
      priority: 'Alta',
      priorityColor: 'danger',
      dueDate: 'Em 5 dias',
      completed: false
    }
  ]);

  // Próximas entregas (mock)
  upcomingDeliveries = signal([
    {
      id: '1',
      client: 'Empresa ABC Ltda',
      address: 'Av. Paulista, 1000 - São Paulo',
      eta: '10:30',
      status: 'in-transit',
      statusLabel: 'Em trânsito',
      statusColor: 'info'
    },
    {
      id: '2',
      client: 'Comércio XYZ',
      address: 'Rua Augusta, 500 - São Paulo',
      eta: '11:00',
      status: 'pending',
      statusLabel: 'Pendente',
      statusColor: 'warning'
    },
    {
      id: '3',
      client: 'Loja 123',
      address: 'Av. Brasil, 200 - São Paulo',
      eta: '11:45',
      status: 'pending',
      statusLabel: 'Pendente',
      statusColor: 'warning'
    },
    {
      id: '4',
      client: 'Distribuidora Norte',
      address: 'Rua Consolação, 800 - São Paulo',
      eta: '14:00',
      status: 'pending',
      statusLabel: 'Agendada',
      statusColor: 'primary'
    }
  ]);

  ngOnInit(): void {
    // TODO: Carregar dados reais da API
  }

  onPeriodChange(): void {
    // TODO: Atualizar gráfico com novos dados
    console.log('Período selecionado:', this.selectedPeriod);
  }

  toggleTask(task: { id: string; completed: boolean }): void {
    this.pendingTasks.update(tasks =>
      tasks.map(t =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      )
    );
  }
}
