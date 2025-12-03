import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrButton } from '@govbr-ds/webcomponents-angular/standalone';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, BrButton],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  private readonly HEADER_OFFSET = 80;
  private readonly SCROLL_DURATION = 800;

  scrollToSection(event: Event, sectionId: string): void {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (!element) return;

    const targetPosition = element.getBoundingClientRect().top + window.scrollY - this.HEADER_OFFSET;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    // Easing function (easeInOutCubic)
    const easeInOutCubic = (t: number): number => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.SCROLL_DURATION, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }

  features = [
    { icon: 'fas fa-shopping-bag', title: 'Gestão de Pedidos', description: 'Receba e gerencie pedidos de múltiplos canais.', bgColor: '#FDE68A', iconColor: '#92400E' },
    { icon: 'fas fa-book', title: 'Cardápio Digital', description: 'Categorias, produtos com variações e complementos.', bgColor: '#A5F3FC', iconColor: '#0E7490' },
    { icon: 'fas fa-building', title: 'Multi-Tenant', description: 'Gerencie múltiplas lojas ou franquias.', bgColor: '#C7D2FE', iconColor: '#4338CA' },
    { icon: 'fas fa-chart-bar', title: 'Dashboard', description: 'Acompanhe vendas em tempo real.', bgColor: '#CBD5E1', iconColor: '#475569' },
    { icon: 'fas fa-users', title: 'Clientes', description: 'Cadastro e histórico de compras.', bgColor: '#FED7AA', iconColor: '#C2410C' },
    { icon: 'fas fa-moon', title: 'Tema Escuro', description: 'Interface adaptável ao seu estilo.', bgColor: '#FBCFE8', iconColor: '#BE185D' },
    { icon: 'fas fa-truck', title: 'Entregas', description: 'Acompanhe status em tempo real.', bgColor: '#99F6E4', iconColor: '#0F766E' },
    { icon: 'fas fa-link', title: 'Integrações', description: 'iFood, UaiRango e WhatsApp.', bgColor: '#BFDBFE', iconColor: '#1D4ED8' },
    { icon: 'fas fa-file', title: 'Relatórios', description: 'Exportação em PDF e Excel.', bgColor: '#E9D5FF', iconColor: '#7C3AED' }
  ];

  plans = [
    {
      name: 'Básico',
      price: 'R$49',
      features: ['1 Estabelecimento', 'Gestão de Pedidos', 'Cardápio Digital', 'Relatórios Básicos'],
      buttonLabel: 'Começar'
    },
    {
      name: 'Profissional',
      price: 'R$99',
      features: ['Até 3 Estabelecimentos', 'Integração iFood', 'Dashboard Avançado', 'Suporte Prioritário'],
      buttonLabel: 'Começar'
    },
    {
      name: 'Enterprise',
      price: 'R$199',
      features: ['Estabelecimentos Ilimitados', 'Todas as Integrações', 'API Personalizada', 'Suporte 24/7'],
      buttonLabel: 'Fale Conosco'
    }
  ];
}
