import { MenuItem } from '../../../core/models/menu-item.model';

/**
 * Configuração do menu principal do Admin Dashboard
 * Inspirado no Metronic 8 Theme
 */
export const ADMIN_MENU: MenuItem[] = [
  // Dashboard
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'fa-solid fa-gauge-high',
    route: '/dashboard'
  },

  // Separador - Gestão
  {
    id: 'sep-gestao',
    label: 'GESTÃO',
    separator: true
  },

  // Tarefas
  {
    id: 'todos',
    label: 'Tarefas',
    icon: 'fa-solid fa-list-check',
    route: '/todos'
  },

  // Projetos (exemplo de submenu - futuro)
  // {
  //   id: 'projects',
  //   label: 'Projetos',
  //   icon: 'fa-solid fa-folder-open',
  //   children: [
  //     { id: 'projects-list', label: 'Todos os Projetos', route: '/projects' },
  //     { id: 'projects-create', label: 'Novo Projeto', route: '/projects/new', roles: ['OWNER', 'ADMIN'] },
  //     { id: 'projects-archived', label: 'Arquivados', route: '/projects/archived' }
  //   ]
  // },

  // Relatórios (exemplo de submenu - futuro)
  // {
  //   id: 'reports',
  //   label: 'Relatórios',
  //   icon: 'fa-solid fa-chart-pie',
  //   children: [
  //     { id: 'reports-overview', label: 'Visão Geral', route: '/reports/overview' },
  //     { id: 'reports-productivity', label: 'Produtividade', route: '/reports/productivity' },
  //     { id: 'reports-export', label: 'Exportar', route: '/reports/export' }
  //   ]
  // },

  // Separador - Administração (apenas OWNER e ADMIN)
  {
    id: 'sep-admin',
    label: 'ADMINISTRAÇÃO',
    separator: true,
    roles: ['OWNER', 'ADMIN']
  },

  // Usuários (apenas OWNER e ADMIN)
  {
    id: 'users',
    label: 'Usuários',
    icon: 'fa-solid fa-users',
    route: '/users',
    roles: ['OWNER', 'ADMIN']
  },

  // Configurações
  {
    id: 'settings',
    label: 'Configurações',
    icon: 'fa-solid fa-gear',
    route: '/settings',
    children: [
      {
        id: 'settings-profile',
        label: 'Meu Perfil',
        icon: 'fa-solid fa-user',
        route: '/settings/profile'
      },
      {
        id: 'settings-security',
        label: 'Segurança',
        icon: 'fa-solid fa-shield-halved',
        route: '/settings/security'
      },
      {
        id: 'settings-org',
        label: 'Organização',
        icon: 'fa-solid fa-building',
        route: '/settings/organization',
        roles: ['OWNER']
      }
    ]
  }
];

/**
 * Filtra itens do menu baseado no role do usuário
 */
export function filterMenuByRole(
  items: MenuItem[],
  userRole: 'OWNER' | 'ADMIN' | 'MEMBER' | null
): MenuItem[] {
  if (!userRole) return [];

  return items
    .filter(item => {
      // Se não tem restrição de role, mostra para todos
      if (!item.roles || item.roles.length === 0) return true;
      // Verifica se o role do usuário está na lista permitida
      return item.roles.includes(userRole);
    })
    .map(item => {
      // Se tem filhos, filtra recursivamente
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterMenuByRole(item.children, userRole)
        };
      }
      return item;
    })
    // Remove itens com filhos vazios após filtro
    .filter(item => {
      if (item.children) {
        return item.children.length > 0;
      }
      return true;
    });
}

