export interface Todo {
  id: number;
  titulo: string;
  descricao?: string;
  concluido: boolean;
  dataCriacao: string;
  dataConclusao?: string;
}

export interface TodoInput {
  titulo: string;
  descricao?: string;
}
