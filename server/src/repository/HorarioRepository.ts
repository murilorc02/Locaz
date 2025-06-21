import { Repository, Between, In } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Horario, StatusHorario } from '../entity/Horario';

export class HorarioRepository {
    private ormRepository: Repository<Horario>;

    constructor() {
        this.ormRepository = AppDataSource.getRepository(Horario);
    }

    public buscarPorId = async (id: number): Promise<Horario | null> => {
        return this.ormRepository.findOneBy({ id });
    }

    /**
     * Busca todos os horários de um usuário específico.
     */
    public buscarDoUsuario = async (usuarioId: number): Promise<Horario[]> => {
        return this.ormRepository.find({
            where: { usuario: { id: usuarioId } },
            relations: ['sala', 'sala.predio'],
        });
    }

    /**
     * Busca os pedidos de reserva pendentes para um locador.
     */
    public buscarPedidosDeReserva = async (locadorId: number): Promise<Horario[]> => {
        return this.ormRepository.find({
            where: {
                sala: { predio: { proprietario: { id: locadorId } } },
                status: StatusHorario.PENDENTE
            },
            relations: ['usuario', 'sala', 'sala.predio'],
        });
    }

    /**
     * Busca horários para uma sala em uma data específica.
     */
    public buscarPorSalaEData = async (salaId: number, inicioDia: Date, fimDia: Date): Promise<Horario[]> => {
        return this.ormRepository.find({
            where: { 
                sala: { id: salaId },
                dataHoraInicio: Between(inicioDia, fimDia),
                status: In([StatusHorario.CONFIRMADO, StatusHorario.PENDENTE])
            },
            relations: ['usuario']
        });
    }

    public salvar = async (horario: Horario): Promise<Horario> => {
        return this.ormRepository.save(horario);
    }
}