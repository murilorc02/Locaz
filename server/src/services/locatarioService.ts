import { SalaRepository } from '../repository/SalaRepository';
import { ReservaRepository } from '../repository/ReservaRepository';
import { LocatarioRepository } from '../repository/LocatarioRepository';
import { SalaResponseDto, SalaSearchDto } from '../dto/SalaDto';
import { CreateReservaDto, ReservaResponseDto, ReservaFilterDto } from '../dto/ReservaDto';
import { HorarioDisponivelResponseDto, ConsultaHorarioDto } from '../dto/HorarioDto';
import { StatusReserva } from '../entity/Reserva';
import { Sala } from '../entity/Sala';
import { Reserva } from '../entity/Reserva';

export class LocatarioService {
  // Busca de Salas
  async buscarSalas(filtros?: SalaSearchDto): Promise<SalaResponseDto[]> {
    let query = SalaRepository.createQueryBuilder('sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('sala.proprietario', 'proprietario')
      .where('sala.ativo = :ativo', { ativo: true })
      .andWhere('sala.privado = :privado', { privado: false }); // Corrigido 'disponivel' para 'privado'

    if (filtros?.nome) {
      query = query.andWhere('LOWER(sala.nomeSala) LIKE LOWER(:nome)', { nome: `%${filtros.nome}%` }); // Corrigido 'nome' para 'nomeSala'
    }

    if (filtros?.capacidade) {
      query = query.andWhere('sala.capacidade >= :capacidade', { capacidade: filtros.capacidade });
    }

    if (filtros?.precoHora) {
      query = query.andWhere('sala.preco <= :precoHora', { precoHora: filtros.precoHora }); // Corrigido 'precoHora' para 'preco'
    }

    if (filtros?.predioId) {
      query = query.andWhere('predio.id = :predioId', { predioId: filtros.predioId });
    }

    if (filtros?.pontosDestaque && filtros.pontosDestaque.length > 0) {
      query = query.andWhere('sala.pontosDeDestaque @> :pontosDestaque', { // Corrigido para 'pontosDeDestaque'
        pontosDestaque: JSON.stringify(filtros.pontosDestaque)
      });
    }

    const salas = await query.getMany();
    return salas.map(sala => this.toSalaResponseDto(sala));
  }

  async buscarSalaPorId(salaId: number): Promise<SalaResponseDto> {
    const sala = await SalaRepository.findOne({
      where: { id: salaId, ativo: true, privado: false },
      relations: ['predio', 'proprietario']
    });

    if (!sala) {
      throw new Error('Sala não encontrada ou não está disponível');
    }

    return this.toSalaResponseDto(sala);
  }

  async buscarSalasPorPontosDestaque(pontosDestaque: string[]): Promise<SalaResponseDto[]> {
    const salas = await SalaRepository.createQueryBuilder('sala')
      .leftJoinAndSelect('sala.predio', 'predio')
      .leftJoinAndSelect('sala.proprietario', 'proprietario')
      .where('sala.ativo = :ativo', { ativo: true })
      .andWhere('sala.privado = :privado', { privado: false }) // Corrigido 'disponivel' para 'privado'
      .andWhere('sala.pontosDeDestaque @> :pontosDestaque', { // Corrigido para 'pontosDeDestaque'
        pontosDestaque: JSON.stringify(pontosDestaque)
      })
      .getMany();

    return salas.map(sala => this.toSalaResponseDto(sala));
  }

  // Consulta de Horários Disponíveis
  async consultarHorariosDisponiveis(consultaDto: ConsultaHorarioDto): Promise<HorarioDisponivelResponseDto[]> {
    const { salaId, data } = consultaDto;

    const sala = await SalaRepository.findOne({
      where: { id: salaId, ativo: true, privado: false }
    });

    if (!sala) {
      throw new Error('Sala não encontrada ou não está disponível');
    }

    const dataConsulta = new Date(data);

    // Buscar reservas existentes para a data
    const reservasExistentes = await ReservaRepository.find({
      where: {
        sala: { id: salaId },
        dataReserva: dataConsulta,
        status: StatusReserva.CONFIRMADO
      }
    });

    // Definir horários padrão de funcionamento (8h às 18h com intervalos de 1h)
    const horariosBase = [
      { horaInicio: '08:00', horaFim: '09:00' },
      { horaInicio: '09:00', horaFim: '10:00' },
      { horaInicio: '10:00', horaFim: '11:00' },
      { horaInicio: '11:00', horaFim: '12:00' },
      { horaInicio: '12:00', horaFim: '13:00' },
      { horaInicio: '13:00', horaFim: '14:00' },
      { horaInicio: '14:00', horaFim: '15:00' },
      { horaInicio: '15:00', horaFim: '16:00' },
      { horaInicio: '16:00', horaFim: '17:00' },
      { horaInicio: '17:00', horaFim: '18:00' },
    ];

    // Filtrar horários disponíveis
    const horariosDisponiveis = horariosBase.map(horario => {
      const disponivel = !reservasExistentes.some(reserva => {
        // Verificar se há conflito de horário
        return (
          (horario.horaInicio >= reserva.horaInicio && horario.horaInicio < reserva.horaFim) ||
          (horario.horaFim > reserva.horaInicio && horario.horaFim <= reserva.horaFim) ||
          (horario.horaInicio <= reserva.horaInicio && horario.horaFim >= reserva.horaFim)
        );
      });

      return {
        horaInicio: horario.horaInicio,
        horaFim: horario.horaFim,
        disponivel
      };
    });

    return horariosDisponiveis;
  }

  // Gerenciamento de Reservas
  async criarReserva(locatarioId: number, createReservaDto: CreateReservaDto): Promise<ReservaResponseDto> {
    const locatario = await LocatarioRepository.findOne({ where: { id: locatarioId } });
    if (!locatario) {
      throw new Error('Locatário não encontrado');
    }

    const sala = await SalaRepository.findOne({
      where: { id: createReservaDto.salaId, ativo: true, privado: false }
    });

    if (!sala) {
      throw new Error('Sala não encontrada ou não está disponível');
    }

    // Verificar se o horário está disponível
    const dataReserva = new Date(createReservaDto.dataReserva);
    const reservasConflitantes = await ReservaRepository.find({
      where: {
        sala: { id: createReservaDto.salaId },
        dataReserva: dataReserva,
        status: StatusReserva.CONFIRMADO
      }
    });

    const temConflito = reservasConflitantes.some(reserva => {
      return (
        (createReservaDto.horaInicio >= reserva.horaInicio && createReservaDto.horaInicio < reserva.horaFim) ||
        (createReservaDto.horaFim > reserva.horaInicio && createReservaDto.horaFim <= reserva.horaFim) ||
        (createReservaDto.horaInicio <= reserva.horaInicio && createReservaDto.horaFim >= reserva.horaFim)
      );
    });

    if (temConflito) {
      throw new Error('Horário não disponível para reserva');
    }

    // Calcular valor total
    const horaInicio = new Date(`1970-01-01T${createReservaDto.horaInicio}`);
    const horaFim = new Date(`1970-01-01T${createReservaDto.horaFim}`);
    const diferencaHoras = (horaFim.getTime() - horaInicio.getTime()) / (1000 * 60 * 60);
    const valorTotal = diferencaHoras * Number(sala.preco);

    const reserva = ReservaRepository.create({
      clienteNome: createReservaDto.clienteNome,
      clienteEmail: createReservaDto.clienteEmail,
      dataReserva: dataReserva,
      horaInicio: createReservaDto.horaInicio,
      horaFim: createReservaDto.horaFim,
      valorTotal: valorTotal,
      observacoes: createReservaDto.observacoes,
      status: StatusReserva.PENDENTE,
      sala,
      locatario
    });

    const savedReserva = await ReservaRepository.save(reserva);
    return this.toReservaResponseDto(savedReserva);
  }

  async buscarMinhasReservas(locatarioId: number, filtros?: ReservaFilterDto): Promise<ReservaResponseDto[]> {
    let query = ReservaRepository.createQueryBuilder('reserva')
      .leftJoinAndSelect('reserva.sala', 'sala')
      .leftJoinAndSelect('reserva.locatario', 'locatario')
      .leftJoinAndSelect('sala.predio', 'predio')
      .where('reserva.locatario.id = :locatarioId', { locatarioId });

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

  async cancelarReserva(locatarioId: number, reservaId: number): Promise<ReservaResponseDto> {
    const reserva = await ReservaRepository.findOne({
      where: {
        id: reservaId,
        locatario: { id: locatarioId }
      },
      relations: ['sala', 'locatario']
    });

    if (!reserva) {
      throw new Error('Reserva não encontrada ou você não tem permissão para cancelá-la');
    }

    if (reserva.status === StatusReserva.CANCELADO) {
      throw new Error('Reserva já está cancelada');
    }

    if (reserva.status === StatusReserva.CONFIRMADO) {
      throw new Error('Não é possível cancelar uma reserva já concluída');
    }

    // Verificar se a reserva pode ser cancelada (ex: 24h de antecedência)
    const agora = new Date();
    const dataHoraReserva = new Date(`${reserva.dataReserva}T${reserva.horaInicio}`);
    const diferencaHoras = (dataHoraReserva.getTime() - agora.getTime()) / (1000 * 60 * 60);

    if (diferencaHoras < 24) {
      throw new Error('Reservas só podem ser canceladas com pelo menos 24 horas de antecedência');
    }

    reserva.status = StatusReserva.CANCELADO;
    const updatedReserva = await ReservaRepository.save(reserva);

    return this.toReservaResponseDto(updatedReserva);
  }

  async buscarReservasPorStatus(locatarioId: number, status: StatusReserva): Promise<ReservaResponseDto[]> {
    const reservas = await ReservaRepository.find({
      where: {
        locatario: { id: locatarioId },
        status: status
      },
      relations: ['sala', 'locatario', 'sala.predio'],
      order: { dataReserva: 'DESC', horaInicio: 'ASC' }
    });

    return reservas.map(reserva => this.toReservaResponseDto(reserva));
  }

  // Métodos auxiliares
  private toSalaResponseDto(sala: Sala): SalaResponseDto {
    return {
      id: sala.id,
      nome: sala.nomeSala,
      descricao: sala.descricao,
      capacidade: sala.capacidade,
      precoHora: sala.preco,
      pontosDestaque: sala.pontosDeDestaque,
      ativo: sala.ativo,
      privado: sala.privado,
      createdAt: sala.createdAt,
      updatedAt: sala.updatedAt,
      predio: sala.predio ? {
        id: sala.predio.id,
        nomePredio: sala.predio.nomePredio,
        endereco: sala.predio.endereco || ''
      } : undefined,
      proprietario: sala.proprietario ? {
        id: sala.proprietario.id,
        nome: sala.proprietario.nome || '',
        email: sala.proprietario.email || ''
      } : undefined,
    };
  }

  private toReservaResponseDto(reserva: Reserva): ReservaResponseDto {
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
        nome: reserva.sala?.nomeSala || ''
      },
      locatario: reserva.locatario ? {
        id: reserva.locatario.id,
        nome: reserva.locatario.nome,
        email: reserva.locatario.email
      } : undefined
    };
  }
}