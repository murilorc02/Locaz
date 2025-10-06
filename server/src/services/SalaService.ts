import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Sala } from '../entity/Sala';
import { Predio } from '../entity/Predio';
import { CreateSalaDTO, UpdateSalaDTO } from '../dto/SalaDto';

export class SalaService {
  private salaRepository: Repository<Sala>;
  private predioRepository: Repository<Predio>;

  constructor() {
    this.salaRepository = AppDataSource.getRepository(Sala);
    this.predioRepository = AppDataSource.getRepository(Predio);
  }

  async criarSala(dadosSala: CreateSalaDTO): Promise<Sala> {
    // Verificar se o prédio existe
    const predio = await this.predioRepository.findOne({
      where: { id: dadosSala.predioId },
      relations: ['usuario']
    });

    if (!predio) {
      throw new Error('Prédio não encontrado. É necessário ter um prédio cadastrado para criar uma sala.');
    }

    // Verificar se já existe uma sala com o mesmo nome no prédio
    const salaExistente = await this.salaRepository.findOne({
      where: {
        nome: dadosSala.nome,
        predio: { id: dadosSala.predioId }
      }
    });

    if (salaExistente) {
      throw new Error('Já existe uma sala com este nome neste prédio');
    }

    const sala = this.salaRepository.create({
      nome: dadosSala.nome,
      descricao: dadosSala.descricao,
      capacidade: dadosSala.capacidade,
      categoria: dadosSala.categoria,
      precoHora: dadosSala.precoHora,
      reservaGratuita: dadosSala.reservaGratuita || false,
      comodidades: dadosSala.comodidades || [],
      predio
    });

    return await this.salaRepository.save(sala);
  }

  async editarSala(id: string, dadosAtualizacao: UpdateSalaDTO): Promise<Sala | null> {
    const salaExistente = await this.buscarPorId(id);

    if (!salaExistente) {
      throw new Error('Sala não encontrada');
    }

    // Se está mudando o nome, verificar se não existe outro com o mesmo nome no prédio
    if (dadosAtualizacao.nome && dadosAtualizacao.nome !== salaExistente.nome) {
      const salaComMesmoNome = await this.salaRepository.findOne({
        where: {
          nome: dadosAtualizacao.nome,
          predio: { id: salaExistente.predio.id }
        }
      });

      if (salaComMesmoNome && salaComMesmoNome.id !== id) {
        throw new Error('Já existe uma sala com este nome neste prédio');
      }
    }

    // Filtrar apenas os campos que foram fornecidos para atualização
    const camposParaAtualizar: Partial<Sala> = {};

    if (dadosAtualizacao.nome !== undefined) camposParaAtualizar.nome = dadosAtualizacao.nome;
    if (dadosAtualizacao.descricao !== undefined) camposParaAtualizar.descricao = dadosAtualizacao.descricao;
    if (dadosAtualizacao.capacidade !== undefined) camposParaAtualizar.capacidade = dadosAtualizacao.capacidade;
    if (dadosAtualizacao.categoria !== undefined) camposParaAtualizar.categoria = dadosAtualizacao.categoria;
    if (dadosAtualizacao.precoHora !== undefined) camposParaAtualizar.precoHora = dadosAtualizacao.precoHora;
    if (dadosAtualizacao.reservaGratuita !== undefined) camposParaAtualizar.reservaGratuita = dadosAtualizacao.reservaGratuita;
    if (dadosAtualizacao.comodidades !== undefined) camposParaAtualizar.comodidades = dadosAtualizacao.comodidades;

    // Apenas atualizar se houver campos para atualizar
    if (Object.keys(camposParaAtualizar).length > 0) {
      await this.salaRepository.update(id, camposParaAtualizar);
    }

    return await this.buscarPorId(id);
  }

  async buscarTodas(): Promise<Sala[]> {
    return await this.salaRepository.find({
      relations: ['predio', 'predio.usuario', 'reservas']
    });
  }

  async buscarPorId(id: string): Promise<Sala | null> {
    return await this.salaRepository.findOne({
      where: { id },
      relations: ['predio', 'predio.usuario', 'reservas', 'horarioSala'],
      select: {
        predio: {
          id: true,
          nome: true,
          endereco: true,
          cidade: true,
          estado: true,
          cep: true,
          descricao: true,
          createdAt: true,
          updatedAt: true,
          usuario: {
            id: true,
            nome: true
          }
        }
      }
    });
  }

