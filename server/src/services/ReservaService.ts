import reservaRepository from '../repository/ReservaRepository';
import { Reserva, StatusReserva } from '../entity/Reserva';
import {
  CriarReservaDto,
  AceitarReservaDto,
  RecusarReservaDto,
  CancelarReservaDto,
} from '../dto/ReservaDto';

class ReservaService {
  // ==================== MÉTODOS DO LOCATÁRIO ====================

  /**
   * 1. Criar nova reserva
   */
  async criar(dto: CriarReservaDto): Promise<Reserva> {
    this.validarCamposObrigatorios(dto);
    this.validarFormatoData(dto.dataReservada);
    this.validarFormatoHorario(dto.horarioInicio);
    this.validarFormatoHorario(dto.horarioFim);
    this.validarValorTotal(dto.valorTotal);
    this.validarPrazoMinimo(dto.dataReservada, dto.horarioInicio);
    this.validarPrazoMaximo(dto.dataReservada);

    const disponivel = await reservaRepository.verificarDisponibilidade(
      dto.salaId,
      new Date(dto.dataReservada),
      dto.horarioInicio,
      dto.horarioFim,
    );

    if (!disponivel) {
      throw new Error('Horário já está reservado');
    }

    const reserva = await reservaRepository.criar({
      sala: { id: dto.salaId } as any,
      locatario: { id: dto.locatarioId! } as any,
      dataReserva: new Date(dto.dataReservada),
      horarioInicio: dto.horarioInicio,
      horarioFim: dto.horarioFim,
      valorTotal: dto.valorTotal,
      status: StatusReserva.PENDENTE,
      observacoes: dto.observacoes,
    });

    return reserva;
  }

  /**
   * 2. Buscar reserva por ID (locatário)
   */
  async buscarPorIdLocatario(id: number, idLocatario: number): Promise<Reserva> {
    if (!id) {
      throw new Error('ID inválido');
    }

    const reserva = await reservaRepository.buscarPorId(id);

    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }

    if (reserva.locatario.id !== idLocatario) {
      throw new Error('Você não tem permissão para visualizar esta reserva');
    }

