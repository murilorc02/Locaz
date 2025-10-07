import reservaRepository from '../repository/ReservaRepository';
import { Reserva, StatusReserva } from '../entity/Reserva';
import {
  CriarReservaDto,
  AceitarReservaDto,
  RecusarReservaDto,
  CancelarReservaDto,
} from '../dto/ReservaDto';

class ReservaService {
  // ==================== CRUD BÁSICO (5 métodos) ====================

  /**
   * 1. Criar nova reserva
   */
  async criar(dto: CriarReservaDto): Promise<Reserva> {
    // Validações
    this.validarCamposObrigatorios(dto);
    this.validarFormatoData(dto.dataReservada);
    this.validarFormatoHorario(dto.horarioInicio);
    this.validarFormatoHorario(dto.horarioFim);
    this.validarValorTotal(dto.valorTotal);
    this.validarPrazoMinimo(dto.dataReservada, dto.horarioInicio);
    this.validarPrazoMaximo(dto.dataReservada);

    // Verificar disponibilidade
    const disponivel = await reservaRepository.verificarDisponibilidade(
      dto.salaId,
      new Date(dto.dataReservada),
      dto.horarioInicio,
      dto.horarioFim,
    );

    if (!disponivel) {
      throw new Error('Horário já está reservado');
    }

    // Criar a reserva
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
   * 2. Listar todas as reservas
   */
  async listarTodas(): Promise<Reserva[]> {
    return await reservaRepository.buscarTodos();
  }

  /**
   * 3. Buscar reserva por ID
   */
  async buscarPorId(id: string): Promise<Reserva> {
    if (!id) {
      throw new Error('ID inválido');
    }

    const reserva = await reservaRepository.buscarPorId(id);
    
    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }

    return reserva;
  }

  /**
   * 5. Deletar reserva
   */
  async deletar(id: string, locatarioId: number): Promise<void> {
    const reserva = await this.buscarPorId(id);

    // Verificar permissão
    if (reserva.locatario.id !== locatarioId) {
      throw new Error('Você não tem permissão para deletar esta reserva');
    }

    // Não pode deletar reserva aceita
    if (reserva.status === StatusReserva.ACEITA) {
      throw new Error('Não é possível deletar uma reserva aceita. Cancele-a primeiro.');
    }

    await reservaRepository.deletar(id);
  }

  // ==================== AÇÕES DO LOCADOR (2 métodos) ====================

  /**
   * 6. Aceitar reserva
   */
  async aceitar(dto: AceitarReservaDto): Promise<Reserva> {
    if (!dto.idReserva) {
      throw new Error('ID da reserva inválido');
    }

    const reserva = await this.buscarPorId(dto.idReserva);

    // Só pode aceitar reservas pendentes
    if (reserva.status !== StatusReserva.PENDENTE) {
      throw new Error('Apenas reservas pendentes podem ser aceitas');
    }

    // Verificar prazo de 72 horas
    const prazoLimite = new Date(reserva.createdAt);
    prazoLimite.setHours(prazoLimite.getHours() + 72);

    if (new Date() > prazoLimite) {
      await reservaRepository.atualizar(reserva.id, {
        status: StatusReserva.CANCELADA,
      });
      throw new Error('Prazo de 72 horas expirado. Reserva cancelada automaticamente');
    }

    // TODO: Verificar se idLocador é o proprietário da sala
    // const sala = await salaRepository.buscarPorId(reserva.sala.id);
    // if (sala.proprietarioId !== dto.idLocador) {
    //   throw new Error('Você não tem permissão para aceitar esta reserva');
    // }

    return await reservaRepository.atualizar(reserva.id, {
      status: StatusReserva.ACEITA,
    });
  }

  /**
   * 7. Recusar reserva
   */
  async recusar(dto: RecusarReservaDto): Promise<Reserva> {
    if (!dto.idReserva) {
      throw new Error('ID da reserva inválido');
    }

    const reserva = await this.buscarPorId(dto.idReserva);

    // Só pode recusar reservas pendentes
    if (reserva.status !== StatusReserva.PENDENTE) {
      throw new Error('Apenas reservas pendentes podem ser recusadas');
    }

    // TODO: Verificar se idLocador é o proprietário da sala
    // const sala = await salaRepository.buscarPorId(reserva.sala.id);
    // if (sala.proprietarioId !== dto.idLocador) {
    //   throw new Error('Você não tem permissão para recusar esta reserva');
    // }

    return await reservaRepository.atualizar(reserva.id, {
      status: StatusReserva.RECUSADA,
    });
  }

  // ==================== AÇÕES DO LOCATÁRIO (5 métodos) ====================

  /**
   * 8. Cancelar reserva por locatário
   */
  async cancelarPorLocatario(dto: CancelarReservaDto): Promise<Reserva> {
    if (!dto.idReserva) {
      throw new Error('ID da reserva inválido');
    }

    const reserva = await this.buscarPorId(dto.idReserva);

    // Verificar permissão
    if (reserva.locatario.id !== Number(dto.idLocatario)) {
      throw new Error('Você não tem permissão para cancelar esta reserva');
    }

    // Verificar se já está cancelada
    if (reserva.status === StatusReserva.CANCELADA) {
      throw new Error('Reserva já está cancelada');
    }

    // Verificar se já foi recusada
    if (reserva.status === StatusReserva.RECUSADA) {
      throw new Error('Reserva já foi recusada');
    }

    return await reservaRepository.atualizar(reserva.id, {
      status: StatusReserva.CANCELADA,
    });
  }

