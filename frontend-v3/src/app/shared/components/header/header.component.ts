import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  CUSTOM_ELEMENTS_SCHEMA,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ThemeService } from "../../../core/services/theme.service";
import { OrganizationSwitcherComponent } from "../organization-switcher/organization-switcher.component";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule, OrganizationSwitcherComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private themeService = inject(ThemeService);

  /** Estado reativo do dark mode */
  isDarkMode = this.themeService.isDarkMode;

  /** URL completa do avatar do usuário */
  userAvatarUrl = computed(() => {
    const avatar = this.authService.user()?.avatar;
    if (!avatar) return null;
    const baseUrl = environment.baseUrl.replace(/\/$/, '');
    return avatar.startsWith('http') ? avatar : `${baseUrl}${avatar.startsWith('/') ? avatar : '/' + avatar}`;
  });

  /** Iniciais do usuário para fallback */
  userInitials = computed(() => {
    const nome = this.authService.currentUserName();
    const parts = nome.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (nome || 'U').substring(0, 2).toUpperCase();
  });
  /** URL e texto alternativo do logo */
  @Input() public logoUrl: string = "assets/dog.svg";
  @Input() public logoAlt: string = "Linve Logo";

  /** Texto que aparece ao lado do logo */
  @Input() public headerSign: string = "Linve";

  /** Título e subtítulo do header */
  @Input() public headerTitle: string = "Linve";

  /** Labels e placeholder do campo de busca */
  @Input() public searchLabel: string = "Texto da pesquisa";
  @Input() public searchPlaceholder: string = "O que você procura?";

  /**
   * Caso queira gerar um menu dinâmico,
   * basta passar um array de objetos { label, route }.
   * Use *ngFor no template.
   */
  @Input() public menuItems: { label: string; route: string }[] = [];

  /**
   * Controla se o menu responsivo está visível.
   * Pode ser inicializado pelo componente-pai:
   * <app-header [menuVisible]="valorInicial" …>.
   */
  @Input() public menuVisible: boolean = false;

  /** Dispara sempre que menuVisible for alternado */
  @Output() public menuToggled = new EventEmitter<boolean>();

  /** Dispara quando o usuário submete um termo de busca */
  @Output() public searchSubmitted = new EventEmitter<string>();

  /** Controla visibilidade da área de busca */
  public isSearchOpen = false;

  /** Armazena o texto digitado no campo de busca */
  public searchQuery = "";

  /** Controla visibilidade do dropdown do usuário */
  public isDropdownOpen = false;

  /** Fecha dropdown ao clicar fora */
  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  /**
   * Inverte menuVisible e emite menuToggled com o valor atual.
   */
  public toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
    this.menuToggled.emit(this.menuVisible);
  }

  /** Abre a área de busca */
  public openSearch(): void {
    this.isSearchOpen = true;
  }

  /** Fecha a área de busca e limpa o searchQuery */
  public closeSearch(): void {
    this.isSearchOpen = false;
    this.searchQuery = "";
  }

  /**
   * Emite o termo de busca se não estiver vazio (após trim).
   */
  public submitSearch(): void {
    const termo = this.searchQuery.trim();
    if (termo) {
      this.searchSubmitted.emit(termo);
    }
  }

  /** Retorna o nome do usuário logado */
  public get userName(): string {
    return this.authService.currentUserName();
  }

  /** Retorna se o usuário está logado */
  public get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /** Alterna visibilidade do dropdown */
  public toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /** Faz logout e redireciona para a landing page */
  public logout(): void {
    this.isDropdownOpen = false;
    this.authService.logout();
    this.router.navigate(["/"]);
  }

  /** Vai para a página de conta do usuário */
  public goToAccount(): void {
    this.isDropdownOpen = false;
    this.router.navigate(["/app/account"]);
  }

  /** Alterna entre dark mode e light mode */
  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
