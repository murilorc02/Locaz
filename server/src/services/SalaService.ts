import { CategoriaSala, Sala, HorarioFuncionamentoSala } from '../entity/Sala';
import { Predio } from '../entity/Predio';
import { CreateSalaDTO, UpdateSalaDTO } from '../dto/SalaDto';
import { SalaRepository } from '../repository/SalaRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';

export class SalaService {
  private salaRepository: SalaRepository;
  private predioRepository: Repository<Predio>;

  constructor() {
    this.salaRepository = new SalaRepository();
    this.predioRepository = AppDataSource.getRepository(Predio);
  }

  async criarSala(dadosSala: CreateSalaDTO): Promise<Sala> {
    const predio = await this.predioRepository.findOne({
      where: { id: dadosSala.predioId as any },
      relations: ['usuario']
    });

    if (!predio) {
      throw new Error('Prédio não encontrado. É necessário ter um prédio cadastrado para criar uma sala.');
    }

    const salaExistente = await this.salaRepository.buscarPorNomeEPredio(
      dadosSala.nome,
      dadosSala.predioId
    );

    if (salaExistente) {
      throw new Error('Já existe uma sala com este nome neste prédio');
    }

    return await this.salaRepository.criar({
      nome: dadosSala.nome,
      descricao: dadosSala.descricao,
      capacidade: dadosSala.capacidade,
      categoria: dadosSala.categoria as CategoriaSala,
      precoHora: dadosSala.precoHora,
      reservaGratuita: dadosSala.reservaGratuita || false,
      comodidades: dadosSala.comodidades || [],
      horariosFuncionamento: (dadosSala.horariosFuncionamento || []) as HorarioFuncionamentoSala[],
      predio: predio
    });
  }

  async editarSala(id: number, dadosAtualizacao: UpdateSalaDTO): Promise<Sala | null> {
    const idNumero = typeof id === 'string' ? parseInt(id) : id;
    const salaExistente = await this.salaRepository.buscarPorId(idNumero);

    if (!salaExistente) {
      throw new Error('Sala não encontrada');
    }

    if (dadosAtualizacao.nome && dadosAtualizacao.nome !== salaExistente.nome) {
      const predioId = Number(salaExistente.predio.id);

      const salaComMesmoNome = await this.salaRepository.buscarPorNomeEPredio(
        dadosAtualizacao.nome,
        predioId
      );

      if (salaComMesmoNome && salaComMesmoNome.id !== idNumero) {
        throw new Error('Já existe uma sala com este nome neste prédio');
      }
    }

    const camposParaAtualizar: Partial<Sala> = {};

    if (dadosAtualizacao.nome !== undefined) camposParaAtualizar.nome = dadosAtualizacao.nome;
    if (dadosAtualizacao.descricao !== undefined) camposParaAtualizar.descricao = dadosAtualizacao.descricao;
    if (dadosAtualizacao.capacidade !== undefined) camposParaAtualizar.capacidade = dadosAtualizacao.capacidade;
    if (dadosAtualizacao.categoria !== undefined) {
      camposParaAtualizar.categoria = dadosAtualizacao.categoria as CategoriaSala;
    }
    if (dadosAtualizacao.precoHora !== undefined) camposParaAtualizar.precoHora = dadosAtualizacao.precoHora;
    if (dadosAtualizacao.reservaGratuita !== undefined) camposParaAtualizar.reservaGratuita = dadosAtualizacao.reservaGratuita;
    if (dadosAtualizacao.comodidades !== undefined) camposParaAtualizar.comodidades = dadosAtualizacao.comodidades;
    if (dadosAtualizacao.horariosFuncionamento !== undefined) {
      camposParaAtualizar.horariosFuncionamento = dadosAtualizacao.horariosFuncionamento as HorarioFuncionamentoSala[];
    }

    if (Object.keys(camposParaAtualizar).length > 0) {
      await this.salaRepository.atualizar(idNumero, camposParaAtualizar);
    }

    return await this.salaRepository.buscarPorId(idNumero);
  }

