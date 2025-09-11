import { AppDataSource } from '../data-source';
import { Sala } from '../entity/Sala';

export const SalaRepository = AppDataSource.getRepository(Sala).extend({
  findByProprietarioId(proprietarioId: number) {
    return this.find({
      where: { proprietario: { id: proprietarioId } },
      relations: ['predio', 'proprietario']
    });
  },

  findByPredioId(predioId: number, proprietarioId?: number) {
    const where: any = { predio: { id: predioId } };
    if (proprietarioId) {
      where.proprietario = { id: proprietarioId };
    }

    return this.find({ 
      where,
      relations: ['predio', 'proprietario']
    });
  },

  findAtivasEDisponiveis() {
    return this.find({ 
      where: { ativo: true, privado: false },
      relations: ['predio', 'proprietario']
    });
  },

  searchSalas(filtros: any) {
    let query = this.createQueryBuilder('sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('sala.proprietario', 'proprietario')
      .where('sala.ativo = :ativo', { ativo: true })
      .andWhere('sala.disponivel = :disponivel', { disponivel: true });

    if (filtros.nome) {
      query = query.andWhere('LOWER(sala.nome) LIKE LOWER(:nome)', { nome: `%${filtros.nome}%` });
    }

    if (filtros.capacidadeMin) {
      query = query.andWhere('sala.capacidade >= :capacidadeMin', { capacidadeMin: filtros.capacidadeMin });
    }

    if (filtros.capacidadeMax) {
      query = query.andWhere('sala.capacidade <= :capacidadeMax', { capacidadeMax: filtros.capacidadeMax });
    }

    if (filtros.precoMin) {
      query = query.andWhere('sala.precoHora >= :precoMin', { precoMin: filtros.precoMin });
    }

    if (filtros.precoMax) {
      query = query.andWhere('sala.precoHora <= :precoMax', { precoMax: filtros.precoMax });
    }

    if (filtros.predioId) {
      query = query.andWhere('predio.id = :predioId', { predioId: filtros.predioId });
    }

    return query.getMany();
  }
});