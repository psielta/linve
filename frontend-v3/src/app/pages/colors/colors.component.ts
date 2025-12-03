import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BrIcon,
  BrInput,
  BrMessage,
} from '@govbr-ds/webcomponents-angular/standalone';
import { colors } from '../../../data/cores';

@Component({
  selector: 'app-colors',
  standalone: true,
  imports: [CommonModule, FormsModule, BrInput, BrMessage, BrIcon],
  templateUrl: './colors.component.html',
  styleUrls: ['./colors.component.css'],
})
export class ColorsComponent {
  searchTerm = '';
  clickedCard: string | null = null;
  mensagemVisivel = false;
  mensagemTexto = '';

  colors = colors;

  get filteredColors() {
    return this.colors.filter((color) => {
      const term = this.searchTerm.toLowerCase();
      return (
        !term ||
        color.nome.toLowerCase().includes(term) ||
        color.hex.toLowerCase().includes(term) ||
        (color.token?.toLowerCase().includes(term) ?? false)
      );
    });
  }

  handleCardClick(color: { nome: string; hex: string; token?: string }) {
    this.clickedCard = color.nome;
    const texto = `
Nome: ${color.nome}
Hexadecimal: ${color.hex}
Token: ${color.token ?? 'N/A'}`;
    navigator.clipboard
      .writeText(texto)
      .then(() => {
        this.mensagemTexto = `Cor copiada com sucesso!\n${texto}`;
        this.mensagemVisivel = true;
      })
      .catch(() => {
        this.mensagemTexto =
          'Erro ao copiar a cor. Por favor, tente novamente.';
        this.mensagemVisivel = true;
      });
    setTimeout(() => (this.clickedCard = null), 500);
  }
}
