import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./header.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  /** URL e texto alternativo do logo */
  @Input() public logoUrl: string = "assets/img-template.png";
  @Input() public logoAlt: string = "logo";

  /** Texto que aparece ao lado do logo */
  @Input() public headerSign: string =
    "Quickstart Angular - Web Components 2.0";

  /** Título e subtítulo do header */
  @Input() public headerTitle: string = "Template básico";

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

  /** Faz logout e redireciona para a landing page */
  public logout(): void {
    this.authService.logout();
    this.router.navigate(["/"]);
  }
}
