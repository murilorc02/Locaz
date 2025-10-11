import { AppDataSource } from '../data-source';
import { Repository, Between, LessThan, In } from 'typeorm';
import { Reserva, StatusReserva } from '../entity/Reserva';

class ReservaRepository {
  private repository: Repository<Reserva>;

  constructor() {
    this.repository = AppDataSource.getRepository(Reserva);
  }

  // ==================== MÉTODOS BÁSICOS ====================

  async criar(reserva: Partial<Reserva>): Promise<Reserva> {
    const novaReserva = this.repository.create(reserva);
    return await this.repository.save(novaReserva);
  }

  async buscarPorId(id: string): Promise<Reserva | null> {
    return await this.repository.findOne({ 
      where: { id },
      relations: ['locatario', 'sala', 'sala.predio'],
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

  // ==================== MÉTODOS DO LOCATÁRIO ====================

  async buscarPorLocatario(locatarioId: string): Promise<Reserva[]> {
    return await this.repository.find({
      where: { locatario: { id: locatarioId } } as any,
      order: { dataReserva: 'DESC', horarioInicio: 'DESC' },
      relations: ['locatario', 'sala', 'sala.predio'],
    });
  }

  async buscarPorPredioLocatario(idPredio: string, idLocatario: string): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('predio.id = :idPredio', { idPredio })
      .andWhere('locatario.id = :idLocatario', { idLocatario })
      .orderBy('reserva.dataReserva', 'DESC')
      .addOrderBy('reserva.horarioInicio', 'DESC')
      .getMany();
  }

  async buscarPorNomePredioLocatario(nomePredio: string, idLocatario: string): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('LOWER(predio.nome) LIKE LOWER(:nomePredio)', { nomePredio: `%${nomePredio}%` })
      .andWhere('locatario.id = :idLocatario', { idLocatario })
      .orderBy('reserva.dataReserva', 'DESC')
      .addOrderBy('reserva.horarioInicio', 'DESC')
      .getMany();
  }

  async buscarPorSalaLocatario(idSala: string, idLocatario: string): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('sala.id = :idSala', { idSala })
      .andWhere('locatario.id = :idLocatario', { idLocatario })
      .orderBy('reserva.dataReserva', 'DESC')
      .addOrderBy('reserva.horarioInicio', 'DESC')
      .getMany();
  }

  async buscarPorNomeSalaLocatario(nomeSala: string, idLocatario: string): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('LOWER(sala.nome) LIKE LOWER(:nomeSala)', { nomeSala: `%${nomeSala}%` })
      .andWhere('locatario.id = :idLocatario', { idLocatario })
      .orderBy('reserva.dataReserva', 'DESC')
      .addOrderBy('reserva.horarioInicio', 'DESC')
      .getMany();
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
      relations: ['locatario', 'sala', 'sala.predio'],
    });
  }

  async buscarOrdenadoPorDataLocatario(idLocatario: string, ordem: string): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('locatario.id = :idLocatario', { idLocatario })
      .orderBy('reserva.dataReserva', ordem === 'asc' ? 'ASC' : 'DESC')
      .addOrderBy('reserva.horarioInicio', ordem === 'asc' ? 'ASC' : 'DESC')
      .getMany();
  }

  async buscarOrdenadoPorValorLocatario(idLocatario: string): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('locatario.id = :idLocatario', { idLocatario })
      .orderBy('reserva.valorTotal', 'ASC')
      .getMany();
  }

  // ==================== MÉTODOS DO LOCADOR ====================

  async verificarProprietarioSala(idSala: string, idLocador: string): Promise<boolean> {
    const sala = await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('predio.locador', 'locador')
      .where('sala.id = :idSala', { idSala })
      .andWhere('locador.id = :idLocador', { idLocador })
      .getOne();

    return !!sala;
  }

  async buscarTodasLocador(idLocador: string): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('predio.locador', 'locador')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('locador.id = :idLocador', { idLocador })
      .orderBy('reserva.dataReserva', 'DESC')
      .addOrderBy('reserva.horarioInicio', 'DESC')
      .getMany();
  }

  async buscarPorPredioLocador(idPredio: string, idLocador: string): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('predio.locador', 'locador')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('predio.id = :idPredio', { idPredio })
      .andWhere('locador.id = :idLocador', { idLocador })
      .orderBy('reserva.dataReserva', 'DESC')
      .addOrderBy('reserva.horarioInicio', 'DESC')
      .getMany();
  }

  async buscarPorNomePredioLocador(nomePredio: string, idLocador: string): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('predio.locador', 'locador')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('LOWER(predio.nome) LIKE LOWER(:nomePredio)', { nomePredio: `%${nomePredio}%` })
      .andWhere('locador.id = :idLocador', { idLocador })
      .orderBy('reserva.dataReserva', 'DESC')
      .addOrderBy('reserva.horarioInicio', 'DESC')
      .getMany();
  }

  async buscarPorSalaLocador(idSala: string, idLocador: string): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('predio.locador', 'locador')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('sala.id = :idSala', { idSala })
      .andWhere('locador.id = :idLocador', { idLocador })
      .orderBy('reserva.dataReserva', 'DESC')
      .addOrderBy('reserva.horarioInicio', 'DESC')
      .getMany();
  }

  async buscarPorNomeSalaLocador(nomeSala: string, idLocador: string): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('predio.locador', 'locador')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('LOWER(sala.nome) LIKE LOWER(:nomeSala)', { nomeSala: `%${nomeSala}%` })
      .andWhere('locador.id = :idLocador', { idLocador })
      .orderBy('reserva.dataReserva', 'DESC')
      .addOrderBy('reserva.horarioInicio', 'DESC')
      .getMany();
  }

  async buscarPorLocadorEStatus(idLocador: string, status: StatusReserva): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('predio.locador', 'locador')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('locador.id = :idLocador', { idLocador })
      .andWhere('reserva.status = :status', { status })
      .orderBy('reserva.dataReserva', 'DESC')
      .addOrderBy('reserva.horarioInicio', 'DESC')
      .getMany();
  }

  async buscarOrdenadoPorDataLocador(idLocador: string, ordem: string): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('predio.locador', 'locador')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('locador.id = :idLocador', { idLocador })
      .orderBy('reserva.dataReserva', ordem === 'asc' ? 'ASC' : 'DESC')
      .addOrderBy('reserva.horarioInicio', ordem === 'asc' ? 'ASC' : 'DESC')
      .getMany();
  }

  async buscarOrdenadoPorValorLocador(idLocador: string): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('predio.locador', 'locador')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('locador.id = :idLocador', { idLocador })
      .orderBy('reserva.valorTotal', 'ASC')
      .getMany();
  }

  // ==================== MÉTODOS AUXILIARES ====================

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
}

export default new ReservaRepository();