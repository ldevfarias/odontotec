import { z } from 'zod';

// Regex utilitárias
export const regex = {
    cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    phone: /^\(\d{2}\)\s?9?\d{4}-\d{4}$/, // aceita com ou sem 9
};

// Validar CPF real
export function isValidCPF(cpfParams: string | null | undefined): boolean {
    if (!cpfParams) return false;
    const cpf = cpfParams.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    const cpfArray = cpf.split('').map((el) => +el);
    const rest = (count: number): number => {
        return (
            ((cpfArray
                .slice(0, count - 12)
                .reduce((soma, el, index) => soma + el * (count - index), 0) *
                10) %
                11) %
            10
        );
    };
    return rest(10) === cpfArray[9] && rest(11) === cpfArray[10];
}

export const commonValidations = {
    // stringLimit evita truncate error no BD
    stringLimit: (max: number = 255) => z.string().max(max, `Máximo de ${max} caracteres.`),

    // Email com stringLimit
    email: z.string().email('E-mail inválido.').max(100, 'E-mail muito longo.'),

    // CPF com stringLimit, formato e lógica
    cpf: z
        .string()
        .min(14, 'Deve conter 14 caracteres.')
        .max(14, 'Deve conter 14 caracteres.')
        .regex(regex.cpf, 'Formato inválido.')
        .refine((val) => isValidCPF(val), {
            message: 'CPF inválido.',
        }),

    // Telefone
    phone: z
        .string()
        .max(15, 'Formato inválido.')
        .regex(regex.phone, 'Formato inválido.'),

    // Data de nascimento
    birthDate: z
        .string()
        .refine((val) => {
            if (!val) return true; // pode ser omitido caso o campo não seja obrigatório (Zod "optional" cuidará disso)
            const inputDate = new Date(val);
            const today = new Date();
            // normaliza para meia-noite localmente para a comparação do dia exato
            today.setHours(0, 0, 0, 0);
            // no JS base o Date parsing com YYYY-MM-DD cria a data em UTC meia noite.
            // Aqui precisávamos de cuidados extras se envolver fuso-horários, mas input type="date"
            // usando new Date(val) pode resultar no dia anterior às vezes dependendo da versão do node/browser e GMT.
            // Para "YYYY-MM-DD", é melhor quebrar as partes caso de erro:
            const [year, month, day] = val.split('-').map(Number);
            if (year && month && day) {
                const dateObj = new Date(year, month - 1, day);
                dateObj.setHours(0, 0, 0, 0);
                return dateObj < today;
            }
            return inputDate < today; // deve ser estritamente no passado
        }, {
            message: 'A data deve estar no passado.',
        }),
};
