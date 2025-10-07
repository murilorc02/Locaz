import { AppDataSource } from '../data-source';
import { Repository, Between, LessThan, In } from 'typeorm';
import { Reserva, StatusReserva } from '../entity/Reserva';

class ReservaRepository {
  private repository: Repository<Reserva>;

  constructor() {
    this.repository = AppDataSource.getRepository(Reserva);
  }

  async criar(reserva: Partial<Reserva>): Promise<Reserva> {
    const novaReserva = this.repository.create(reserva);
    return await this.repository.save(novaReserva);
  }

  async buscarPorId(id: string): Promise<Reserva | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async buscarTodos(): Promise<Reserva[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async atualizar(id: string, dados: Partial<Reserva>): Promise<Reserva> {
    await this.repository.update(id, dados);
    const reservaAtualizada = await this.buscarPorId(id);
    if (!reservaAtualizada) {
      throw new Error('Reserva não encontrada após atualização');
    }
    return reservaAtualizada;
  }

  async deletar(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async buscarPendentesExpiradas(): Promise<Reserva[]> {
    const setentaEDuasHorasAtras = new Date();
    setentaEDuasHorasAtras.setHours(setentaEDuasHorasAtras.getHours() - 72);

    return await this.repository.find({
      where: {
        status: StatusReserva.PENDENTE,
        createdAt: LessThan(setentaEDuasHorasAtras),
      },
    });
  }

  async buscarPorSalaEData(
    salaId: string,
    dataReserva: Date,
  ): Promise<Reserva[]> {
    return await this.repository.find({
      where: {
        sala: { id: salaId },
        dataReserva,
        status: In([StatusReserva.ACEITA, StatusReserva.PENDENTE]),
      },
      order: { horarioInicio: 'ASC' },
    });
  }

  async buscarPorSalaEPeriodo(
    salaId: string,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<Reserva[]> {
    return await this.repository.find({
      where: {
        sala: { id: salaId },
        dataReserva: Between(dataInicio, dataFim),
        status: In([StatusReserva.ACEITA, StatusReserva.PENDENTE]),
      },
      order: { dataReserva: 'ASC', horarioInicio: 'ASC' },
    });
  }

  async verificarDisponibilidade(
    salaId: string,
    dataReserva: Date,
    horarioInicio: string,
    horarioFim: string,
  ): Promise<boolean> {
    const reservaExistente = await this.repository.findOne({
      where: {
        sala: { id: salaId },
        dataReserva,
        horarioInicio,
        horarioFim,
        status: In([StatusReserva.ACEITA, StatusReserva.PENDENTE]),
      },
    });

    return !reservaExistente;
  }

  async buscarPorLocatario(locatarioId: string): Promise<Reserva[]> {
    return await this.repository.find({
      where: { locatario: { id: locatarioId } } as any,
      order: { dataReserva: 'DESC', horarioInicio: 'DESC' },
      relations: ['locatario', 'sala'],
    });
  }

  async buscarPorLocatarioEStatus(
    locatarioId: string,
    status: StatusReserva,
  ): Promise<Reserva[]> {
    return await this.repository.find({
      where: { 
        locatario: { id: locatarioId } as any, 
        status 
      } as any,
      order: { dataReserva: 'DESC', horarioInicio: 'DESC' },
      relations: ['locatario', 'sala'],
    });
  }

  async buscarPendentesPorSala(salaId: string): Promise<Reserva[]> {
    return await this.repository.find({
      where: {
        sala: { id: salaId },
        status: StatusReserva.PENDENTE,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async buscarPorSalaEStatus(
    salaId: string,
    status: StatusReserva,
  ): Promise<Reserva[]> {
    return await this.repository.find({
      where: {
        sala: { id: salaId },
        status,
      },
      order: { dataReserva: 'DESC', horarioInicio: 'DESC' },
    });
  }

  async buscarPorStatus(status: StatusReserva): Promise<Reserva[]> {
    return await this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async buscarReservasFuturas(locatarioId: string): Promise<Reserva[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoin('reserva.locatario', 'locatario')
      .where('locatario.id = :locatarioId', { locatarioId })
      .andWhere('reserva.dataReserva >= :hoje', { hoje })
      .andWhere('reserva.status = :status', { status: StatusReserva.ACEITA })
      .orderBy('reserva.dataReserva', 'ASC')
      .addOrderBy('reserva.horarioInicio', 'ASC')
      .getMany();
  }

  async buscarHistorico(locatarioId: string): Promise<Reserva[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoin('reserva.locatario', 'locatario')
      .where('locatario.id = :locatarioId', { locatarioId })
      .andWhere('reserva.dataReserva < :hoje', { hoje })
      .orderBy('reserva.dataReserva', 'DESC')
      .addOrderBy('reserva.horarioInicio', 'DESC')
      .getMany();
  }
}

export default new ReservaRepository();