  /**
   * 9. Listar reservas por locatário
   */
  async listarPorLocatario(locatarioId: string): Promise<Reserva[]> {
    if (!locatarioId) {
      throw new Error('ID do locatário inválido');
    }

    return await reservaRepository.buscarPorLocatario(locatarioId);
  }

  /**
   * 10. Listar reservas futuras do locatário
   */
  async listarReservasFuturas(locatarioId: string): Promise<Reserva[]> {
    if (!locatarioId) {
      throw new Error('ID do locatário inválido');
    }

    return await reservaRepository.buscarReservasFuturas(locatarioId);
  }

  /**
   * 11. Listar histórico de reservas do locatário
   */
  async listarHistorico(locatarioId: string): Promise<Reserva[]> {
    if (!locatarioId) {
      throw new Error('ID do locatário inválido');
    }

    return await reservaRepository.buscarHistorico(locatarioId);
  }

  /**
   * 12. Listar reservas do locatário por status
   */
  async listarPorLocatarioEStatus(
    locatarioId: string,
    status: StatusReserva,
  ): Promise<Reserva[]> {
    if (!locatarioId) {
      throw new Error('ID do locatário inválido');
    }

    this.validarStatus(status);

    return await reservaRepository.buscarPorLocatarioEStatus(locatarioId, status);
  }

  // ==================== CONSULTAS POR SALA (4 métodos) ====================

  /**
   * 13. Listar reservas pendentes por sala
   */
  async listarPendentesPorSala(salaId: string): Promise<Reserva[]> {
    if (!salaId) {
      throw new Error('ID da sala inválido');
    }

    return await reservaRepository.buscarPendentesPorSala(salaId);
  }

  /**
   * 14. Listar reservas por sala e status
   */
  async listarPorSalaEStatus(salaId: string, status: StatusReserva): Promise<Reserva[]> {
    if (!salaId) {
      throw new Error('ID da sala inválido');
    }

    this.validarStatus(status);

    return await reservaRepository.buscarPorSalaEStatus(salaId, status);
  }

  /**
   * 15. Listar reservas por sala e data
   */
  async listarPorSalaEData(salaId: string, data: string): Promise<Reserva[]> {
    if (!salaId) {
      throw new Error('ID da sala inválido');
    }

    this.validarFormatoData(data);

    return await reservaRepository.buscarPorSalaEData(salaId, new Date(data));
  }

  /**
   * 16. Listar reservas por sala e período
   */
  async listarPorSalaEPeriodo(
    salaId: string,
    dataInicio: string,
    dataFim: string,
  ): Promise<Reserva[]> {
    if (!salaId) {
      throw new Error('ID da sala inválido');
    }

    this.validarFormatoData(dataInicio);
    this.validarFormatoData(dataFim);

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (inicio > fim) {
      throw new Error('A data inicial deve ser anterior à data final');
    }

    return await reservaRepository.buscarPorSalaEPeriodo(salaId, inicio, fim);
  }

  // ==================== VERIFICAÇÕES (1 método) ====================

  /**
   * 17. Verificar disponibilidade de horário
   */
  async verificarDisponibilidade(
    salaId: string,
    data: string,
    horarioInicio: string,
    horarioFim: string,
  ): Promise<boolean> {
    if (!salaId) {
      throw new Error('ID da sala inválido');
    }

    this.validarFormatoData(data);
    this.validarFormatoHorario(horarioInicio);
    this.validarFormatoHorario(horarioFim);

    return await reservaRepository.verificarDisponibilidade(
      salaId,
      new Date(data),
      horarioInicio,
      horarioFim,
    );
  }

  // ==================== FILTROS GERAIS (1 método) ====================

  /**
   * 18. Listar reservas por status
   */
  async listarPorStatus(status: StatusReserva): Promise<Reserva[]> {
    this.validarStatus(status);

    return await reservaRepository.buscarPorStatus(status);
  }

  // ==================== JOB DE CANCELAMENTO (1 método) ====================

  /**
   * 19. Cancelar reservas expiradas
   * Este método deve ser executado por um cron job
   */
  async cancelarExpiradas(): Promise<void> {
    const reservasExpiradas = await reservaRepository.buscarPendentesExpiradas();

    let canceladas = 0;

    for (const reserva of reservasExpiradas) {
      try {
        await reservaRepository.atualizar(reserva.id, {
          status: StatusReserva.CANCELADA,
        });
        canceladas++;
      } catch (error) {
        console.error(`Erro ao cancelar reserva ${reserva.id}:`, error);
      }
    }

    console.log(`[RESERVA SERVICE] ${canceladas} de ${reservasExpiradas.length} reservas expiradas canceladas`);
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