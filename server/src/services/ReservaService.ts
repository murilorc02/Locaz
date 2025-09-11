
import { ReservaRepository } from '../repository/ReservaRepository';
import { SalaRepository } from '../repository/SalaRepository';
import { CreateReservaDto, UpdateReservaDto, ReservaResponseDto } from '../dto/ReservaDto';
import { Reserva, StatusReserva } from '../entity/Reserva';

export class ReservaService {
  async create(createReservaDto: CreateReservaDto): Promise<ReservaResponseDto> {
    const sala = await SalaRepository.findOne({ where: { id: createReservaDto.salaId } });
    if (!sala) {
      throw new Error('Sala não encontrada');
    }

    // Validar se a sala está disponível no horário solicitado
    const conflito = await this.verificarConflito(
      createReservaDto.salaId,
      createReservaDto.dataReserva,
      createReservaDto.horaInicio,
      createReservaDto.horaFim
    );

    if (conflito) {
      throw new Error('Horário não disponível para esta sala');
    }

    const reserva = ReservaRepository.create({
      clienteNome: createReservaDto.clienteNome,
      clienteEmail: createReservaDto.clienteEmail,
      dataReserva: createReservaDto.dataReserva,
      horaInicio: createReservaDto.horaInicio,
      horaFim: createReservaDto.horaFim,
      valorTotal: createReservaDto.valorTotal,
      observacoes: createReservaDto.observacoes,
      status: StatusReserva.PENDENTE,
      sala: sala
    });

    const savedReserva = await ReservaRepository.save(reserva);
    return this.toResponseDto(savedReserva);
  }

  async findAll(): Promise<ReservaResponseDto[]> {
    const reservas = await ReservaRepository.find({
      relations: ['sala'],
      order: { dataReserva: 'ASC', horaInicio: 'ASC' }
    });
    return reservas.map(reserva => this.toResponseDto(reserva));
  }

  async findOne(id: number): Promise<ReservaResponseDto> {
    const reserva = await ReservaRepository.findOne({
      where: { id },
      relations: ['sala']
    });
    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }
    return this.toResponseDto(reserva);
  }

  async update(id: number, updateReservaDto: UpdateReservaDto): Promise<ReservaResponseDto> {
    const reserva = await ReservaRepository.findOne({
      where: { id },
      relations: ['sala']
    });
    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }

    // Se está alterando sala, horário ou data, verificar conflitos
    if (updateReservaDto.salaId || updateReservaDto.dataReserva ||
      updateReservaDto.horaInicio || updateReservaDto.horaFim) {

      const salaIdParaVerificar = updateReservaDto.salaId || reserva.sala?.id;
      const dataParaVerificar = updateReservaDto.dataReserva || reserva.dataReserva;
      const horaInicioParaVerificar = updateReservaDto.horaInicio || reserva.horaInicio;
      const horaFimParaVerificar = updateReservaDto.horaFim || reserva.horaFim;

      // Só verificar se temos dados válidos
      if (salaIdParaVerificar && dataParaVerificar && horaInicioParaVerificar && horaFimParaVerificar) {
        const conflito = await this.verificarConflito(
          salaIdParaVerificar,
          dataParaVerificar,
          horaInicioParaVerificar,
          horaFimParaVerificar,
          id
        );

        if (conflito) {
          throw new Error('Horário não disponível para esta sala');
        }
      }
    }

    // Atualizar campos
    if (updateReservaDto.clienteNome !== undefined) reserva.clienteNome = updateReservaDto.clienteNome;
    if (updateReservaDto.clienteEmail !== undefined) reserva.clienteEmail = updateReservaDto.clienteEmail;
    if (updateReservaDto.dataReserva !== undefined) reserva.dataReserva = updateReservaDto.dataReserva;
    if (updateReservaDto.horaInicio !== undefined) reserva.horaInicio = updateReservaDto.horaInicio;
    if (updateReservaDto.horaFim !== undefined) reserva.horaFim = updateReservaDto.horaFim;
    if (updateReservaDto.valorTotal !== undefined) reserva.valorTotal = updateReservaDto.valorTotal;
    if (updateReservaDto.status !== undefined) reserva.status = updateReservaDto.status;
    if (updateReservaDto.observacoes !== undefined) reserva.observacoes = updateReservaDto.observacoes;

    if (updateReservaDto.salaId) {
      const sala = await SalaRepository.findOne({ where: { id: updateReservaDto.salaId } });
      if (sala) reserva.sala = sala;
    }

    const updatedReserva = await ReservaRepository.save(reserva);
    return this.toResponseDto(updatedReserva);
  }

  async remove(id: number): Promise<void> {
    const reserva = await ReservaRepository.findOne({ where: { id } });
    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }
    await ReservaRepository.remove(reserva);
  }

  async findByStatus(status: StatusReserva): Promise<ReservaResponseDto[]> {
    const reservas = await ReservaRepository.find({
      where: { status },
      relations: ['sala'],
      order: { dataReserva: 'ASC', horaInicio: 'ASC' }
    });
    return reservas.map(reserva => this.toResponseDto(reserva));
  }

  async confirmarReserva(id: number): Promise<ReservaResponseDto> {
    return this.update(id, { status: StatusReserva.CONFIRMADO });
  }

  async cancelarReserva(id: number): Promise<ReservaResponseDto> {
    return this.update(id, { status: StatusReserva.CANCELADO });
  }

  private async verificarConflito(
    salaId: number,
    dataReserva: Date,
    horaInicio: string,
    horaFim: string,
    excluirReservaId?: number
  ): Promise<boolean> {
    try {
      // Fix for the 'toString' error - better type handling
      let dataFormatada: string;
      
      if (dataReserva instanceof Date) {
        dataFormatada = dataReserva.toISOString().split('T')[0];
      } else if (typeof dataReserva === 'string') {
        dataFormatada = dataReserva;
      } else {
        // Handle other possible types more safely
        dataFormatada = new Date(dataReserva).toISOString().split('T')[0];
      }

      const query = ReservaRepository.createQueryBuilder('reserva')
        .where('reserva.salaId = :salaId', { salaId })
        .andWhere('DATE(reserva.dataReserva) = DATE(:dataReserva)', { dataReserva: dataFormatada })
        .andWhere('reserva.status != :statusCancelado', { statusCancelado: StatusReserva.CANCELADO })
        .andWhere(
          '(reserva.horaInicio < :horaFim AND reserva.horaFim > :horaInicio)',
          { horaInicio, horaFim }
        );

      if (excluirReservaId) {
        query.andWhere('reserva.id != :excluirReservaId', { excluirReservaId });
      }

      const conflito = await query.getOne();
      return !!conflito;
    } catch (error) {
      console.error('Erro ao verificar conflito:', error);
      return false; // Em caso de erro, permitir a operação
    }
  }

  private toResponseDto(reserva: Reserva): ReservaResponseDto {
    return {
      id: reserva.id,
      clienteNome: reserva.clienteNome,
      clienteEmail: reserva.clienteEmail,
      dataReserva: reserva.dataReserva,
      horaInicio: reserva.horaInicio,
      horaFim: reserva.horaFim,
      valorTotal: reserva.valorTotal,
      status: reserva.status,
      observacoes: reserva.observacoes,
      createdAt: reserva.createdAt,
      updatedAt: reserva.updatedAt,
      sala: {
        id: reserva.sala?.id || 0,
        nome: reserva.sala?.nomeSala || ''  
      },
      locatario: reserva.locatario ? {
        id: reserva.locatario.id,
        nome: reserva.locatario.nome,
        email: reserva.locatario.email
      } : undefined
    };
  }
}