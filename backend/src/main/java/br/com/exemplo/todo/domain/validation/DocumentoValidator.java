package br.com.exemplo.todo.domain.validation;

public final class DocumentoValidator {

    private DocumentoValidator() {
        // Utility class
    }

    /**
     * Valida se o documento e um CPF ou CNPJ valido
     */
    public static boolean isValid(String documento) {
        if (documento == null || documento.isBlank()) {
            return true; // documento opcional
        }

        String numeros = documento.replaceAll("[^0-9]", "");

        if (numeros.length() == 11) {
            return isValidCpf(numeros);
        } else if (numeros.length() == 14) {
            return isValidCnpj(numeros);
        }

        return false;
    }

    /**
     * Verifica se e um CPF (11 digitos)
     */
    public static boolean isCpf(String documento) {
        if (documento == null) return false;
        return documento.replaceAll("[^0-9]", "").length() == 11;
    }

    /**
     * Verifica se e um CNPJ (14 digitos)
     */
    public static boolean isCnpj(String documento) {
        if (documento == null) return false;
        return documento.replaceAll("[^0-9]", "").length() == 14;
    }

    private static boolean isValidCpf(String cpf) {
        // Verifica se todos os digitos sao iguais
        if (cpf.matches("(\\d)\\1{10}")) {
            return false;
        }

        try {
            // Calcula primeiro digito verificador
            int soma = 0;
            for (int i = 0; i < 9; i++) {
                soma += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
            }
            int resto = soma % 11;
            int digito1 = (resto < 2) ? 0 : 11 - resto;

            if (digito1 != Character.getNumericValue(cpf.charAt(9))) {
                return false;
            }

            // Calcula segundo digito verificador
            soma = 0;
            for (int i = 0; i < 10; i++) {
                soma += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
            }
            resto = soma % 11;
            int digito2 = (resto < 2) ? 0 : 11 - resto;

            return digito2 == Character.getNumericValue(cpf.charAt(10));
        } catch (Exception e) {
            return false;
        }
    }

    private static boolean isValidCnpj(String cnpj) {
        // Verifica se todos os digitos sao iguais
        if (cnpj.matches("(\\d)\\1{13}")) {
            return false;
        }

        try {
            int[] peso1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
            int[] peso2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

            // Calcula primeiro digito verificador
            int soma = 0;
            for (int i = 0; i < 12; i++) {
                soma += Character.getNumericValue(cnpj.charAt(i)) * peso1[i];
            }
            int resto = soma % 11;
            int digito1 = (resto < 2) ? 0 : 11 - resto;

            if (digito1 != Character.getNumericValue(cnpj.charAt(12))) {
                return false;
            }

            // Calcula segundo digito verificador
            soma = 0;
            for (int i = 0; i < 13; i++) {
                soma += Character.getNumericValue(cnpj.charAt(i)) * peso2[i];
            }
            resto = soma % 11;
            int digito2 = (resto < 2) ? 0 : 11 - resto;

            return digito2 == Character.getNumericValue(cnpj.charAt(13));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Remove formatacao do documento (pontos, tracos, barras)
     */
    public static String limpar(String documento) {
        if (documento == null) return null;
        return documento.replaceAll("[^0-9]", "");
    }
}