  async buscarTodas(): Promise<Sala[]> {
    return await this.salaRepository.buscarTodas();
  }

  async buscarPorId(id: number | string): Promise<Sala | null> {
    const idNumero = typeof id === 'string' ? parseInt(id) : id;
    return await this.salaRepository.buscarPorId(idNumero);
  }

  async buscarPorPredioId(predioId: number | string): Promise<Sala[]> {
    const predioIdNumero = typeof predioId === 'string' ? parseInt(predioId) : predioId;
    return await this.salaRepository.buscarPorPredio(predioIdNumero);
  }

  async buscarPorProprietario(usuarioId: number): Promise<Sala[]> {
    return await this.salaRepository.buscarPorProprietario(usuarioId);
  }

  async buscarPorFiltros(filtros: {
    nome?: string;
    cidade?: string;
    capacidade?: number;
    categoria?: string;
    precoMinimo?: number;
    precoMaximo?: number;
    comodidades?: string[];
    predioId?: number | string;
    dataReserva?: string;
    horarioInicio?: string;
    horarioFim?: string;
    ordenarPor?: 'preco' | 'capacidade' | 'nome';
    ordem?: 'ASC' | 'DESC';
  }): Promise<Sala[]> {
    const predioIdNumero = filtros.predioId ? parseInt(String(filtros.predioId)) : undefined;

    if (filtros.dataReserva && filtros.horarioInicio && filtros.horarioFim) {
      const dataReserva = new Date(filtros.dataReserva);

      const filtrosAdicionais = {
        nome: filtros.nome,
        cidade: filtros.cidade,
        capacidade: filtros.capacidade,
        categoria: filtros.categoria,
        precoMinimo: filtros.precoMinimo,
        precoMaximo: filtros.precoMaximo,
        comodidades: filtros.comodidades,
        predioId: predioIdNumero
      };

      let salas = await this.salaRepository.buscarDisponiveis(
        dataReserva,
        filtros.horarioInicio,
        filtros.horarioFim,
        filtrosAdicionais
      );

      return this.ordenarResultados(salas, filtros.ordenarPor, filtros.ordem);
    }

    return await this.salaRepository.buscarComFiltros({
      nome: filtros.nome,
      cidade: filtros.cidade,
      capacidade: filtros.capacidade,
      categoria: filtros.categoria,
      precoMinimo: filtros.precoMinimo,
      precoMaximo: filtros.precoMaximo,
      comodidades: filtros.comodidades,
      predioId: predioIdNumero,
      ordenarPor: filtros.ordenarPor,
      ordem: filtros.ordem
    });
  }

  private ordenarResultados(
    salas: Sala[],
    ordenarPor?: 'preco' | 'capacidade' | 'nome',
    ordem: 'ASC' | 'DESC' = 'ASC'
  ): Sala[] {
    if (!ordenarPor) {
      return salas;
    }

    const multiplicador = ordem === 'ASC' ? 1 : -1;

    return salas.sort((a, b) => {
      switch (ordenarPor) {
        case 'preco':
          return (Number(a.precoHora) - Number(b.precoHora)) * multiplicador;
        case 'capacidade':
          return (a.capacidade - b.capacidade) * multiplicador;
        case 'nome':
          return a.nome.localeCompare(b.nome) * multiplicador;
        default:
          return 0;
      }
    });
  }

  async buscarDisponiveis(dataReserva: Date, horarioInicio: string, horarioFim: string): Promise<Sala[]> {
    return await this.salaRepository.buscarDisponiveis(dataReserva, horarioInicio, horarioFim);
  }

