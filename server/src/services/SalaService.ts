
import { SalaRepository } from '../repository/SalaRepository';
import { PredioRepository } from '../repository/PredioRepository';
import { EmpresaRepository } from '../repository/EmpresaRepository';
import { ProprietarioRepository } from '../repository/ProprietarioRepository';
import { CreateSalaDto, UpdateSalaDto, SalaResponseDto } from '../dto/SalaDto';
import { Sala } from '../entity/Sala';

export class SalaService {
  async create(createSalaDto: CreateSalaDto): Promise<SalaResponseDto> {
    const predio = await PredioRepository.findOne({ where: { id: createSalaDto.predioId } });
    if (!predio) {
      throw new Error('Prédio não encontrado');
    }

    const sala = SalaRepository.create(createSalaDto);
    sala.predio = predio;

    if (createSalaDto.empresaId) {
      const empresa = await EmpresaRepository.findOne({ where: { id: createSalaDto.empresaId } });
      if (empresa) sala.empresa = empresa;
    }

    if (createSalaDto.proprietarioId) {
      const proprietario = await ProprietarioRepository.findOne({ where: { id: createSalaDto.proprietarioId } });
      if (proprietario) sala.proprietario = proprietario;
    }

    const savedSala = await SalaRepository.save(sala);
    return this.toResponseDto(savedSala);
  }

  async findAll(): Promise<SalaResponseDto[]> {
    const salas = await SalaRepository.find({
      relations: ['predio', 'empresa', 'proprietario']
    });
    return salas.map(sala => this.toResponseDto(sala));
  }

  async findOne(id: number): Promise<SalaResponseDto> {
    const sala = await SalaRepository.findOne({
      where: { id },
      relations: ['predio', 'empresa', 'proprietario']
    });
    if (!sala) {
      throw new Error('Sala não encontrada');
    }
    return this.toResponseDto(sala);
  }

  async update(id: number, updateSalaDto: UpdateSalaDto): Promise<SalaResponseDto> {
    const sala = await SalaRepository.findOne({
      where: { id },
      relations: ['predio', 'empresa', 'proprietario']
    });
    if (!sala) {
      throw new Error('Sala não encontrada');
    }

    Object.assign(sala, updateSalaDto);

    if (updateSalaDto.predioId) {
      const predio = await PredioRepository.findOne({ where: { id: updateSalaDto.predioId } });
      if (predio) sala.predio = predio;
    }

    if (updateSalaDto.empresaId) {
      const empresa = await EmpresaRepository.findOne({ where: { id: updateSalaDto.empresaId } });
      if (empresa) sala.empresa = empresa;
    }

    if (updateSalaDto.proprietarioId) {
      const proprietario = await ProprietarioRepository.findOne({ where: { id: updateSalaDto.proprietarioId } });
      if (proprietario) sala.proprietario = proprietario;
    }

    const updatedSala = await SalaRepository.save(sala);
    return this.toResponseDto(updatedSala);
  }

  async remove(id: number): Promise<void> {
    const sala = await SalaRepository.findOne({ where: { id } });
    if (!sala) {
      throw new Error('Sala não encontrada');
    }
    await SalaRepository.remove(sala);
  }

  private toResponseDto(sala: Sala): SalaResponseDto {
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
        endereco: sala.predio.endereco ?? "",
      } : undefined,
      proprietario: sala.proprietario ? {
        id: sala.proprietario.id,
        nome: sala.proprietario.nome ?? "",
        email: sala.proprietario.email ?? "",
      } : undefined,
      empresaId: sala.empresa?.id,
      imagem: sala.imagem ? sala.imagem[0] : undefined,
    };
  }
}