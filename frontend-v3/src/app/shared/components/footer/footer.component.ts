import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import {
  BrFooter,
  BrFooterCategory,
  BrFooterItem,
  BrFooterLegal,
  BrFooterLogo,
  BrFooterSocial,
} from "@govbr-ds/webcomponents-angular/standalone";

interface FooterItem {
  text: string;
  href: string;
}

interface FooterCategory {
  label: string;
  items: FooterItem[];
}

interface SocialLink {
  icon: string;
  description: string;
  href: string;
}

interface PartnerLogo {
  src: string;
  description: string;
  // Se sempre true, não é necessário incluí-lo aqui:
  // isPartner?: boolean;
}

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [
    CommonModule,
    BrFooter,
    BrFooterCategory,
    BrFooterSocial,
    BrFooterLogo,
    BrFooterLegal,
    BrFooterItem,
  ],
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  /** Tema do footer: "light" ou "dark" */
  @Input() public theme: "light" | "dark" = "dark";

  /** URL e descrição do logo principal */
  @Input() public mainLogo: { url: string; description: string } = {
    url: "assets/img-template-negative.png",
    description: "Logo do Site",
  };

  /** Categorias com seus itens */
  @Input() public categories: FooterCategory[] = [
    {
      label: "Categoria 1",
      items: [
        { text: "Qui esse", href: "javascript:void(0)" },
        {
          text: "Adipisicing culpa et ad consequat",
          href: "javascript:void(0)",
        },
        {
          text: "Adipisicing culpa et ad consequat",
          href: "javascript:void(0)",
        },
        { text: "Deserunt", href: "javascript:void(0)" },
      ],
    },
    {
      label: "Categoria 2",
      items: [
        {
          text: "Adipisicing culpa et ad consequat",
          href: "javascript:void(0)",
        },
        { text: "Est ex deserunt", href: "javascript:void(0)" },
        { text: "Duis incididunt consectetur", href: "javascript:void(0)" },
      ],
    },
    {
      label: "Categoria 3",
      items: [
        {
          text: "Adipisicing culpa et ad consequat",
          href: "javascript:void(0)",
        },
        { text: "Qui esse", href: "javascript:void(0)" },
      ],
    },
    {
      label: "Categoria 4",
      items: [
        { text: "Deserunt", href: "javascript:void(0)" },
        { text: "Ad deserunt nostrud", href: "javascript:void(0)" },
        { text: "Est ex deserunt", href: "javascript:void(0)" },
      ],
    },
    {
      label: "Categoria 5",
      items: [
        { text: "Duis incididunt consectetur", href: "javascript:void(0)" },
        { text: "Qui esse", href: "javascript:void(0)" },
        {
          text: "Ex qui laborum consectetur aute commodo",
          href: "javascript:void(0)",
        },
        { text: "Est ex deserunt", href: "javascript:void(0)" },
      ],
    },
    {
      label: "Categoria 6",
      items: [
        {
          text: "Ex qui laborum consectetur aute commodo",
          href: "javascript:void(0)",
        },
        { text: "Duis incididunt consectetur", href: "javascript:void(0)" },
        { text: "Deserunt", href: "javascript:void(0)" },
      ],
    },
  ];

  /** Links de redes sociais */
  @Input() public socialLinks: SocialLink[] = [
    { icon: "facebook-f", description: "Facebook", href: "javascript:void(0)" },
    { icon: "twitter", description: "Twitter", href: "javascript:void(0)" },
    {
      icon: "linkedin-in",
      description: "Linkedin",
      href: "javascript:void(0)",
    },
    { icon: "whatsapp", description: "Whatsapp", href: "javascript:void(0)" },
  ];

  /** Logos de parceiros */
  @Input() public partnerLogos: PartnerLogo[] = [
    {
      src: "assets/img-template-negative.png",
      description: "Imagem",
    },
    {
      src: "assets/img-template-negative.png",
      description: "Imagem",
    },
  ];

  /** Texto legal / licença (renderizado como HTML seguro) */
  @Input() public licenseText: string =
    "Texto destinado a exibição das informações relacionadas à <strong>licença de uso.</strong>";
}
