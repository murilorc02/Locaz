import { PredioRepository } from '../repository/PredioRepository';
import { HorarioPredioRepository } from '../repository/HorarioPredioRepository';
import { Predio } from '../entity/Predio';
import { HorarioFuncionamentoDto, DiaSemana } from '../dto/PredioDto';
import { Usuario } from '../entity/Usuario';

export class PredioService {
  private predioRepository: PredioRepository;
  private horarioPredioRepository: HorarioPredioRepository;

  constructor() {
    this.predioRepository = new PredioRepository();
    this.horarioPredioRepository = new HorarioPredioRepository();
  }

  async criarPredio(dados: {
    nome: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    descricao?: string;
    usuarioId: number;
    horariosFuncionamento?: HorarioFuncionamentoDto[];
  }): Promise<Predio> {
    const { horariosFuncionamento, usuarioId, ...dadosBasicos } = dados;

    // Validação de duplicação de nome
    const predioExistente = await this.predioRepository.buscarPorNome(dadosBasicos.nome);
    if (predioExistente) {
      throw new Error('Já existe um prédio com este nome');
    }

    // Criar prédio com relacionamento correto
    const predio = await this.predioRepository.criar({
      ...dadosBasicos,
      usuario: { id: usuarioId } as Usuario
    });

    // Criar horários se fornecidos
    if (horariosFuncionamento && horariosFuncionamento.length > 0) {
      await this.horarioPredioRepository.criarMultiplos(
        predio.id,
        horariosFuncionamento
      );
    }

    // Retornar prédio com todas as relações
    return (await this.predioRepository.buscarPorId(predio.id)) as Predio;
  }

  async editarPredio(
    id: number,
    dados: {
      nome?: string;
      endereco?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
      descricao?: string;
      horariosFuncionamento?: HorarioFuncionamentoDto[];
    }
  ): Promise<Predio | null> {
    const predioExistente = await this.predioRepository.buscarPorId(id);
    if (!predioExistente) {
      throw new Error('Prédio não encontrado');
    }

    const { horariosFuncionamento, ...dadosBasicos } = dados;

    // Validar nome único (se alterado)
    if (dadosBasicos.nome && dadosBasicos.nome.trim() !== predioExistente.nome.trim()) {
      const exists = await this.predioRepository.existeNome(dadosBasicos.nome.trim(), id);
      if (exists) {
        throw new Error('Já existe um prédio com este nome');
      }
    }

    // Preparar dados para atualização (apenas campos não undefined)
    const camposParaAtualizar: Partial<Predio> = {};
    if (dadosBasicos.nome !== undefined) camposParaAtualizar.nome = dadosBasicos.nome;
    if (dadosBasicos.endereco !== undefined) camposParaAtualizar.endereco = dadosBasicos.endereco;
    if (dadosBasicos.cidade !== undefined) camposParaAtualizar.cidade = dadosBasicos.cidade;
    if (dadosBasicos.estado !== undefined) camposParaAtualizar.estado = dadosBasicos.estado;
    if (dadosBasicos.cep !== undefined) camposParaAtualizar.cep = dadosBasicos.cep;
    if (dadosBasicos.descricao !== undefined) camposParaAtualizar.descricao = dadosBasicos.descricao;

    // Atualizar dados básicos
    if (Object.keys(camposParaAtualizar).length > 0) {
      await this.predioRepository.atualizar(id, camposParaAtualizar);
    }

    // Atualizar horários se fornecidos
    if (horariosFuncionamento !== undefined) {
      await this.horarioPredioRepository.deletarPorPredio(id);
      if (horariosFuncionamento.length > 0) {
        await this.horarioPredioRepository.criarMultiplos(id, horariosFuncionamento);
      }
    }

    return await this.predioRepository.buscarPorId(id);
  }

  async buscarPorId(id: number): Promise<Predio | null> {
    return await this.predioRepository.buscarPorId(id);
  }

  async buscarTodos(): Promise<Predio[]> {
    return await this.predioRepository.buscarTodos();
  }

  async buscarPorNome(nome: string): Promise<Predio | null> {
    return await this.predioRepository.buscarPorNome(nome);
  }

  async buscarPorUsuario(usuarioId: number): Promise<Predio[]> {
    return await this.predioRepository.buscarPorUsuario(usuarioId);
  }

  async buscarPorCidade(cidade: string): Promise<Predio[]> {
    return await this.predioRepository.buscarPorCidade(cidade);
  }

  async buscarHorariosPorPredio(predioId: number) {
    return await this.horarioPredioRepository.buscarPorPredio(predioId);
  }

  async excluirPredio(id: number): Promise<void> {
    const predioExistente = await this.predioRepository.buscarPorId(id);
    if (!predioExistente) {
      throw new Error('Prédio não encontrado');
    }

    // Remover horários primeiro (FK constraint)
    await this.horarioPredioRepository.deletarPorPredio(id);

    // Remover prédio
    await this.predioRepository.excluir(id);
  }

  async verificarFuncionamento(
    predioId: number,
    diaSemana: string,
    horario: string
  ): Promise<boolean> {
    // Validar se o diaSemana é um valor válido do enum
    const diaValido = Object.values(DiaSemana).includes(diaSemana as DiaSemana);
    if (!diaValido) {
      throw new Error(`Dia da semana inválido: ${diaSemana}`);
    }

    const horarioPredio = await this.horarioPredioRepository.buscarPorDia(
      predioId,
      diaSemana as DiaSemana
    );

    if (!horarioPredio) {
      return false;
    }

    const horarioFormatado = this.formatarHorario(horario);
    const abertura = this.formatarHorario(horarioPredio.horarioAbertura || '08:00');
    const fechamento = this.formatarHorario(horarioPredio.horarioFechamento || '18:00');

    return horarioFormatado >= abertura && horarioFormatado <= fechamento;
  }

  private formatarHorario(horario: string): number {
    const [horas, minutos] = horario.split(':').map(Number);
    return horas * 100 + minutos;
  }
}