    return reserva;
  }

  /**
   * 3. Buscar reservas por ID de prédio (locatário)
   */
  async buscarPorPredioLocatario(idPredio: number, idLocatario: number): Promise<Reserva[]> {
    if (!idPredio) {
      throw new Error('ID do prédio inválido');
    }

    if (!idLocatario) {
      throw new Error('ID do locatário inválido');
    }

    return await reservaRepository.buscarPorPredioLocatario(idPredio, idLocatario);
  }

  /**
   * 4. Buscar reservas por nome de prédio (locatário)
   */
  async buscarPorNomePredioLocatario(nomePredio: string, idLocatario: number): Promise<Reserva[]> {
    if (!nomePredio) {
      throw new Error('Nome do prédio inválido');
    }

    if (!idLocatario) {
      throw new Error('ID do locatário inválido');
    }

    return await reservaRepository.buscarPorNomePredioLocatario(nomePredio, idLocatario);
  }

  /**
   * 5. Buscar reservas por ID de sala (locatário)
   */
  async buscarPorSalaLocatario(idSala: number, idLocatario: number): Promise<Reserva[]> {
    if (!idSala) {
      throw new Error('ID da sala inválido');
    }

    if (!idLocatario) {
      throw new Error('ID do locatário inválido');
    }

    return await reservaRepository.buscarPorSalaLocatario(idSala, idLocatario);
  }

  /**
   * 6. Buscar reservas por nome de sala (locatário)
   */
  async buscarPorNomeSalaLocatario(nomeSala: string, idLocatario: number): Promise<Reserva[]> {
    if (!nomeSala) {
      throw new Error('Nome da sala inválido');
    }

    if (!idLocatario) {
      throw new Error('ID do locatário inválido');
    }

    return await reservaRepository.buscarPorNomeSalaLocatario(nomeSala, idLocatario);
  }

  /**
   * 7. Listar todas as reservas do locatário
   */
  async listarTodasLocatario(idLocatario: number): Promise<Reserva[]> {
    if (!idLocatario) {
      throw new Error('ID do locatário inválido');
    }

    return await reservaRepository.buscarPorLocatario(idLocatario);
  }

  /**
   * 8. Listar reservas por status (locatário)
   */
  async listarPorStatusLocatario(idLocatario: number, status: StatusReserva): Promise<Reserva[]> {
    if (!idLocatario) {
      throw new Error('ID do locatário inválido');
    }

    this.validarStatus(status);
    return await reservaRepository.buscarPorLocatarioEStatus(idLocatario, status);
  }

  /**
   * 9. Listar reservas ordenadas por data (locatário)
   */
  async listarOrdenadoPorDataLocatario(idLocatario: number, ordem: string): Promise<Reserva[]> {
    if (!idLocatario) {
      throw new Error('ID do locatário inválido');
    }

    if (!ordem || !['asc', 'desc'].includes(ordem)) {
      throw new Error('Ordem inválida. Use "asc" ou "desc"');
    }

    return await reservaRepository.buscarOrdenadoPorDataLocatario(idLocatario, ordem);
  }

  /**
   * 10. Listar reservas ordenadas por valor total (locatário)
   */
  async listarOrdenadoPorValorLocatario(idLocatario: number): Promise<Reserva[]> {
    if (!idLocatario) {
      throw new Error('ID do locatário inválido');
    }

    return await reservaRepository.buscarOrdenadoPorValorLocatario(idLocatario);
  }

  /**
   * 11. Cancelar reserva por locatário
   */
  async cancelarPorLocatario(dto: CancelarReservaDto): Promise<Reserva> {
    if (!dto.idReserva) {
      throw new Error('ID da reserva inválido');
    }

    if (!dto.idLocatario) {
      throw new Error('ID do locatário inválido');
    }

    const reserva = await reservaRepository.buscarPorId(dto.idReserva);

    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }

    if (reserva.locatario.id !== dto.idLocatario) {
      throw new Error('Você não tem permissão para cancelar esta reserva');
    }

    if (reserva.status === StatusReserva.CANCELADA) {
      throw new Error('Reserva já está cancelada');
    }

    if (reserva.status === StatusReserva.RECUSADA) {
      throw new Error('Reserva já foi recusada');
    }

    return await reservaRepository.atualizar(reserva.id, {
      status: StatusReserva.CANCELADA,
    });
  }

  async buscarHorarios(idSala: number): Promise<{
    salaId: number;
    nomeSala: string;
    precoHora: number;
    diasDisponiveis: Array<{
      data: string;
      diaSemana: string;
      horarios: Array<{
        horario: string;
        disponivel: boolean;
        status: string;
        preco: number;
      }>;
    }>;
  }> {
    if (!idSala) {
      throw new Error('ID da sala inválido');
    }

    // Buscar informações da sala
    const salaInfo = await reservaRepository.buscarInfoSala(idSala);

    if (!salaInfo) {
      throw new Error('Sala não encontrada');
    }

    // Definir período: hoje + 30 dias
    const dataInicio = new Date();
    dataInicio.setHours(0, 0, 0, 0);

    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + 30);
    dataFim.setHours(23, 59, 59, 999);

    // Buscar todas as reservas do período
    const reservas = await reservaRepository.buscarReservasPorSalaPeriodo(
      idSala,
      dataInicio,
      dataFim
    );

    // Criar mapa de reservas por data
    const reservasPorData = new Map<string, Reserva[]>();
    reservas.forEach(reserva => {
      const dataStr = reserva.dataReserva.toISOString().split('T')[0];
      if (!reservasPorData.has(dataStr)) {
        reservasPorData.set(dataStr, []);
      }
      reservasPorData.get(dataStr)!.push(reserva);
    });

    // Gerar estrutura de 30 dias
    const diasDisponiveis: Array<{
      data: string;
      diaSemana: string;
      horarios: Array<{
        horario: string;
        disponivel: boolean;
        status: string;
        preco: number;
      }>;
    }> = [];

    const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

    for (let i = 0; i < 30; i++) {
      const data = new Date(dataInicio);
      data.setDate(data.getDate() + i);
      const dataStr = data.toISOString().split('T')[0];
      const diaSemanaIdx = data.getDay();
      const diaSemana = diasSemana[diaSemanaIdx];

      // Gerar horários de 7h às 19h
      const horarios: Array<{
        horario: string;
        disponivel: boolean;
        status: string;
        preco: number;
      }> = [];

      for (let hora = 7; hora < 19; hora++) {
        const horarioInicio = `${hora.toString().padStart(2, '0')}:00:00`;

        // Verificar se há reserva neste horário
        const reservasData = reservasPorData.get(dataStr) || [];
        const ocupado = reservasData.some(reserva => {
          return reserva.horarioInicio === horarioInicio;
        });

        horarios.push({
          horario: horarioInicio.substring(0, 5),
          disponivel: !ocupado,
          status: ocupado ? 'ocupado' : 'disponivel',
          preco: Number(salaInfo.sala_precoHora)
        });
      }

      diasDisponiveis.push({
        data: dataStr,
        diaSemana,
        horarios
      });
    }

    return {
      salaId: idSala,
      nomeSala: salaInfo.sala_nome,
      precoHora: Number(salaInfo.sala_precoHora),
      diasDisponiveis
    };
  }

  // ==================== MÉTODOS DO LOCADOR ====================

  /**
   * 12. Aceitar reserva
   */
  async aceitar(dto: AceitarReservaDto): Promise<Reserva> {
    if (!dto.idReserva) {
      throw new Error('ID da reserva inválido');
    }

    if (!dto.idLocador) {
      throw new Error('ID do locador inválido');
    }

    const reserva = await reservaRepository.buscarPorId(dto.idReserva);

    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }

    const pertenceAoLocador = await reservaRepository.verificarProprietarioSala(
      reserva.sala.id,
      dto.idLocador
    );

    if (!pertenceAoLocador) {
      throw new Error('Você não tem permissão para aceitar esta reserva');
    }

    if (reserva.status !== StatusReserva.PENDENTE) {
      throw new Error('Apenas reservas pendentes podem ser aceitas');
    }

    const prazoLimite = new Date(reserva.createdAt);
    prazoLimite.setHours(prazoLimite.getHours() + 72);

    if (new Date() > prazoLimite) {
      await reservaRepository.atualizar(reserva.id, {
        status: StatusReserva.CANCELADA,
      });
      throw new Error('Prazo de 72 horas expirado. Reserva cancelada automaticamente');
    }

    return await reservaRepository.atualizar(reserva.id, {
      status: StatusReserva.ACEITA,
    });
  }

  /**
   * 13. Recusar reserva
   */
  async recusar(dto: RecusarReservaDto): Promise<Reserva> {
    if (!dto.idReserva) {
      throw new Error('ID da reserva inválido');
    }

    if (!dto.idLocador) {
      throw new Error('ID do locador inválido');
    }

    const reserva = await reservaRepository.buscarPorId(dto.idReserva);

    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }

    const pertenceAoLocador = await reservaRepository.verificarProprietarioSala(
      reserva.sala.id,
      dto.idLocador
    );

    if (!pertenceAoLocador) {
      throw new Error('Você não tem permissão para recusar esta reserva');
    }

    if (reserva.status !== StatusReserva.PENDENTE) {
      throw new Error('Apenas reservas pendentes podem ser recusadas');
    }

    return await reservaRepository.atualizar(reserva.id, {
      status: StatusReserva.RECUSADA,
    });
  }

  /**
   * 14. Buscar reservas por ID de prédio (locador)
   */
  async buscarPorPredioLocador(idPredio: number, idLocador: number): Promise<Reserva[]> {
    if (!idPredio) {
      throw new Error('ID do prédio inválido');
    }

    if (!idLocador) {
      throw new Error('ID do locador inválido');
    }

    return await reservaRepository.buscarPorPredioLocador(idPredio, idLocador);
  }

  /**
   * 15. Buscar reservas por nome de prédio (locador)
   */
  async buscarPorNomePredioLocador(nomePredio: string, idLocador: number): Promise<Reserva[]> {
    if (!nomePredio) {
      throw new Error('Nome do prédio inválido');
    }

    if (!idLocador) {
      throw new Error('ID do locador inválido');
    }

    return await reservaRepository.buscarPorNomePredioLocador(nomePredio, idLocador);
  }

  /**
   * 16. Buscar reservas por ID de sala (locador)
   */
  async buscarPorSalaLocador(idSala: number, idLocador: number): Promise<Reserva[]> {
    if (!idSala) {
      throw new Error('ID da sala inválido');
    }

    if (!idLocador) {
      throw new Error('ID do locador inválido');
    }

    const pertenceAoLocador = await reservaRepository.verificarProprietarioSala(idSala, idLocador);

    if (!pertenceAoLocador) {
      throw new Error('Você não tem permissão para visualizar reservas desta sala');
    }

    return await reservaRepository.buscarPorSalaLocador(idSala, idLocador);
  }

  /**
   * 17. Buscar reservas por nome de sala (locador)
   */
  async buscarPorNomeSalaLocador(nomeSala: string, idLocador: number): Promise<Reserva[]> {
    if (!nomeSala) {
      throw new Error('Nome da sala inválido');
    }

    if (!idLocador) {
      throw new Error('ID do locador inválido');
    }

    return await reservaRepository.buscarPorNomeSalaLocador(nomeSala, idLocador);
  }

  /**
   * 18. Listar todas as reservas do locador
   */
  async listarTodasLocador(idLocador: number): Promise<Reserva[]> {
    if (!idLocador) {
      throw new Error('ID do locador inválido');
    }

    return await reservaRepository.buscarTodasLocador(idLocador);
  }

  /**
   * 19. Listar reservas por status (locador)
   */
  async listarPorStatusLocador(idLocador: number, status: StatusReserva): Promise<Reserva[]> {
    if (!idLocador) {
      throw new Error('ID do locador inválido');
    }

    this.validarStatus(status);
    return await reservaRepository.buscarPorLocadorEStatus(idLocador, status);
  }

  /**
   * 20. Listar reservas ordenadas por data (locador)
   */
  async listarOrdenadoPorDataLocador(idLocador: number, ordem: string): Promise<Reserva[]> {
    if (!idLocador) {
      throw new Error('ID do locador inválido');
    }

    if (!ordem || !['asc', 'desc'].includes(ordem)) {
      throw new Error('Ordem inválida. Use "asc" ou "desc"');
    }

    return await reservaRepository.buscarOrdenadoPorDataLocador(idLocador, ordem);
  }

  /**
   * 21. Listar reservas ordenadas por valor total (locador)
   */
  async listarOrdenadoPorValorLocador(idLocador: number): Promise<Reserva[]> {
    if (!idLocador) {
      throw new Error('ID do locador inválido');
    }

    return await reservaRepository.buscarOrdenadoPorValorLocador(idLocador);
  }

  // ==================== VALIDAÇÕES PRIVADAS ====================

  private validarCamposObrigatorios(dto: CriarReservaDto): void {
    if (!dto.salaId) {
      throw new Error('O ID da sala é obrigatório');
    }

    if (!dto.locatarioId) {
      throw new Error('O ID do locatário é obrigatório');
    }

    if (!dto.dataReservada) {
      throw new Error('A data da reserva é obrigatória');
    }

    if (!dto.horarioInicio) {
      throw new Error('O horário de início é obrigatório');
    }

    if (!dto.horarioFim) {
      throw new Error('O horário de fim é obrigatório');
    }

    if (dto.valorTotal === undefined || dto.valorTotal === null) {
      throw new Error('O valor total é obrigatório');
    }
  }

  private validarFormatoData(data: string): void {
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(data)) {
      throw new Error('A data deve estar no formato YYYY-MM-DD');
    }

    const dataObj = new Date(data);

    if (isNaN(dataObj.getTime())) {
      throw new Error('Data inválida');
    }
  }

  private validarFormatoHorario(horario: string): void {
    const regex = /^([0-1][0-9]|2[0-3]):00:00$/;

    if (!regex.test(horario)) {
      throw new Error('O horário deve estar no formato HH:00:00 (hora cheia)');
    }
  }

  private validarValorTotal(valor: number): void {
    if (typeof valor !== 'number') {
      throw new Error('O valor total deve ser um número');
    }

    if (valor < 0) {
      throw new Error('O valor total deve ser maior ou igual a zero');
    }
  }

  private validarStatus(status: StatusReserva): void {
    const statusValidos = Object.values(StatusReserva);

    if (!statusValidos.includes(status)) {
      throw new Error(`Status inválido. Use: ${statusValidos.join(', ')}`);
    }
  }

  private validarPrazoMinimo(dataReservada: string, horarioInicio: string): void {
    const dataHoraReserva = new Date(`${dataReservada}T${horarioInicio}`);
    const agora = new Date();
    const diferencaHoras = (dataHoraReserva.getTime() - agora.getTime()) / (1000 * 60 * 60);

    if (diferencaHoras < 12) {
      throw new Error('A reserva deve ser feita com no mínimo 12 horas de antecedência');
    }
  }

  private validarPrazoMaximo(dataReservada: string): void {
    const dataReserva = new Date(dataReservada);
    const agora = new Date();
    agora.setHours(0, 0, 0, 0);

    const diferencaDias = Math.ceil(
      (dataReserva.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diferencaDias > 60) {
      throw new Error('Não é possível reservar com mais de 60 dias de antecedência');
    }

    if (diferencaDias < 0) {
      throw new Error('Não é possível reservar datas passadas');
    }
  }
}

export default new ReservaService();