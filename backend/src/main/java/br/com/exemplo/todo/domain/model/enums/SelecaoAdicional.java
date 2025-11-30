package br.com.exemplo.todo.domain.model.enums;

public enum SelecaoAdicional {
    U, // Unico: escolher exatamente 1
    M, // Multiplo: zero ou mais, com limite opcional
    Q  // Quantidade multipla: minimo/limite obrigatorios
}

