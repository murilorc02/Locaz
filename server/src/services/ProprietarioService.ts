import { PredioRepository } from '../repository/PredioRepository';
import { SalaRepository } from '../repository/SalaRepository';
import { ProprietarioRepository } from '../repository/ProprietarioRepository';
import { ReservaRepository } from '../repository/ReservaRepository';
import { CreatePredioDto, UpdatePredioDto, PredioResponseDto } from '../dto/PredioDto';
import { CreateSalaDto, UpdateSalaDto, SalaResponseDto } from '../dto/SalaDto';
import { ReservaResponseDto, ReservaFilterDto } from '../dto/ReservaDto';
import { StatusReserva } from '../entity/Reserva'; // Adicionar este import

export class ProprietarioService {
  // Gerenciamento de Prédios
  async criarPredio(proprietarioId: number, createPredioDto: CreatePredioDto): Promise<PredioResponseDto> {
    const proprietario = await ProprietarioRepository.findOne({ where: { id: proprietarioId } });
    if (!proprietario) {
      throw new Error('Proprietário não encontrado');
    }

    const predio = PredioRepository.create({
      ...createPredioDto,
      proprietario
    });

    const savedPredio = await PredioRepository.save(predio);
    return this.toPredioResponseDto(savedPredio);
  }

  async buscarMeusPredios(proprietarioId: number): Promise<PredioResponseDto[]> {
    const predios = await PredioRepository.find({
      where: { proprietario: { id: proprietarioId } },
      relations: ['salas'],
      order: { createdAt: 'DESC' }
    });

    return predios.map(predio => ({
      ...this.toPredioResponseDto(predio),
      totalSalas: predio.salas?.length || 0,
      totalComodidades: predio.comodidades?.length || 0
    }));
  }

  async buscarPredioPorId(proprietarioId: number, predioId: number): Promise<PredioResponseDto> {
    const predio = await PredioRepository.findOne({
      where: { id: predioId, proprietario: { id: proprietarioId } },
      relations: ['salas', 'proprietario']
    });

    if (!predio) {
      throw new Error('Prédio não encontrado ou você não tem permissão para acessá-lo');
    }

    return this.toPredioResponseDto(predio);
  }

  async buscarPredioPorNome(proprietarioId: number, nome: string): Promise<PredioResponseDto[]> {
    const predios = await PredioRepository.createQueryBuilder('predio')
      .leftJoinAndSelect('predio.salas', 'salas')
      .leftJoinAndSelect('predio.proprietario', 'proprietario')
      .where('predio.proprietario.id = :proprietarioId', { proprietarioId })
      .andWhere('LOWER(predio.nome) LIKE LOWER(:nome)', { nome: `%${nome}%` })
      .getMany();

    return predios.map(predio => this.toPredioResponseDto(predio));
  }

  async editarPredio(proprietarioId: number, predioId: number, updatePredioDto: UpdatePredioDto): Promise<PredioResponseDto> {
    const predio = await PredioRepository.findOne({
      where: { id: predioId, proprietario: { id: proprietarioId } }
    });

    if (!predio) {
      throw new Error('Prédio não encontrado ou você não tem permissão para editá-lo');
    }

    await PredioRepository.update(predioId, updatePredioDto);
    const updatedPredio = await PredioRepository.findOne({ 
      where: { id: predioId },
      relations: ['proprietario', 'salas']
    });

    return this.toPredioResponseDto(updatedPredio!);
  }

  async removerPredio(proprietarioId: number, predioId: number): Promise<void> {
    const predio = await PredioRepository.findOne({
      where: { id: predioId, proprietario: { id: proprietarioId } },
      relations: ['salas']
    });

    if (!predio) {
      throw new Error('Prédio não encontrado ou você não tem permissão para removê-lo');
    }

    if (predio.salas && predio.salas.length > 0) {
      throw new Error('Não é possível remover um prédio que possui salas cadastradas');
    }

    await PredioRepository.remove(predio);
  }

  // Gerenciamento de Salas
  async criarSala(proprietarioId: number, createSalaDto: CreateSalaDto): Promise<SalaResponseDto> {
    const predio = await PredioRepository.findOne({
      where: { id: createSalaDto.predioId, proprietario: { id: proprietarioId } }
    });

    if (!predio) {
      throw new Error('Prédio não encontrado ou você não tem permissão para criar salas nele');
    }

    const proprietario = await ProprietarioRepository.findOne({ where: { id: proprietarioId } });
    if (!proprietario) {
      throw new Error('Proprietário não encontrado');
    }

    const sala = SalaRepository.create({
      ...createSalaDto,
      predio,
      proprietario
    });

    const savedSala = await SalaRepository.save(sala);
    return this.toSalaResponseDto(savedSala);
  }

  async buscarMinhasSalas(proprietarioId: number): Promise<SalaResponseDto[]> {
    const salas = await SalaRepository.find({
      where: { proprietario: { id: proprietarioId } },
      relations: ['predio', 'proprietario'],
      order: { createdAt: 'DESC' }
    });

    return salas.map(sala => this.toSalaResponseDto(sala));
  }

