
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

  async buscarPorId(id: number): Promise<Reserva | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['locatario', 'sala', 'sala.predio'],
    });
  }

  async atualizar(id: number, dados: Partial<Reserva>): Promise<Reserva> {
    await this.repository.update(id, dados);
    const reservaAtualizada = await this.buscarPorId(id);
    if (!reservaAtualizada) {
      throw new Error('Reserva não encontrada após atualização');
    }
    return reservaAtualizada;
  }

  async deletar(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async verificarDisponibilidade(
    salaId: number,
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

  async buscarPorLocatario(locatarioId: number): Promise<Reserva[]> {
    return await this.repository.find({
      where: { locatario: { id: locatarioId } },
      order: { dataReserva: 'DESC', horarioInicio: 'DESC' },
      relations: ['locatario', 'sala', 'sala.predio'],
    });
  }

  async buscarPorPredioLocatario(idPredio: number, idLocatario: number): Promise<Reserva[]> {
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

  async buscarPorNomePredioLocatario(nomePredio: string, idLocatario: number): Promise<Reserva[]> {
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

  async buscarPorSalaLocatario(idSala: number, idLocatario: number): Promise<Reserva[]> {
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

  async buscarPorNomeSalaLocatario(nomeSala: string, idLocatario: number): Promise<Reserva[]> {
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
    locatarioId: number,
    status: StatusReserva,
  ): Promise<Reserva[]> {
    return await this.repository.find({
      where: {
        locatario: { id: locatarioId },
        status
      },
      order: { dataReserva: 'DESC', horarioInicio: 'DESC' },
      relations: ['locatario', 'sala', 'sala.predio'],
    });
  }

  async buscarOrdenadoPorDataLocatario(idLocatario: number, ordem: string): Promise<Reserva[]> {
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

  async buscarOrdenadoPorValorLocatario(idLocatario: number): Promise<Reserva[]> {
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

  async verificarProprietarioSala(idSala: number, idLocador: number): Promise<boolean> {
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

  async buscarTodasLocador(idLocador: number): Promise<Reserva[]> {
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

  async buscarPorPredioLocador(idPredio: number, idLocador: number): Promise<Reserva[]> {
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

  async buscarPorNomePredioLocador(nomePredio: string, idLocador: number): Promise<Reserva[]> {
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

  async buscarPorSalaLocador(idSala: number, idLocador: number): Promise<Reserva[]> {
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

  async buscarPorNomeSalaLocador(nomeSala: string, idLocador: number): Promise<Reserva[]> {
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

  async buscarPorLocadorEStatus(idLocador: number, status: StatusReserva): Promise<Reserva[]> {
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

  async buscarOrdenadoPorDataLocador(idLocador: number, ordem: string): Promise<Reserva[]> {
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

  async buscarOrdenadoPorValorLocador(idLocador: number): Promise<Reserva[]> {
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

  async buscarReservasPorSalaPeriodo(
    salaId: number,
    dataInicio: Date,
    dataFim: Date
  ): Promise<Reserva[]> {
    return await this.repository
      .createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .where('sala.id = :salaId', { salaId })
      .andWhere('reserva.dataReserva BETWEEN :dataInicio AND :dataFim', {
        dataInicio: dataInicio.toISOString().split('T')[0],
        dataFim: dataFim.toISOString().split('T')[0]
      })
      .andWhere('reserva.status IN (:...status)', {
        status: [StatusReserva.ACEITA, StatusReserva.PENDENTE]
      })
      .orderBy('reserva.dataReserva', 'ASC')
      .addOrderBy('reserva.horarioInicio', 'ASC')
      .getMany();
  }

  async buscarInfoSala(idSala: number): Promise<{
    sala_id: number;
    sala_nome: string;
    sala_precoHora: string;
  } | null> {
    const result = await this.repository
      .createQueryBuilder('reserva')
      .leftJoin('reserva.sala', 'sala')
      .where('sala.id = :idSala', { idSala })
      .select(['sala.id', 'sala.nome', 'sala.precoHora'])
      .getRawOne();

    return result;
  }
}

export default new ReservaRepository();