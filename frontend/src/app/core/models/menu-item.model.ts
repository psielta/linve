/**
 * Interface para itens do menu do sidebar
 * Suporta menus hierárquicos com submenus infinitos
 */
export interface MenuItem {
  /** Identificador único do item */
  id: string;

  /** Texto exibido no menu */
  label: string;

  /** Classe do ícone FontAwesome (ex: 'fa-solid fa-gauge-high') */
  icon?: string;

  /** Rota do Angular Router */
  route?: string;

  /** Subitens do menu (para menus hierárquicos) */
  children?: MenuItem[];

  /** Roles que podem ver este item (vazio = todos) */
  roles?: ('OWNER' | 'ADMIN' | 'MEMBER')[];

  /** Badge de contagem/status */
  badge?: MenuBadge;

  /** Se true, renderiza como separador/título de seção */
  separator?: boolean;

  /** Se o item está desabilitado */
  disabled?: boolean;

  /** Link externo (abre em nova aba) */
  externalUrl?: string;
}

export interface MenuBadge {
  /** Texto do badge */
  text: string;

  /** Cor do badge (usa classes badge-light-{color}) */
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

/**
 * Interface para breadcrumb
 */
export interface Breadcrumb {
  /** Texto exibido */
  label: string;

  /** Rota (opcional - último item não tem rota) */
  route?: string;

  /** Ícone opcional */
  icon?: string;
}
