import { EmpresaRepository } from '../repository/EmpresaRepository';
import { CreateEmpresaDto, UpdateEmpresaDto, EmpresaResponseDto } from '../dto/EmpresaDto';
import { Empresa } from '../entity/Empresa';

export class EmpresaService {
  async create(createEmpresaDto: CreateEmpresaDto): Promise<EmpresaResponseDto> {
    const empresa = EmpresaRepository.create(createEmpresaDto);
    const savedEmpresa = await EmpresaRepository.save(empresa);
    return this.toResponseDto(savedEmpresa);
  }

  async findAll(): Promise<EmpresaResponseDto[]> {
    const empresas = await EmpresaRepository.find();
    return empresas.map(empresa => this.toResponseDto(empresa));
  }

  async findOne(id: number): Promise<EmpresaResponseDto> {
    const empresa = await EmpresaRepository.findOne({ where: { id } });
    if (!empresa) {
      throw new Error('Empresa não encontrada');
    }
    return this.toResponseDto(empresa);
  }

  async update(id: number, updateEmpresaDto: UpdateEmpresaDto): Promise<EmpresaResponseDto> {
    const empresa = await EmpresaRepository.findOne({ where: { id } });
    if (!empresa) {
      throw new Error('Empresa não encontrada');
    }

    await EmpresaRepository.update(id, updateEmpresaDto);
    const updatedEmpresa = await EmpresaRepository.findOne({ where: { id } });
    return this.toResponseDto(updatedEmpresa!);
  }

  async remove(id: number): Promise<void> {
    const empresa = await EmpresaRepository.findOne({ where: { id } });
    if (!empresa) {
      throw new Error('Empresa não encontrada');
    }
    await EmpresaRepository.remove(empresa);
  }

  private toResponseDto(empresa: Empresa): EmpresaResponseDto {
    return {
      id: empresa.id,
      nome: empresa.nome,
      localizacao: empresa.localizacao
    };
  }
}