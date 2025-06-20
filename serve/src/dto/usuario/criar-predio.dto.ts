export class CreatePredioDto {
    nomePredio!: string;
    endereco!: string;
    cidade!: string;
    estado!: string;
    cep!: string;
    descricao!: string;
    comodidades!: string[]; // Ex: ['Wi-fi', 'Café']
    proprietarioId!: number;
}