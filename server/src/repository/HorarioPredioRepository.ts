import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { HorarioPredio, DiaSemana } from '../entity/horarioPredio';

export class HorarioPredioRepository {
  private repository: Repository<HorarioPredio>;

  constructor() {
    this.repository = AppDataSource.getRepository(HorarioPredio);
  }

  async criar(dados: Partial<HorarioPredio>): Promise<HorarioPredio> {
    const horario = this.repository.create(dados);
    return await this.repository.save(horario);
  }

  async criarMultiplos(predioId: number, horarios: Partial<HorarioPredio>[]): Promise<HorarioPredio[]> {
    // Remove horários existentes para os mesmos dias antes de criar novos
    const diasParaCriar = horarios.map(h => h.diaSemana).filter(Boolean) as DiaSemana[];
    
    if (diasParaCriar.length > 0) {
      await this.repository
        .createQueryBuilder()
        .delete()
        .where('predioId = :predioId', { predioId })
        .andWhere('diaSemana IN (:...dias)', { dias: diasParaCriar })
        .execute();
    }

    const entidades = this.repository.create(horarios);
    return await this.repository.save(entidades);
  }

  async buscarPorId(id: number): Promise<HorarioPredio | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['predio', 'predio.usuario']
    });
  }

  async buscarPorPredio(predioId: number): Promise<HorarioPredio[]> {
    return await this.repository.find({
      where: { predio: { id: predioId } },
      relations: ['predio'],
      order: { diaSemana: 'ASC' }
    });
  }

  async buscarPorDia(predioId: number, diaSemana: DiaSemana): Promise<HorarioPredio | null> {
    return await this.repository.findOne({
      where: {
        predio: { id: predioId },
        diaSemana,
        ativo: true
      },
      relations: ['predio']
    });
  }

  async buscarAtivos(predioId: number): Promise<HorarioPredio[]> {
    return await this.repository.find({
      where: {
        predio: { id: predioId },
        ativo: true
      },
      relations: ['predio'],
      order: { diaSemana: 'ASC' }
    });
  }

  async buscarTodos(): Promise<HorarioPredio[]> {
    return await this.repository.find({
      relations: ['predio'],
      order: {
        predio: { nome: 'ASC' },
        diaSemana: 'ASC'
      }
    });
  }

  async atualizar(id: number, dados: Partial<HorarioPredio>): Promise<HorarioPredio | null> {
    await this.repository.update(id, dados);
    return await this.buscarPorId(id);
  }

  async deletarPorId(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async deletarPorPredio(predioId: number): Promise<void> {
    await this.repository.delete({ predio: { id: predioId } });
  }

  async existeHorarioParaDia(predioId: number, diaSemana: DiaSemana, excludeId?: number): Promise<boolean> {
    const query = this.repository.createQueryBuilder('horario')
      .where('horario.predioId = :predioId', { predioId })
      .andWhere('horario.diaSemana = :diaSemana', { diaSemana });

    if (excludeId) {
      query.andWhere('horario.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async buscarPorIntervaloTempo(
    predioId: number,
    diaSemana: DiaSemana,
    horarioInicio: string,
    horarioFim: string
  ): Promise<HorarioPredio | null> {
    return await this.repository
      .createQueryBuilder('horario')
      .where('horario.predioId = :predioId', { predioId })
      .andWhere('horario.diaSemana = :diaSemana', { diaSemana })
      .andWhere('horario.horarioAbertura >= :horarioInicio', { horarioInicio })
      .andWhere('horario.horarioFechamento <= :horarioFim', { horarioFim })
      .andWhere('horario.ativo = :ativo', { ativo: true })
      .getOne();
  }
}