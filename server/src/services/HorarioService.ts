import { HorarioRepository } from '../repository/HorarioRepository';
import { SalaRepository } from '../repository/SalaRepository';
import { CreateHorarioDto, UpdateHorarioDto, HorarioResponseDto } from '../dto/HorarioDto';
import { Horario } from '../entity/Horario';

export class HorarioService {
  async create(createHorarioDto: CreateHorarioDto): Promise<HorarioResponseDto> {
    const sala = await SalaRepository.findOne({ where: { id: createHorarioDto.salaId } });
    if (!sala) {
      throw new Error('Sala não encontrada');
    }

    const horario = HorarioRepository.create(createHorarioDto);
    horario.sala = sala;

    const savedHorario = await HorarioRepository.save(horario);
    return this.toResponseDto(savedHorario);
  }

  async findAll(): Promise<HorarioResponseDto[]> {
    const horarios = await HorarioRepository.find({
      relations: ['sala']
    });
    return horarios.map(horario => this.toResponseDto(horario));
  }

  async findOne(id: number): Promise<HorarioResponseDto> {
    const horario = await HorarioRepository.findOne({ 
      where: { id },
      relations: ['sala']
    });
    if (!horario) {
      throw new Error('Horário não encontrado');
    }
    return this.toResponseDto(horario);
  }

  async update(id: number, updateHorarioDto: UpdateHorarioDto): Promise<HorarioResponseDto> {
    const horario = await HorarioRepository.findOne({ 
      where: { id },
      relations: ['sala']
    });
    if (!horario) {
      throw new Error('Horário não encontrado');
    }

    Object.assign(horario, updateHorarioDto);

    if (updateHorarioDto.salaId) {
      const sala = await SalaRepository.findOne({ where: { id: updateHorarioDto.salaId } });
      if (sala) horario.sala = sala;
    }

    const updatedHorario = await HorarioRepository.save(horario);
    return this.toResponseDto(updatedHorario);
  }

  async remove(id: number): Promise<void> {
    const horario = await HorarioRepository.findOne({ where: { id } });
    if (!horario) {
      throw new Error('Horário não encontrado');
    }
    await HorarioRepository.remove(horario);
  }

  private toResponseDto(horario: Horario): HorarioResponseDto {
    return {
      id: horario.id,
      inicioPeriodo: horario.inicioPeriodo,
      fimPeriodo: horario.fimPeriodo,
      disponivel: horario.disponivel,
      sala: horario.sala
    };
  }
}