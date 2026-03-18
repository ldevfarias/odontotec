export const cpfMask = (value: string | undefined): string => {
    if (!value) return '';
    return value
        .replace(/\D/g, '') // substitui qualquer caracter que nao seja numero por nada
        .replace(/(\d{3})(\d)/, '$1.$2') // captura 2 grupos de numero o primeiro de 3 e o segundo de 1, apos capturar o primeiro grupo ele adiciona um ponto antes do segundo grupo de numero
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1'); // captura 2 numeros seguidos de um traço e não deixa ser digitado mais nada
};

export const phoneMask = (value: string | undefined): string => {
    if (!value) return '';
    const numericValue = value.replace(/\D/g, ''); // apenas números

    if (numericValue.length <= 10) {
        // Fixos ou celular com 8 dígitos: (00) 0000-0000
        return numericValue
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .slice(0, 14); // Limita tamanho máximo
    } else {
        // Celular com 9 dígitos: (00) 00000-0000
        return numericValue
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 15); // Limita tamanho máximo
    }
};

export const formatCurrencyInput = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) return '';
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

export const parseCurrencyInput = (value: string): number => {
    if (!value) return 0;
    const numericValue = value.replace(/\D/g, '');
    return Number(numericValue) / 100;
};