  async buscarSalasPorPredio(proprietarioId: number, predioId: number): Promise<SalaResponseDto[]> {
    const salas = await SalaRepository.find({
      where: { 
        predio: { id: predioId },
        proprietario: { id: proprietarioId }
      },
      relations: ['predio', 'proprietario']
    });

    return salas.map(sala => this.toSalaResponseDto(sala));
  }

  async editarSala(proprietarioId: number, salaId: number, updateSalaDto: UpdateSalaDto): Promise<SalaResponseDto> {
    const sala = await SalaRepository.findOne({
      where: { id: salaId, proprietario: { id: proprietarioId } }
    });

    if (!sala) {
      throw new Error('Sala não encontrada ou você não tem permissão para editá-la');
    }

    await SalaRepository.update(salaId, updateSalaDto);
    const updatedSala = await SalaRepository.findOne({
      where: { id: salaId },
      relations: ['predio', 'proprietario']
    });

    return this.toSalaResponseDto(updatedSala!);
  }

  async removerSala(proprietarioId: number, salaId: number): Promise<void> {
    const sala = await SalaRepository.findOne({
      where: { id: salaId, proprietario: { id: proprietarioId } },
      relations: ['reservas']
    });

    if (!sala) {
      throw new Error('Sala não encontrada ou você não tem permissão para removê-la');
    }

    // Verificar se há reservas ativas - Corrigido
    const reservasAtivas = sala.reservas?.filter(reserva => 
      reserva.status === StatusReserva.CONFIRMADO || reserva.status === StatusReserva.PENDENTE
    );

    if (reservasAtivas && reservasAtivas.length > 0) {
      throw new Error('Não é possível remover uma sala com reservas ativas');
    }

    await SalaRepository.remove(sala);
  }

  // Gerenciamento de Reservas
  async buscarMinhasReservas(proprietarioId: number, filtros?: ReservaFilterDto): Promise<ReservaResponseDto[]> {
    let query = ReservaRepository.createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .leftJoinAndSelect('sala.predio', 'predio')
      .where('sala.proprietario.id = :proprietarioId', { proprietarioId });

    if (filtros?.status) {
      query = query.andWhere('reserva.status = :status', { status: filtros.status });
    }

    if (filtros?.dataInicio) {
      query = query.andWhere('reserva.dataReserva >= :dataInicio', { dataInicio: filtros.dataInicio });
    }

    if (filtros?.dataFim) {
      query = query.andWhere('reserva.dataReserva <= :dataFim', { dataFim: filtros.dataFim });
    }

    if (filtros?.salaId) {
      query = query.andWhere('reserva.sala.id = :salaId', { salaId: filtros.salaId });
    }

    query = query.orderBy('reserva.dataReserva', 'DESC')
                 .addOrderBy('reserva.horaInicio', 'ASC');

    const reservas = await query.getMany();
    return reservas.map(reserva => this.toReservaResponseDto(reserva));
  }

  // Métodos auxiliares
  private toPredioResponseDto(predio: any): PredioResponseDto {
    return {
      id: predio.id,
      nomePredio: predio.nome,
      endereco: predio.endereco,
      cidade: predio.cidade,
      estado: predio.estado,
      cep: predio.cep,
      descricao: predio.descricao,
      imagens: predio.imagens,
      comodidades: predio.comodidades,
      ativo: predio.ativo,
      createdAt: predio.createdAt,
      updatedAt: predio.updatedAt,
      proprietario: predio.proprietario,
      salas: predio.salas
    };
  }

  private toSalaResponseDto(sala: any): SalaResponseDto {
    return {
      id: sala.id,
      nome: sala.nome,
      descricao: sala.descricao,
      capacidade: sala.capacidade,
      precoHora: sala.precoHora,
      imagem: sala.imagens,
      pontosDestaque: sala.pontosDestaque,
      ativo: sala.ativo,
      createdAt: sala.createdAt,
      updatedAt: sala.updatedAt,
      predio: sala.predio,
      proprietario: sala.proprietario
    };
  }

  private toReservaResponseDto(reserva: any): ReservaResponseDto {
    return {
      id: reserva.id,
      clienteNome: reserva.clienteNome,
      clienteEmail: reserva.clienteEmail,
      dataReserva: reserva.dataReserva,
      horaInicio: reserva.horaInicio,
      horaFim: reserva.horaFim,
      valorTotal: reserva.valorTotal,
      status: reserva.status,
      observacoes: reserva.observacoes,
      createdAt: reserva.createdAt,
      updatedAt: reserva.updatedAt,
      sala: {
        id: reserva.sala?.id || 0,
        nome: reserva.sala?.nome || '' // Corrigido
      },
      locatario: reserva.locatario ? {
        id: reserva.locatario.id,
        nome: reserva.locatario.nome,
        email: reserva.locatario.email
      } : undefined
    };
  }
}