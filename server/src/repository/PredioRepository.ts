import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Predio } from '../entity/Predio';

export class PredioRepository {
  private repository: Repository<Predio>;

  constructor() {
    this.repository = AppDataSource.getRepository(Predio);
  }

  async criar(dados: Partial<Predio>): Promise<Predio> {
    const predio = this.repository.create(dados);
    return await this.repository.save(predio);
  }

  async buscarPorId(id: number): Promise<Predio | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['salas', 'usuario']
    });
  }

  async buscarTodos(): Promise<Predio[]> {
    return await this.repository.find({
      relations: ['salas', 'usuario'],
      order: { nome: 'ASC' }
    });
  }

  async buscarPorNome(nome: string): Promise<Predio | null> {
    return await this.repository.findOne({
      where: { nome },
      relations: ['usuario']
    });
  }

  async buscarPorUsuario(usuarioId: number): Promise<Predio[]> {
    return await this.repository.find({
      where: { usuario: { id: usuarioId } },
      relations: ['salas']
    });
  }

  async buscarPorCidade(cidade: string): Promise<Predio[]> {
    return await this.repository.find({
      where: { cidade },
      relations: ['salas', 'usuario']
    });
  }

  async atualizar(id: number, dados: Partial<Predio>): Promise<Predio | null> {
    await this.repository.update(id, dados);
    return await this.buscarPorId(id);
  }

  async excluir(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async existeNome(nome: string, excluirId?: number): Promise<boolean> {
    const query = this.repository.createQueryBuilder('predio')
      .where('predio.nome = :nome', { nome });

    if (excluirId) {
      query.andWhere('predio.id != :id', { id: excluirId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async buscarComFiltros(filtros: {
    cidade?: string;
    estado?: string;
    usuarioId?: number;
  }): Promise<Predio[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('predio')
      .leftJoinAndSelect('predio.salas', 'salas')
      .leftJoinAndSelect('predio.usuario', 'usuario');

    if (filtros.cidade) {
      queryBuilder.andWhere('predio.cidade ILIKE :cidade', {
        cidade: `%${filtros.cidade}%`
      });
    }

    if (filtros.estado) {
      queryBuilder.andWhere('predio.estado = :estado', {
        estado: filtros.estado
      });
    }

    if (filtros.usuarioId) {
      queryBuilder.andWhere('usuario.id = :usuarioId', {
        usuarioId: filtros.usuarioId
      });
    }

    return await queryBuilder.getMany();
  }
}