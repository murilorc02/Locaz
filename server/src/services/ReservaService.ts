import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Reserva, StatusReserva } from '../entity/Reserva';
import { Usuario } from '../entity/Usuario';
import { Sala } from '../entity/Sala';

export class ReservaService {
  private reservaRepository: Repository<Reserva>;
  private usuarioRepository: Repository<Usuario>;
  private salaRepository: Repository<Sala>;

  constructor() {
    this.reservaRepository = AppDataSource.getRepository(Reserva);
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
    this.salaRepository = AppDataSource.getRepository(Sala);
  }

  async criarReserva(dadosReserva: {
    dataReserva: Date;
    horarioInicio: string;
    horarioFim: string;
    observacoes?: string;
    locatarioId: number;
    salaId: string;
  }): Promise<Reserva> {
    const locatario = await this.usuarioRepository.findOne({
      where: { id: dadosReserva.locatarioId }
    });

    if (!locatario) {
      throw new Error('Usuário não encontrado');
    }

    const sala = await this.salaRepository.findOne({
      where: { id: dadosReserva.salaId }
    });

    if (!sala) {
      throw new Error('Sala não encontrada');
    }

    // Verificar disponibilidade da sala
    const conflito = await this.verificarConflito(
      dadosReserva.salaId,
      dadosReserva.dataReserva,
      dadosReserva.horarioInicio,
      dadosReserva.horarioFim
    );

    if (conflito) {
      throw new Error('Horário não disponível para esta sala');
    }

    // Calcular valor total
    const valorTotal = await this.calcularValorTotal(
      sala,
      dadosReserva.horarioInicio,
      dadosReserva.horarioFim
    );

    const reserva = this.reservaRepository.create({
      ...dadosReserva,
      locatario,
      sala,
      valorTotal,
      status: StatusReserva.PENDENTE
    });

    return await this.reservaRepository.save(reserva);
  }

  async buscarPorId(id: string): Promise<Reserva | null> {
    return await this.reservaRepository.findOne({
      where: { id },
      relations: ['locatario', 'sala', 'sala.predio']
    });
  }

  async buscarPorUsuario(usuarioId: number): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      where: { locatario: { id: usuarioId } },
      relations: ['sala', 'sala.predio']
    });
  }

  async atualizarStatus(id: string, status: StatusReserva): Promise<Reserva | null> {
    await this.reservaRepository.update(id, { status });
    return await this.buscarPorId(id);
  }

  async cancelarReserva(id: string): Promise<void> {
    const reserva = await this.buscarPorId(id);
    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }

    if (reserva.status === StatusReserva.CANCELADA) {
      throw new Error('Reserva já foi cancelada');
    }

    await this.atualizarStatus(id, StatusReserva.CANCELADA);
  }

  private async verificarConflito(
    salaId: string,
    data: Date,
    horarioInicio: string,
    horarioFim: string
  ): Promise<boolean> {
    const conflitos = await this.reservaRepository.createQueryBuilder('reserva')
      .where('reserva.salaId = :salaId', { salaId })
      .andWhere('reserva.dataReserva = :data', { data })
      .andWhere('reserva.status IN (:...status)', { 
        status: [StatusReserva.CONFIRMADA, StatusReserva.PENDENTE] 
      })
      .andWhere(`
        (reserva.horarioInicio < :horarioFim AND reserva.horarioFim > :horarioInicio)
      `, { horarioInicio, horarioFim })
      .getCount();

    return conflitos > 0;
  }

  private async calcularValorTotal(
    sala: Sala,
    horarioInicio: string,
    horarioFim: string
  ): Promise<number> {
    if (sala.reservaGratuita) {
      return 0;
    }

    const [horaInicio, minutoInicio] = horarioInicio.split(':').map(Number);
    const [horaFim, minutoFim] = horarioFim.split(':').map(Number);

    const inicioEmMinutos = horaInicio * 60 + minutoInicio;
    const fimEmMinutos = horaFim * 60 + minutoFim;
    const duracaoEmHoras = (fimEmMinutos - inicioEmMinutos) / 60;

    return Number(sala.precoHora) * duracaoEmHoras;
  }
}