  async buscarPorPredioId(predioId: string): Promise<Sala[]> {
    return await this.salaRepository.find({
      where: { predio: { id: predioId } },
      relations: ['reservas']
    });
  }

  async buscarPorFiltros(filtros: {
    cidade?: string;
    capacidade?: number;
    categoria?: string;
    precoMaximo?: number;
    comodidades?: string[];
    predioId?: string;
  }): Promise<Sala[]> {
    const queryBuilder = this.salaRepository.createQueryBuilder('sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('predio.usuario', 'usuario');

    if (filtros.cidade) {
      queryBuilder.andWhere('LOWER(predio.cidade) LIKE LOWER(:cidade)', {
        cidade: `%${filtros.cidade}%`
      });
    }

    if (filtros.capacidade) {
      queryBuilder.andWhere('sala.capacidade >= :capacidade', {
        capacidade: filtros.capacidade
      });
    }

    if (filtros.categoria) {
      queryBuilder.andWhere('sala.categoria = :categoria', {
        categoria: filtros.categoria
      });
    }

    if (filtros.precoMaximo) {
      queryBuilder.andWhere('sala.precoHora <= :precoMaximo', {
        precoMaximo: filtros.precoMaximo
      });
    }

    if (filtros.predioId) {
      queryBuilder.andWhere('predio.id = :predioId', {
        predioId: filtros.predioId
      });
    }

    if (filtros.comodidades && filtros.comodidades.length > 0) {
      // Para arrays de enum no PostgreSQL, usamos o operador @>
      queryBuilder.andWhere('sala.comodidades && :comodidades', {
        comodidades: filtros.comodidades
      });
    }

    return await queryBuilder.getMany();
  }

  async buscarDisponiveis(dataReserva: Date, horarioInicio: string, horarioFim: string): Promise<Sala[]> {
    return await this.salaRepository.createQueryBuilder('sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoin('sala.reservas', 'reserva',
        `reserva.dataReserva = :dataReserva 
        AND reserva.status IN ('confirmada', 'pendente')
        AND (
          (reserva.horarioInicio <= :horarioInicio AND reserva.horarioFim > :horarioInicio) OR
          (reserva.horarioInicio < :horarioFim AND reserva.horarioFim >= :horarioFim) OR
          (reserva.horarioInicio >= :horarioInicio AND reserva.horarioFim <= :horarioFim)
        )`,
        { dataReserva, horarioInicio, horarioFim }
      )
      .where('reserva.id IS NULL')
      .getMany();
  }

  async excluirSala(id: string): Promise<void> {
    const sala = await this.buscarPorId(id);

    if (!sala) {
      throw new Error('Sala não encontrada');
    }

    // Verificar se a sala tem reservas ativas
    const reservasAtivas = await this.salaRepository
      .createQueryBuilder('sala')
      .leftJoin('sala.reservas', 'reserva')
      .where('sala.id = :id', { id })
      .andWhere('reserva.status IN (:...status)', { status: ['confirmada', 'pendente'] })
      .andWhere('reserva.dataReserva >= :hoje', { hoje: new Date() })
      .getCount();

    if (reservasAtivas > 0) {
      throw new Error('Não é possível excluir uma sala que possui reservas ativas ou futuras');
    }

    await this.salaRepository.delete(id);
  }

  async contarPorPredio(predioId: string): Promise<number> {
    return await this.salaRepository.count({
      where: { predio: { id: predioId } }
    });
  }

  async buscarPorCategoria(categoria: string): Promise<Sala[]> {
    return await this.salaRepository.find({
      where: { categoria },
      relations: ['predio', 'predio.usuario']
    });
  }

  async verificarDisponibilidade(
    salaId: string,
    dataReserva: Date,
    horarioInicio: string,
    horarioFim: string
  ): Promise<boolean> {
    const conflitos = await this.salaRepository
      .createQueryBuilder('sala')
      .leftJoin('sala.reservas', 'reserva')
      .where('sala.id = :salaId', { salaId })
      .andWhere('reserva.dataReserva = :dataReserva', { dataReserva })
      .andWhere('reserva.status IN (:...status)', { status: ['confirmada', 'pendente'] })
      .andWhere(`(
        (reserva.horarioInicio <= :horarioInicio AND reserva.horarioFim > :horarioInicio) OR
        (reserva.horarioInicio < :horarioFim AND reserva.horarioFim >= :horarioFim) OR
        (reserva.horarioInicio >= :horarioInicio AND reserva.horarioFim <= :horarioFim)
      )`, { horarioInicio, horarioFim })
      .getCount();

    return conflitos === 0;
  }
}