import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Reserva, StatusReserva } from '../entity/Reserva';

export class ReservaRepository {
    private repository: Repository<Reserva>;

    constructor() {
        this.repository = AppDataSource.getRepository(Reserva);
    }

    async criar(dadosReserva: Partial<Reserva>): Promise<Reserva> {
        const reserva = this.repository.create(dadosReserva);
        return await this.repository.save(reserva);
    }

    async buscarPorId(id: string): Promise<Reserva | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['locatario', 'sala', 'sala.predio']
        });
    }

    async buscarTodas(): Promise<Reserva[]> {
        return await this.repository.find({
            relations: ['locatario', 'sala', 'sala.predio']
        });
    }

    async buscarPorUsuario(usuarioId: number): Promise<Reserva[]> {
        return await this.repository.find({
            where: { locatario: { id: usuarioId } },
            relations: ['sala', 'sala.predio'],
            order: { dataReserva: 'DESC' }
        });
    }

    async buscarPorSala(salaId: string): Promise<Reserva[]> {
        return await this.repository.find({
            where: { sala: { id: salaId } },
            relations: ['locatario'],
            order: { dataReserva: 'DESC' }
        });
    }

    async buscarPorStatus(status: StatusReserva): Promise<Reserva[]> {
        return await this.repository.find({
            where: { status },
            relations: ['locatario', 'sala', 'sala.predio']
        });
    }

    async atualizar(id: string, dadosAtualizacao: Partial<Reserva>): Promise<Reserva | null> {
        await this.repository.update(id, dadosAtualizacao);
        return await this.buscarPorId(id);
    }

    async excluir(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async verificarConflito(
        salaId: string,
        dataReserva: Date,
        horarioInicio: string,
        horarioFim: string,
        excluirReservaId?: string
    ): Promise<boolean> {
        const queryBuilder = this.repository.createQueryBuilder('reserva')
            .where('reserva.salaId = :salaId', { salaId })
            .andWhere('reserva.dataReserva = :dataReserva', { dataReserva })
            .andWhere('reserva.status IN (:...status)', { 
                status: [StatusReserva.CONFIRMADA, StatusReserva.PENDENTE] 
            })
            .andWhere(`
                (reserva.horarioInicio < :horarioFim AND reserva.horarioFim > :horarioInicio)
            `, { horarioInicio, horarioFim });

        if (excluirReservaId) {
            queryBuilder.andWhere('reserva.id != :excluirId', { excluirId: excluirReservaId });
        }

        const conflitos = await queryBuilder.getCount();
        return conflitos > 0;
    }

    async buscarPorPeriodo(dataInicio: Date, dataFim: Date): Promise<Reserva[]> {
        return await this.repository.createQueryBuilder('reserva')
            .leftJoinAndSelect('reserva.sala', 'sala')
            .leftJoinAndSelect('reserva.locatario', 'locatario')
            .leftJoinAndSelect('sala.predio', 'predio')
            .where('reserva.dataReserva BETWEEN :dataInicio AND :dataFim', {
                dataInicio,
                dataFim
            })
            .orderBy('reserva.dataReserva', 'ASC')
            .getMany();
    }

    async buscarPorProprietario(proprietarioId: number): Promise<Reserva[]> {
        return await this.repository.createQueryBuilder('reserva')
            .leftJoinAndSelect('reserva.sala', 'sala')
            .leftJoinAndSelect('reserva.locatario', 'locatario')
            .leftJoinAndSelect('sala.predio', 'predio')
            .where('predio.usuarioId = :proprietarioId', { proprietarioId })
            .orderBy('reserva.dataReserva', 'DESC')
            .getMany();
    }

    async contarPorStatus(status: StatusReserva): Promise<number> {
        return await this.repository.count({
            where: { status }
        });
    }

    async buscarReservasAtivas(): Promise<Reserva[]> {
        return await this.repository.find({
            where: { 
                status: StatusReserva.CONFIRMADA,
                dataReserva: new Date() 
            },
            relations: ['sala', 'locatario']
        });
    }
}