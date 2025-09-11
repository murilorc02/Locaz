import { AppDataSource } from '../data-source';
import { Reserva, StatusReserva } from '../entity/Reserva';

export const ReservaRepository = AppDataSource.getRepository(Reserva).extend({
  findByStatus(status: StatusReserva) {
    return this.find({
      where: { status },
      relations: ['sala'],
      order: { dataReserva: 'ASC', horaInicio: 'ASC' }
    });
  },

  findBySalaId(salaId: number) {
    return this.find({
      where: { sala: { id: salaId } },
      relations: ['sala'],
      order: { dataReserva: 'ASC', horaInicio: 'ASC' }
    });
  },

  findByDateRange(dataInicio: Date, dataFim: Date) {
    return this.createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .where('reserva.dataReserva >= :dataInicio', { dataInicio })
      .andWhere('reserva.dataReserva <= :dataFim', { dataFim })
      .orderBy('reserva.dataReserva', 'ASC')
      .addOrderBy('reserva.horaInicio', 'ASC')
      .getMany();
  }
});