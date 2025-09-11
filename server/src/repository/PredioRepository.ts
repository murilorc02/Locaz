import { AppDataSource } from '../data-source';
import { Predio } from '../entity/Predio';

export const PredioRepository = AppDataSource.getRepository(Predio).extend({
  findByProprietarioId(proprietarioId: number) {
    return this.find({
      where: { proprietario: { id: proprietarioId } },
      relations: ['salas', 'proprietario']
    });
  },

  findByNome(nome: string, proprietarioId?: number) {
    const query = this.createQueryBuilder('predio')
      .leftJoinAndSelect('predio.salas', 'salas')
      .leftJoinAndSelect('predio.proprietario', 'proprietario')
      .where('LOWER(predio.nomePredio) LIKE LOWER(:nome)', { nome: `%${nome}%` }); // Alterado para nomePredio

    if (proprietarioId) {
      query.andWhere('predio.proprietario.id = :proprietarioId', { proprietarioId });
    }

    return query.getMany();
  },

  findAtivosPredios() {
    return this.find({
      where: { ativo: true },
      relations: ['salas']
    });
  }
});