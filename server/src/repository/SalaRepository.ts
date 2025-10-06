import { Repository, In } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Sala } from '../entity/Sala';

export class SalaRepository {
    private repository: Repository<Sala>;

    constructor() {
        this.repository = AppDataSource.getRepository(Sala);
    }

    async criar(dadosSala: Partial<Sala>): Promise<Sala> {
        const sala = this.repository.create(dadosSala);
        return await this.repository.save(sala);
    }

    async buscarPorId(id: string): Promise<Sala | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['predio', 'predio.usuario', 'reservas', 'horarioSala']
        });
    }

    async buscarTodas(): Promise<Sala[]> {
        return await this.repository.find({
            relations: ['predio', 'predio.usuario', 'reservas'],
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async buscarPorPredio(predioId: string): Promise<Sala[]> {
        return await this.repository.find({
            where: { predio: { id: predioId } },
            relations: ['reservas'],
            order: {
                nome: 'ASC'
            }
        });
    }

    async buscarPorNomeEPredio(nome: string, predioId: string): Promise<Sala | null> {
        return await this.repository.findOne({
            where: { 
                nome,
                predio: { id: predioId }
            },
            relations: ['predio']
        });
    }

    async atualizar(id: string, dadosAtualizacao: Partial<Sala>): Promise<void> {
        await this.repository.update(id, dadosAtualizacao);
    }

    async excluir(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async buscarComFiltros(filtros: {
        cidade?: string;
        capacidade?: number;
        categoria?: string;
        precoMaximo?: number;
        comodidades?: string[];
        predioId?: string;
        ids?: string[];
    }): Promise<Sala[]> {
        const queryBuilder = this.repository.createQueryBuilder('sala')
            .leftJoinAndSelect('sala.predio', 'predio')
            .leftJoinAndSelect('predio.usuario', 'usuario');

        if (filtros.ids && filtros.ids.length > 0) {
            queryBuilder.andWhere('sala.id IN (:...ids)', { ids: filtros.ids });
        }

        if (filtros.cidade) {
            queryBuilder.andWhere('LOWER(predio.cidade) LIKE LOWER(:cidade)', { 
                cidade: `%${filtros.cidade}%` 
            });
        }

        if (filtros.capacidade) {
            queryBuilder.andWhere('sala.capacidade >= :capacidade', { 
                capacidade: filtros.capacidade 
            });
        }

        if (filtros.categoria) {
            queryBuilder.andWhere('sala.categoria = :categoria', { 
                categoria: filtros.categoria 
            });
        }

        if (filtros.precoMaximo) {
            queryBuilder.andWhere('sala.preco_hora <= :precoMaximo', { 
                precoMaximo: filtros.precoMaximo 
            });
        }

        if (filtros.predioId) {
            queryBuilder.andWhere('predio.id = :predioId', { 
                predioId: filtros.predioId 
            });
        }

        if (filtros.comodidades && filtros.comodidades.length > 0) {
            // Para PostgreSQL com arrays de enum
            queryBuilder.andWhere('sala.comodidades && :comodidades', {
                comodidades: filtros.comodidades
            });
        }

        return await queryBuilder
            .orderBy('sala.nome', 'ASC')
            .getMany();
    }

    async buscarDisponiveis(
        dataReserva: Date, 
        horarioInicio: string, 
        horarioFim: string,
        filtrosAdicionais?: {
            cidade?: string;
            capacidade?: number;
            categoria?: string;
            precoMaximo?: number;
        }
    ): Promise<Sala[]> {
        const queryBuilder = this.repository.createQueryBuilder('sala')
            .leftJoinAndSelect('sala.predio', 'predio')
            .leftJoinAndSelect('predio.usuario', 'usuario')
            .leftJoin('sala.reservas', 'reserva', 
                `reserva.dataReserva = :dataReserva 
                AND reserva.status IN ('confirmada', 'pendente')
                AND (
                    (reserva.horarioInicio <= :horarioInicio AND reserva.horarioFim > :horarioInicio) OR
                    (reserva.horarioInicio < :horarioFim AND reserva.horarioFim >= :horarioFim) OR
                    (reserva.horarioInicio >= :horarioInicio AND reserva.horarioFim <= :horarioFim)
                )`,
                { 
                    dataReserva: dataReserva.toISOString().split('T')[0], 
                    horarioInicio, 
                    horarioFim 
                }
            )
            .where('reserva.id IS NULL');

        // Aplicar filtros adicionais se fornecidos
        if (filtrosAdicionais?.cidade) {
            queryBuilder.andWhere('LOWER(predio.cidade) LIKE LOWER(:cidade)', {
                cidade: `%${filtrosAdicionais.cidade}%`
            });
        }

        if (filtrosAdicionais?.capacidade) {
            queryBuilder.andWhere('sala.capacidade >= :capacidade', {
                capacidade: filtrosAdicionais.capacidade
            });
        }

        if (filtrosAdicionais?.categoria) {
            queryBuilder.andWhere('sala.categoria = :categoria', {
                categoria: filtrosAdicionais.categoria
            });
        }

        if (filtrosAdicionais?.precoMaximo) {
            queryBuilder.andWhere('sala.preco_hora <= :precoMaximo', {
                precoMaximo: filtrosAdicionais.precoMaximo
            });
        }

        return await queryBuilder
            .orderBy('sala.nome', 'ASC')
            .getMany();
    }

    async verificarDisponibilidade(
        salaId: string,
        dataReserva: Date,
        horarioInicio: string,
        horarioFim: string,
        excluirReservaId?: string
    ): Promise<boolean> {
        const queryBuilder = this.repository.createQueryBuilder('sala')
            .leftJoin('sala.reservas', 'reserva')
            .where('sala.id = :salaId', { salaId })
            .andWhere('reserva.dataReserva = :dataReserva', { 
                dataReserva: dataReserva.toISOString().split('T')[0] 
            })
            .andWhere('reserva.status IN (:...status)', { status: ['confirmada', 'pendente'] })
            .andWhere(`(
                (reserva.horarioInicio <= :horarioInicio AND reserva.horarioFim > :horarioInicio) OR
                (reserva.horarioInicio < :horarioFim AND reserva.horarioFim >= :horarioFim) OR
                (reserva.horarioInicio >= :horarioInicio AND reserva.horarioFim <= :horarioFim)
            )`, { horarioInicio, horarioFim });

        if (excluirReservaId) {
            queryBuilder.andWhere('reserva.id != :excluirReservaId', { excluirReservaId });
        }

        const conflitos = await queryBuilder.getCount();
        return conflitos === 0;
    }

    async contarPorPredio(predioId: string): Promise<number> {
        return await this.repository.count({
            where: { predio: { id: predioId } }
        });
    }

    async contarReservasAtivas(salaId: string): Promise<number> {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        return await this.repository.createQueryBuilder('sala')
            .leftJoin('sala.reservas', 'reserva')
            .where('sala.id = :salaId', { salaId })
            .andWhere('reserva.status IN (:...status)', { status: ['confirmada', 'pendente'] })
            .andWhere('reserva.dataReserva >= :hoje', { hoje: hoje.toISOString().split('T')[0] })
            .getCount();
    }

    async buscarPorCategoria(categoria: string): Promise<Sala[]> {
        return await this.repository.find({
            where: { categoria },
            relations: ['predio', 'predio.usuario'],
            order: {
                nome: 'ASC'
            }
        });
    }

    async buscarPorComodidades(comodidades: string[]): Promise<Sala[]> {
        return await this.repository.createQueryBuilder('sala')
            .leftJoinAndSelect('sala.predio', 'predio')
            .where('sala.comodidades && :comodidades', { comodidades })
            .orderBy('sala.nome', 'ASC')
            .getMany();
    }

    async buscarMaisReservadas(limite: number = 10): Promise<Sala[]> {
        return await this.repository.createQueryBuilder('sala')
            .leftJoinAndSelect('sala.predio', 'predio')
            .leftJoin('sala.reservas', 'reserva')
            .groupBy('sala.id, predio.id')
            .orderBy('COUNT(reserva.id)', 'DESC')
            .limit(limite)
            .getMany();
    }

    async buscarPorFaixaPreco(precoMin: number, precoMax: number): Promise<Sala[]> {
        return await this.repository.createQueryBuilder('sala')
            .leftJoinAndSelect('sala.predio', 'predio')
            .where('sala.preco_hora >= :precoMin', { precoMin })
            .andWhere('sala.preco_hora <= :precoMax', { precoMax })
            .orderBy('sala.preco_hora', 'ASC')
            .getMany();
    }

    async estatisticasPorCategoria(): Promise<Array<{ categoria: string; total: number }>> {
        const result = await this.repository.createQueryBuilder('sala')
            .select('sala.categoria', 'categoria')
            .addSelect('COUNT(*)', 'total')
            .groupBy('sala.categoria')
            .getRawMany();

        return result.map(item => ({
            categoria: item.categoria,
            total: parseInt(item.total)
        }));
    }
}