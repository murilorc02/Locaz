import { getRepository, Repository, In, Between } from 'typeorm';
import { Predio } from '../entity/Predio';
import { Horario, StatusHorario } from '../entity/Horario';
import { Sala } from '../entity/Sala';
import { CreatePredioDto } from '../dto/usuario/criar-predio.dto';
import { HttpError } from './usuarioService';
import { AppDataSource } from '../data-source';
import { PredioRepository } from '../repository/PredioRepository';
import { HorarioRepository } from '../repository/HorarioRepository';
import { SalaRepository } from '../repository/SalaRepository';

export class LocadorService {
    private predioRepository: PredioRepository
    private horarioRepository: HorarioRepository
    private salaRepository: SalaRepository

    constructor() {
        this.predioRepository = new PredioRepository();
        this.salaRepository = new SalaRepository();
        this.horarioRepository = new HorarioRepository();
    }

    public criarPredio = async (dados: CreatePredioDto, proprietarioId: number): Promise<Predio> => {
        return this.predioRepository.salvar(dados, proprietarioId);
    }

    public obterPrediosPorProprietario = async (proprietarioId: number): Promise<Predio[]> => {
        return this.predioRepository.buscarPorProprietario(proprietarioId);
    }

    public obterPedidosDeReserva = async (locadorId: number): Promise<Horario[]> => {
        return this.horarioRepository.buscarPedidosDeReserva(locadorId);
    }

    public obterAgendaPorEspaco = async (espacoId: number, dataDesejada?: string): Promise<any> => {
        const sala = await this.salaRepository.buscarPorId(espacoId);
        if (!sala) {
            throw new HttpError(404, 'Espaço não encontrado');
        }

        const data = dataDesejada ? new Date(dataDesejada) : new Date();
        data.setUTCHours(0, 0, 0, 0);
        const inicioDia = data;
        const fimDia = new Date(data);
        fimDia.setUTCHours(23, 59, 59, 999);
        
        // Chamando o método específico para buscar por sala e data.
        const horariosReservados = await this.horarioRepository.buscarPorSalaEData(espacoId, inicioDia, fimDia);
        
        const horasOcupadas = new Set<number>();
        horariosReservados.forEach((reserva: Horario) => {
            const horaInicio = new Date(reserva.dataHoraInicio).getUTCHours();
            const horaFim = new Date(reserva.dataHoraFim).getUTCHours();
            for (let i = horaInicio; i < horaFim; i++) {
                horasOcupadas.add(i);
            }
        });

        const horariosPadrao = Array.from({ length: 10 }, (_, i) => i + 8);

        const agenda = horariosPadrao.map(hora => {
            const status = horasOcupadas.has(hora) ? 'Reservado' : 'Disponível';
            const reservaInfo = status === 'Reservado' 
                ? horariosReservados.find((r: Horario) => new Date(r.dataHoraInicio).getUTCHours() === hora) 
                : null;

            return {
                horario: `${hora.toString().padStart(2, '0')}:00 - ${(hora + 1).toString().padStart(2, '0')}:00`,
                status: status,
                cliente: reservaInfo && reservaInfo.usuario ? reservaInfo.usuario.nome : null,
            };
        });
        
        return { sala, agenda };
    }
}