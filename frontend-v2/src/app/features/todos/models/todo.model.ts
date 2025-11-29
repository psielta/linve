export interface TodoInput {
  titulo: string;
  descricao?: string;
}

export interface TodoOutput {
  id: number;
  titulo: string;
  descricao?: string;
  concluido: boolean;
  dataCriacao: string;
  dataConclusao?: string;
}
