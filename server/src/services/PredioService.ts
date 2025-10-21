import { PredioRepository } from '../repository/PredioRepository';
import { Predio } from '../entity/Predio';
import { HorarioFuncionamentoDto, DiaSemana, obterTodosDiasSemana } from '../dto/PredioDto';
import { Usuario } from '../entity/Usuario';

export class PredioService {
  private predioRepository: PredioRepository;

  constructor() {
    this.predioRepository = new PredioRepository();
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

    const predioExistente = await this.predioRepository.buscarPorNome(dadosBasicos.nome);
    if (predioExistente) {
      throw new Error('Já existe um prédio com este nome');
    }

    const predio = await this.predioRepository.criar({
      ...dadosBasicos,
      horariosFuncionamento: horariosFuncionamento || [],
      usuario: { id: usuarioId } as Usuario
    });

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

    if (dadosBasicos.nome && dadosBasicos.nome.trim() !== predioExistente.nome.trim()) {
      const exists = await this.predioRepository.existeNome(dadosBasicos.nome.trim(), id);
      if (exists) {
        throw new Error('Já existe um prédio com este nome');
      }
    }

    const camposParaAtualizar: Partial<Predio> = {};
    if (dadosBasicos.nome !== undefined) camposParaAtualizar.nome = dadosBasicos.nome;
    if (dadosBasicos.endereco !== undefined) camposParaAtualizar.endereco = dadosBasicos.endereco;
    if (dadosBasicos.cidade !== undefined) camposParaAtualizar.cidade = dadosBasicos.cidade;
    if (dadosBasicos.estado !== undefined) camposParaAtualizar.estado = dadosBasicos.estado;
    if (dadosBasicos.cep !== undefined) camposParaAtualizar.cep = dadosBasicos.cep;
    if (dadosBasicos.descricao !== undefined) camposParaAtualizar.descricao = dadosBasicos.descricao;
    if (horariosFuncionamento !== undefined) camposParaAtualizar.horariosFuncionamento = horariosFuncionamento as any;

    if (Object.keys(camposParaAtualizar).length > 0) {
      await this.predioRepository.atualizar(id, camposParaAtualizar);
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
    const predio = await this.predioRepository.buscarPorId(predioId);

    if (!predio) {
      throw new Error('Prédio não encontrado');
    }

    return predio.horariosFuncionamento || [];
  }

  async excluirPredio(id: number): Promise<void> {
    const predioExistente = await this.predioRepository.buscarPorId(id);
    if (!predioExistente) {
      throw new Error('Prédio não encontrado');
    }

    // Apenas remover o prédio (horários estão no JSONB)
    await this.predioRepository.excluir(id);
  }

  async verificarFuncionamento(
    predioId: number,
    diaSemana: string,
    horario: string
  ): Promise<boolean> {
    const predio = await this.predioRepository.buscarPorId(predioId);

    if (!predio || !predio.horariosFuncionamento) {
      return false;
    }

    const horarioDia = predio.horariosFuncionamento.find(
      h => h.diaSemana === diaSemana && h.ativo
    );

    if (!horarioDia) {
      return false;
    }

    const horarioFormatado = this.formatarHorario(horario);
    const abertura = this.formatarHorario(horarioDia.horarioAbertura);
    const fechamento = this.formatarHorario(horarioDia.horarioFechamento);

    return horarioFormatado >= abertura && horarioFormatado <= fechamento;
  }

  private formatarHorario(horario: string): number {
    const [horas, minutos] = horario.split(':').map(Number);
    return horas * 100 + minutos;
  }

  async atualizarHorariosFuncionamento(
    predioId: number,
    horariosFuncionamento: HorarioFuncionamentoDto[]
  ): Promise<Predio | null> {
    const predio = await this.predioRepository.buscarPorId(predioId);

    if (!predio) {
      throw new Error('Prédio não encontrado');
    }

    // Obter todos os dias válidos do enum
    const diasValidos = obterTodosDiasSemana();
    
    // Converter os dias recebidos para string
    const diasRecebidos = horariosFuncionamento.map(h => h.diaSemana as string);

    const diasFaltantes = diasValidos.filter(dia => !diasRecebidos.includes(dia));
    if (diasFaltantes.length > 0) {
      throw new Error(`Dias da semana faltantes: ${diasFaltantes.join(', ')}`);
    }

    // Validar horários
    for (const horario of horariosFuncionamento) {
      const abertura = this.converterHorarioParaMinutos(horario.horarioAbertura);
      const fechamento = this.converterHorarioParaMinutos(horario.horarioFechamento);

      if (abertura >= fechamento) {
        throw new Error(`Horário de abertura deve ser menor que horário de fechamento para ${horario.diaSemana}`);
      }
    }

    await this.predioRepository.atualizar(predioId, {
      horariosFuncionamento: horariosFuncionamento as any
    });

    return await this.predioRepository.buscarPorId(predioId);
  }

  private converterHorarioParaMinutos(horario: string): number {
    const [horas, minutos] = horario.split(':').map(Number);
    return horas * 60 + minutos;
  }
}