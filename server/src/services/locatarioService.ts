import { getRepository, Repository } from 'typeorm';
import { Horario, StatusHorario } from '../entity/Horario';
import { Sala } from '../entity/Sala';
import { HttpError } from './usuarioService';
import { HorarioRepository } from '../repository/HorarioRepository';
import { SalaRepository } from '../repository/SalaRepository';

export class LocatarioService {
    private horarioRepository: HorarioRepository;
    private salaRepository: SalaRepository;

    constructor() {
        this.horarioRepository = new HorarioRepository();
        this.salaRepository = new SalaRepository();
    }

    // Encontrar espaço com filtros
    public buscarEspacos = async (filtros: any): Promise<Sala[]> => {
        return this.salaRepository.pesquisar(filtros);
    }

    public obterMeusHorarios = async (usuarioId: number): Promise<Horario[]> => {
        return this.horarioRepository.buscarDoUsuario(usuarioId);
    }

    // Cancelar horario
    public cancelarHorario = async (horarioId: number, usuarioId: number): Promise<void> => {
        const horario = await this.horarioRepository.buscarPorId(horarioId);

        if (!horario || horario.usuario.id !== usuarioId) {
            throw new HttpError(404, 'Horário não encontrado ou não pertence ao usuário.');
        }

        if (horario.status === StatusHorario.CONFIRMADO) {
            const agora = new Date();
            const inicioDoHorario = new Date(horario.dataHoraInicio);

            const diffEmMilissegundos = inicioDoHorario.getTime() - agora.getTime();
            const diffEmHoras = diffEmMilissegundos / (1000 * 60 * 60);

            if (diffEmHoras < 24) {
                throw new HttpError(
                    400, 
                    'Agendamentos confirmados não podem ser cancelados com menos de 24 horas de antecedência.'
                );
            }
        }

        horario.status = StatusHorario.CANCELADO;
        await this.horarioRepository.salvar(horario);
    }
}