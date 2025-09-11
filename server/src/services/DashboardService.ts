import { ReservaRepository } from '../repository/ReservaRepository';
import { SalaRepository } from '../repository/SalaRepository';
import { PredioRepository } from '../repository/PredioRepository';
import { StatusReserva } from '../entity/Reserva';

export interface DashboardProprietarioDto {
  totalPredios: number;
  totalSalas: number;
  reservasPendentes: number;
  totalReservas: number;
  receitaConfirmada: number;
  reservasDoMes: number;
}

export interface DashboardLocatarioDto {
  totalReservas: number;
  reservasPendentes: number;
  reservasConfirmadas: number;
  reservasCanceladas: number;
  proximasReservas: any[];
}

export class DashboardService {
  async getDashboardProprietario(proprietarioId: number): Promise<DashboardProprietarioDto> {
    // Total de prédios
    const totalPredios = await PredioRepository.count({
      where: { proprietario: { id: proprietarioId }, ativo: true }
    });

    // Total de salas
    const totalSalas = await SalaRepository.count({
      where: { proprietario: { id: proprietarioId }, ativo: true }
    });

    // Reservas pendentes
    const reservasPendentes = await ReservaRepository.createQueryBuilder('reserva')
      .leftJoin('reserva.sala', 'sala')
      .where('sala.proprietario.id = :proprietarioId', { proprietarioId })
      .andWhere('reserva.status = :status', { status: StatusReserva.PENDENTE })
      .getCount();

    // Total de reservas
    const totalReservas = await ReservaRepository.createQueryBuilder('reserva')
      .leftJoin('reserva.sala', 'sala')
      .where('sala.proprietario.id = :proprietarioId', { proprietarioId })
      .getCount();

    // Receita confirmada
    const receitaResult = await ReservaRepository.createQueryBuilder('reserva')
      .leftJoin('reserva.sala', 'sala')
      .select('SUM(reserva.valorTotal)', 'total')
      .where('sala.proprietario.id = :proprietarioId', { proprietarioId })
      .andWhere('reserva.status = :status', { status: StatusReserva.CONFIRMADO })
      .getRawOne();

    const receitaConfirmada = parseFloat(receitaResult?.total || '0');

    // Reservas do mês atual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const fimMes = new Date();
    fimMes.setMonth(fimMes.getMonth() + 1, 0);
    fimMes.setHours(23, 59, 59, 999);

    const reservasDoMes = await ReservaRepository.createQueryBuilder('reserva')
      .leftJoin('reserva.sala', 'sala')
      .where('sala.proprietario.id = :proprietarioId', { proprietarioId })
      .andWhere('reserva.dataReserva >= :inicioMes', { inicioMes })
      .andWhere('reserva.dataReserva <= :fimMes', { fimMes })
      .getCount();

    return {
      totalPredios,
      totalSalas,
      reservasPendentes,
      totalReservas,
      receitaConfirmada,
      reservasDoMes
    };
  }

  async getDashboardLocatario(locatarioId: number): Promise<DashboardLocatarioDto> {
    // Total de reservas
    const totalReservas = await ReservaRepository.count({
      where: { locatario: { id: locatarioId } }
    });

    // Reservas por status
    const reservasPendentes = await ReservaRepository.count({
      where: { locatario: { id: locatarioId }, status: StatusReserva.PENDENTE }
    });

    const reservasConfirmadas = await ReservaRepository.count({
      where: { locatario: { id: locatarioId }, status: StatusReserva.CONFIRMADO }
    });

    const reservasCanceladas = await ReservaRepository.count({
      where: { locatario: { id: locatarioId }, status: StatusReserva.CANCELADO }
    });

    // Próximas reservas (confirmadas e futuras)
    const hoje = new Date();
    const proximasReservas = await ReservaRepository.find({
      where: {
        locatario: { id: locatarioId },
        status: StatusReserva.CONFIRMADO,
      },
      relations: ['sala', 'sala.predio'],
      order: { dataReserva: 'ASC', horaInicio: 'ASC' },
      take: 5
    });

    const proximasReservasFormatadas = proximasReservas
      .filter(reserva => new Date(reserva.dataReserva) >= hoje)
      .map(reserva => ({
        id: reserva.id,
        sala: reserva.sala?.nomeSala,
        predio: reserva.sala?.predio?.nomePredio,
        data: reserva.dataReserva,
        horaInicio: reserva.horaInicio,
        horaFim: reserva.horaFim,
        valor: reserva.valorTotal
      }));

    return {
      totalReservas,
      reservasPendentes,
      reservasConfirmadas,
      reservasCanceladas,
      proximasReservas: proximasReservasFormatadas
    };
  }
}