  async excluirSala(id: number): Promise<void> {
    const sala = await this.salaRepository.buscarPorId(id);

    if (!sala) {
      throw new Error('Sala não encontrada');
    }

    const reservasAtivas = await this.salaRepository.contarReservasAtivas(id);

    if (reservasAtivas > 0) {
      throw new Error('Não é possível excluir uma sala que possui reservas ativas ou futuras');
    }

    await this.salaRepository.excluir(id);
  }

  async contarPorPredio(predioId: number): Promise<number> {
    return await this.salaRepository.contarPorPredio(predioId);
  }

  async buscarPorCategoria(categoria: CategoriaSala): Promise<Sala[]> {
    return await this.salaRepository.buscarPorCategoria(categoria);
  }

  async verificarDisponibilidade(
    salaId: number,
    dataReserva: Date,
    horarioInicio: string,
    horarioFim: string
  ): Promise<boolean> {
    return await this.salaRepository.verificarDisponibilidade(
      salaId,
      dataReserva,
      horarioInicio,
      horarioFim
    );
  }

  async obterComodidadesDisponiveis(): Promise<string[]> {
    return await this.salaRepository.obterComodidadesDisponiveis();
  }

  async obterCategoriasDisponiveis(): Promise<string[]> {
    return await this.salaRepository.obterCategoriasDisponiveis();
  }

  async obterEstatisticas(): Promise<{
    totalSalas: number;
    porCategoria: Array<{ categoria: string; total: number }>;
    capacidadeMedia: number;
    precoMedio: number;
  }> {
    return await this.salaRepository.obterEstatisticas();
  }

  async obterHorariosDisponiveis(salaId: number, dataReserva: string): Promise<{
    data: string;
    sala: {
      id: number;
      nome: string;
      precoHora: number;
    };
    horarios: Array<{
      horario: string;
      disponivel: boolean;
      preco: number;
    }>;
  }> {
    const sala = await this.salaRepository.buscarPorId(salaId);

    if (!sala) {
      throw new Error('Sala não encontrada');
    }

    const reservas = await this.salaRepository.buscarReservasPorSalaEData(salaId, dataReserva);

    const horarios = [];
    for (let hora = 7; hora < 19; hora++) {
      const horarioInicio = `${hora.toString().padStart(2, '0')}:00`;
      const horarioFim = `${(hora + 1).toString().padStart(2, '0')}:00`;

      const ocupado = reservas?.reservas?.some(reserva => {
        const reservaInicio = reserva.horarioInicio;
        const reservaFim = reserva.horarioFim;

        return (
          (horarioInicio >= reservaInicio && horarioInicio < reservaFim) ||
          (horarioFim > reservaInicio && horarioFim <= reservaFim) ||
          (horarioInicio <= reservaInicio && horarioFim >= reservaFim)
        );
      }) || false;

      horarios.push({
        horario: horarioInicio,
        disponivel: !ocupado,
        preco: Number(sala.precoHora)
      });
    }

    return {
      data: dataReserva,
      sala: {
        id: sala.id,
        nome: sala.nome,
        precoHora: Number(sala.precoHora)
      },
      horarios
    };
  }

  async atualizarHorariosFuncionamento(
    salaId: number,
    horariosFuncionamento: Array<{
      diaSemana: string;
      horarioAbertura: string;
      horarioFechamento: string;
      ativo: boolean;
    }>
  ): Promise<Sala | null> {
    const sala = await this.salaRepository.buscarPorId(salaId);

    if (!sala) {
      throw new Error('Sala não encontrada');
    }

    // Validar se todos os dias da semana estão presentes
    const diasValidos = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    const diasRecebidos = horariosFuncionamento.map(h => h.diaSemana);

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

    await this.salaRepository.atualizar(salaId, {
      horariosFuncionamento: horariosFuncionamento as any
    });

    return await this.salaRepository.buscarPorId(salaId);
  }

  private converterHorarioParaMinutos(horario: string): number {
    const [horas, minutos] = horario.split(':').map(Number);
    return horas * 60 + minutos;
  }
}