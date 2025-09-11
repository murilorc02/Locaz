import { PredioRepository } from '../repository/PredioRepository';
import { CreatePredioDto, UpdatePredioDto, PredioResponseDto } from '../dto/PredioDto';
import { Predio } from '../entity/Predio';

export class PredioService {
  async create(createPredioDto: CreatePredioDto): Promise<PredioResponseDto> {
    const predio = PredioRepository.create(createPredioDto);
    const savedPredio = await PredioRepository.save(predio);
    return this.toResponseDto(savedPredio);
  }

  async findAll(): Promise<PredioResponseDto[]> {
    const predios = await PredioRepository.find({ relations: ['salas', 'proprietario'] });
    return predios.map(predio => this.toResponseDto(predio));
  }

  async findOne(id: number): Promise<PredioResponseDto> {
    const predio = await PredioRepository.findOne({ 
      where: { id },
      relations: ['salas', 'proprietario']
    });
    if (!predio) {
      throw new Error('Prédio não encontrado');
    }
    return this.toResponseDto(predio);
  }

  async update(id: number, updatePredioDto: UpdatePredioDto): Promise<PredioResponseDto> {
    const predio = await PredioRepository.findOne({ where: { id } });
    if (!predio) {
      throw new Error('Prédio não encontrado');
    }

    await PredioRepository.update(id, updatePredioDto);
    const updatedPredio = await PredioRepository.findOne({ 
      where: { id },
      relations: ['salas', 'proprietario']
    });
    return this.toResponseDto(updatedPredio!);
  }

  async remove(id: number): Promise<void> {
    const predio = await PredioRepository.findOne({ where: { id } });
    if (!predio) {
      throw new Error('Prédio não encontrado');
    }
    await PredioRepository.remove(predio);
  }

  private toResponseDto(predio: Predio): PredioResponseDto {
    return {
      id: predio.id,
      nomePredio: predio.nomePredio,
      endereco: predio.endereco,
      cidade: predio.cidade,
      estado: predio.estado,
      cep: predio.cep,
      descricao: predio.descricao,
      capacidade: predio.capacidade, 
      categoria: predio.categoria, 
      imagens: predio.imagens,
      comodidades: predio.comodidades, 
      disponivel: predio.disponivel, 
      ativo: predio.ativo,
      privado: predio.privado, 
      createdAt: predio.createdAt,
      updatedAt: predio.updatedAt,
      proprietario: predio.proprietario,
      salas: predio.salas,
      totalSalas: predio.salas?.length || 0,
      totalComodidades: predio.comodidades?.length || 0
    };
  }
}