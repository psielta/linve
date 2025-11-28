/**
 * Interface para notificações do sistema
 */
export interface Notification {
  /** Identificador único */
  id: string;

  /** Título da notificação */
  title: string;

  /** Mensagem/descrição */
  message: string;

  /** Tipo da notificação (define cor e ícone padrão) */
  type: 'info' | 'success' | 'warning' | 'danger';

  /** Ícone customizado (FontAwesome) */
  icon?: string;

  /** Data/hora da notificação */
  timestamp: Date;

  /** Se foi lida */
  read: boolean;

  /** Link para navegação ao clicar */
  link?: string;

  /** Dados extras para contexto */
  data?: Record<string, unknown>;
}

/**
 * Interface para quick actions do header
 */
export interface QuickAction {
  /** Identificador único */
  id: string;

  /** Texto exibido */
  label: string;

  /** Descrição curta */
  description?: string;

  /** Ícone FontAwesome */
  icon: string;

  /** Cor do ícone */
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'dark';

  /** Rota ou ação */
  route?: string;

  /** Ação customizada */
  action?: () => void;

  /** Roles que podem ver esta ação */
  roles?: ('OWNER' | 'ADMIN' | 'MEMBER')[];
}
