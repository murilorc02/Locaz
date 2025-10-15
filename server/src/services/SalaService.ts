import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { CategoriaSala, Sala } from '../entity/Sala';
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
      categoria: dadosSala.categoria as CategoriaSala,
      precoHora: dadosSala.precoHora,
      reservaGratuita: dadosSala.reservaGratuita || false,
      comodidades: dadosSala.comodidades || [],
      predio: predio
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
    
    // Converter string para CategoriaSala
    if (dadosAtualizacao.categoria !== undefined) {
      camposParaAtualizar.categoria = dadosAtualizacao.categoria as CategoriaSala;
    }
    
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
    nome?: string;
    cidade?: string;
    capacidade?: number;
    categoria?: string;
    precoMinimo?: number;
    precoMaximo?: number;
    comodidades?: string[];
    predioId?: string;
    dataReserva?: string;
    horarioInicio?: string;
    horarioFim?: string;
    ordenarPor?: 'preco' | 'capacidade' | 'nome';
    ordem?: 'ASC' | 'DESC';
  }): Promise<Sala[]> {
    // Se houver filtros de disponibilidade, buscar salas disponíveis
    if (filtros.dataReserva && filtros.horarioInicio && filtros.horarioFim) {
      const dataReserva = new Date(filtros.dataReserva);
      let salas = await this.buscarDisponiveisComFiltros(
        dataReserva,
        filtros.horarioInicio,
        filtros.horarioFim,
        filtros
      );

      // Aplicar filtros adicionais
      salas = this.aplicarFiltrosAdicionais(salas, filtros);
      return this.ordenarResultados(salas, filtros.ordenarPor, filtros.ordem);
    }

    // Busca normal com filtros
    const queryBuilder = this.salaRepository.createQueryBuilder('sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('predio.usuario', 'usuario');

    if (filtros.nome) {
      queryBuilder.andWhere('(LOWER(sala.nome) LIKE LOWER(:nome) OR LOWER(sala.descricao) LIKE LOWER(:nome))', {
        nome: `%${filtros.nome}%`
      });
    }

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

    if (filtros.precoMinimo !== undefined) {
      queryBuilder.andWhere('sala.precoHora >= :precoMinimo', {
        precoMinimo: filtros.precoMinimo
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
      queryBuilder.andWhere('sala.comodidades && :comodidades', {
        comodidades: filtros.comodidades
      });
    }

    // Aplicar ordenação
    const ordenarPor = filtros.ordenarPor || 'nome';
    const ordem = filtros.ordem || 'ASC';

    switch (ordenarPor) {
      case 'preco':
        queryBuilder.orderBy('sala.precoHora', ordem);
        break;
      case 'capacidade':
        queryBuilder.orderBy('sala.capacidade', ordem);
        break;
      case 'nome':
      default:
        queryBuilder.orderBy('sala.nome', ordem);
        break;
    }

    return await queryBuilder.getMany();
  }

  private async buscarDisponiveisComFiltros(
    dataReserva: Date,
    horarioInicio: string,
    horarioFim: string,
    filtros: any
  ): Promise<Sala[]> {
    const queryBuilder = this.salaRepository.createQueryBuilder('sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('predio.usuario', 'usuario')
      .leftJoin('sala.reservas', 'reserva',
        `reserva.dataReserva = :dataReserva 
        AND reserva.status IN ('confirmada', 'pendente')
        AND (
          (reserva.horarioInicio <= :horarioInicio AND reserva.horarioFim > :horarioInicio) OR
          (reserva.horarioInicio < :horarioFim AND reserva.horarioFim >= :horarioFim) OR
          (reserva.horarioInicio >= :horarioInicio AND reserva.horarioFim <= :horarioFim)
        )`,
        {
          dataReserva: dataReserva.toISOString().split('T')[0],
          horarioInicio,
          horarioFim
        }
      )
      .where('reserva.id IS NULL');

    // Aplicar filtros do prédio e sala
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

    if (filtros.comodidades && filtros.comodidades.length > 0) {
      queryBuilder.andWhere('sala.comodidades && :comodidades', {
        comodidades: filtros.comodidades
      });
    }

    return await queryBuilder.getMany();
  }

  private aplicarFiltrosAdicionais(salas: Sala[], filtros: any): Sala[] {
    let resultado = [...salas];

    // Filtro por nome (se ainda não foi aplicado)
    if (filtros.nome) {
      const nomeBusca = filtros.nome.toLowerCase();
      resultado = resultado.filter(sala =>
        sala.nome.toLowerCase().includes(nomeBusca) ||
        sala.descricao?.toLowerCase().includes(nomeBusca)
      );
    }

    // Filtro por preço mínimo
    if (filtros.precoMinimo !== undefined) {
      resultado = resultado.filter(sala =>
        Number(sala.precoHora) >= filtros.precoMinimo
      );
    }

    return resultado;
  }

  private ordenarResultados(
    salas: Sala[],
    ordenarPor?: 'preco' | 'capacidade' | 'nome',
    ordem: 'ASC' | 'DESC' = 'ASC'
  ): Sala[] {
    if (!ordenarPor) {
      return salas;
    }

    const multiplicador = ordem === 'ASC' ? 1 : -1;

    return salas.sort((a, b) => {
      switch (ordenarPor) {
        case 'preco':
          return (Number(a.precoHora) - Number(b.precoHora)) * multiplicador;
        case 'capacidade':
          return (a.capacidade - b.capacidade) * multiplicador;
        case 'nome':
          return a.nome.localeCompare(b.nome) * multiplicador;
        default:
          return 0;
      }
    });
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

  async buscarPorCategoria(categoria: CategoriaSala): Promise<Sala[]> {
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

  // Novos métodos para a tela de busca
  async obterComodidadesDisponiveis(): Promise<string[]> {
    const salas = await this.buscarTodas();
    const comodidadesSet = new Set<string>();

    salas.forEach(sala => {
      if (sala.comodidades) {
        sala.comodidades.forEach(comodidade => {
          comodidadesSet.add(comodidade);
        });
      }
    });

    return Array.from(comodidadesSet).sort();
  }

  async obterCategoriasDisponiveis(): Promise<string[]> {
    const result = await this.salaRepository
      .createQueryBuilder('sala')
      .select('DISTINCT sala.categoria', 'categoria')
      .getRawMany();

    return result.map(r => r.categoria).filter(Boolean).sort();
  }

  async obterEstatisticas(): Promise<{
    totalSalas: number;
    porCategoria: Array<{ categoria: string; total: number }>;
    capacidadeMedia: number;
    precoMedio: number;
  }> {
    const totalSalas = await this.salaRepository.count();

    const porCategoria = await this.salaRepository
      .createQueryBuilder('sala')
      .select('sala.categoria', 'categoria')
      .addSelect('COUNT(*)', 'total')
      .groupBy('sala.categoria')
      .getRawMany()
      .then(results => results.map(r => ({
        categoria: r.categoria,
        total: parseInt(r.total)
      })));

    const { capacidadeMedia, precoMedio } = await this.salaRepository
      .createQueryBuilder('sala')
      .select('AVG(sala.capacidade)', 'capacidadeMedia')
      .addSelect('AVG(sala.precoHora)', 'precoMedio')
      .getRawOne();

    return {
      totalSalas,
      porCategoria,
      capacidadeMedia: Math.round(parseFloat(capacidadeMedia || '0')),
      precoMedio: parseFloat(precoMedio || '0')
    };
  }

  // Método para obter horários disponíveis de uma sala em uma data específica
  async obterHorariosDisponiveis(salaId: string, dataReserva: string): Promise<{
    data: string;
    sala: {
      id: string;
      nome: string;
      precoHora: number;
    };
    horarios: Array<{
      horario: string;
      disponivel: boolean;
      preco: number;
    }>;
  }> {
    const sala = await this.buscarPorId(salaId);
    
    if (!sala) {
      throw new Error('Sala não encontrada');
    }

    // Buscar todas as reservas confirmadas ou pendentes para a data
    const reservas = await this.salaRepository
      .createQueryBuilder('sala')
      .leftJoinAndSelect('sala.reservas', 'reserva')
      .where('sala.id = :salaId', { salaId })
      .andWhere('reserva.dataReserva = :dataReserva', { dataReserva })
      .andWhere('reserva.status IN (:...status)', { status: ['confirmada', 'pendente'] })
      .getOne();

    // Gerar horários de 7h às 19h (slots de 1 hora)
    const horarios = [];
    for (let hora = 7; hora < 19; hora++) {
      const horarioInicio = `${hora.toString().padStart(2, '0')}:00`;
      const horarioFim = `${(hora + 1).toString().padStart(2, '0')}:00`;
      
      // Verificar se o horário está ocupado
      const ocupado = reservas?.reservas?.some(reserva => {
        const reservaInicio = reserva.horarioInicio;
        const reservaFim = reserva.horarioFim;
        
        return (
          (horarioInicio >= reservaInicio && horarioInicio < reservaFim) ||
          (horarioFim > reservaInicio && horarioFim <= reservaFim) ||
          (horarioInicio <= reservaInicio && horarioFim >= reservaFim)
        );
      }) || false;

      horarios.push({
        horario: horarioInicio,
        disponivel: !ocupado,
        preco: Number(sala.precoHora)
      });
    }

    return {
      data: dataReserva,
      sala: {
        id: sala.id,
        nome: sala.nome,
        precoHora: Number(sala.precoHora)
      },
      horarios
    };
  }
}