import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { CategoriaSala, Sala } from '../entity/Sala';

export class SalaRepository {
    private repository: Repository<Sala>;

    constructor() {
        this.repository = AppDataSource.getRepository(Sala);
    }

    async criar(dadosSala: Partial<Sala>): Promise<Sala> {
        const sala = this.repository.create(dadosSala);
        return await this.repository.save(sala);
    }

    async buscarPorId(id: number): Promise<Sala | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['predio', 'predio.usuario']
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

    async buscarPorPredio(predioId: number): Promise<Sala[]> {
        return await this.repository.find({
            where: {
                predio: {
                    id: predioId
                } as any
            },
            relations: ['reservas'],
            order: {
                nome: 'ASC'
            }
        });
    }

    async buscarPorNomeEPredio(nome: string, predioId: number): Promise<Sala | null> {
        return await this.repository.findOne({
            where: {
                nome: nome,
                predio: {
                    id: predioId
                } as any
            },
            relations: ['predio']
        });
    }

    async atualizar(id: number, dadosAtualizacao: Partial<Sala>): Promise<void> {
        await this.repository.update(id, dadosAtualizacao);
    }

    async excluir(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async buscarComFiltros(filtros: {
        nome?: string;
        cidade?: string;
        estado?: string;
        capacidade?: number;
        categoria?: string;
        precoMinimo?: number;
        precoMaximo?: number;
        comodidades?: string[];
        predioId?: number;
        ids?: number[];
        ordenarPor?: 'preco' | 'capacidade' | 'nome';
        ordem?: 'ASC' | 'DESC';
    }): Promise<Sala[]> {
        const queryBuilder = this.repository.createQueryBuilder('sala')
            .leftJoinAndSelect('sala.predio', 'predio')
            .leftJoinAndSelect('predio.usuario', 'usuario');

        if (filtros.ids && filtros.ids.length > 0) {
            queryBuilder.andWhere('sala.id IN (:...ids)', { ids: filtros.ids });
        }

        if (filtros.nome) {
            queryBuilder.andWhere('(LOWER(sala.nome) LIKE LOWER(:nome) OR LOWER(sala.descricao) LIKE LOWER(:nome))', {
                nome: `%${filtros.nome}%`
            });
        }

        if (filtros.cidade) {
            queryBuilder.andWhere('LOWER(predio.cidade) LIKE LOWER(:cidade)', {
                cidade: `%${filtros.cidade}%`
            });
        }
        
        if (filtros.estado) {
            queryBuilder.andWhere('LOWER(predio.estado) LIKE LOWER(:estado)', {
                estado: `%${filtros.estado}%`
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

        if (filtros.precoMinimo !== undefined) {
            queryBuilder.andWhere('sala.precoHora >= :precoMinimo', {
                precoMinimo: filtros.precoMinimo
            });
        }

        if (filtros.precoMaximo) {
            queryBuilder.andWhere('sala.precoHora <= :precoMaximo', {
                precoMaximo: filtros.precoMaximo
            });
        }

        if (filtros.predioId) {
            queryBuilder.andWhere('predio.id = :predioId', {
                predioId: filtros.predioId
            });
        }

        if (filtros.comodidades && filtros.comodidades.length > 0) {
            queryBuilder.andWhere('sala.comodidades && :comodidades', {
                comodidades: filtros.comodidades
            });
        }

        const ordenarPor = filtros.ordenarPor || 'nome';
        const ordem = filtros.ordem || 'ASC';

        switch (ordenarPor) {
            case 'preco':
                queryBuilder.orderBy('sala.precoHora', ordem);
                break;
            case 'capacidade':
                queryBuilder.orderBy('sala.capacidade', ordem);
                break;
            case 'nome':
            default:
                queryBuilder.orderBy('sala.nome', ordem);
                break;
        }

        return await queryBuilder.getMany();
    }

    async buscarDisponiveis(
        dataReserva: Date,
        horarioInicio: string,
        horarioFim: string,
        filtrosAdicionais?: {
            nome?: string;
            cidade?: string;
            capacidade?: number;
            categoria?: string;
            precoMinimo?: number;
            precoMaximo?: number;
            comodidades?: string[];
            predioId?: number;
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

        if (filtrosAdicionais?.nome) {
            queryBuilder.andWhere('(LOWER(sala.nome) LIKE LOWER(:nome) OR LOWER(sala.descricao) LIKE LOWER(:nome))', {
                nome: `%${filtrosAdicionais.nome}%`
            });
        }

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

        if (filtrosAdicionais?.precoMinimo !== undefined) {
            queryBuilder.andWhere('sala.precoHora >= :precoMinimo', {
                precoMinimo: filtrosAdicionais.precoMinimo
            });
        }

        if (filtrosAdicionais?.precoMaximo) {
            queryBuilder.andWhere('sala.precoHora <= :precoMaximo', {
                precoMaximo: filtrosAdicionais.precoMaximo
            });
        }

        if (filtrosAdicionais?.predioId) {
            queryBuilder.andWhere('predio.id = :predioId', {
                predioId: filtrosAdicionais.predioId
            });
        }

        if (filtrosAdicionais?.comodidades && filtrosAdicionais.comodidades.length > 0) {
            queryBuilder.andWhere('sala.comodidades && :comodidades', {
                comodidades: filtrosAdicionais.comodidades
            });
        }

        return await queryBuilder
            .orderBy('sala.nome', 'ASC')
            .getMany();
    }

    async verificarDisponibilidade(
        salaId: number,
        dataReserva: Date,
        horarioInicio: string,
        horarioFim: string,
        excluirReservaId?: number
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

    async contarPorPredio(predioId: number): Promise<number> {
        return await this.repository.createQueryBuilder('sala')
            .where('sala.predio.id = :predioId', { predioId })
            .getCount();
    }

    async contarReservasAtivas(salaId: number): Promise<number> {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        return await this.repository.createQueryBuilder('sala')
            .leftJoin('sala.reservas', 'reserva')
            .where('sala.id = :salaId', { salaId })
            .andWhere('reserva.status IN (:...status)', { status: ['confirmada', 'pendente'] })
            .andWhere('reserva.dataReserva >= :hoje', { hoje: hoje.toISOString().split('T')[0] })
            .getCount();
    }

    async buscarPorCategoria(categoria: CategoriaSala): Promise<Sala[]> {
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
            .where('sala.precoHora >= :precoMin', { precoMin })
            .andWhere('sala.precoHora <= :precoMax', { precoMax })
            .orderBy('sala.precoHora', 'ASC')
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

    async obterComodidadesDisponiveis(): Promise<string[]> {
        const salas = await this.buscarTodas();
        const comodidadesSet = new Set<string>();

        salas.forEach(sala => {
            if (sala.comodidades) {
                sala.comodidades.forEach(comodidade => {
                    comodidadesSet.add(comodidade);
                });
            }
        });

        return Array.from(comodidadesSet).sort();
    }

    async obterCategoriasDisponiveis(): Promise<string[]> {
        const result = await this.repository
            .createQueryBuilder('sala')
            .select('DISTINCT sala.categoria', 'categoria')
            .getRawMany();

        return result.map(r => r.categoria).filter(Boolean).sort();
    }

    async obterEstatisticas(): Promise<{
        totalSalas: number;
        porCategoria: Array<{ categoria: string; total: number }>;
        capacidadeMedia: number;
        precoMedio: number;
    }> {
        const totalSalas = await this.repository.count();

        const porCategoria = await this.repository
            .createQueryBuilder('sala')
            .select('sala.categoria', 'categoria')
            .addSelect('COUNT(*)', 'total')
            .groupBy('sala.categoria')
            .getRawMany()
            .then(results => results.map(r => ({
                categoria: r.categoria,
                total: parseInt(r.total)
            })));

        const { capacidadeMedia, precoMedio } = await this.repository
            .createQueryBuilder('sala')
            .select('AVG(sala.capacidade)', 'capacidadeMedia')
            .addSelect('AVG(sala.precoHora)', 'precoMedio')
            .getRawOne();

        return {
            totalSalas,
            porCategoria,
            capacidadeMedia: Math.round(parseFloat(capacidadeMedia || '0')),
            precoMedio: parseFloat(precoMedio || '0')
        };
    }

    async buscarReservasPorSalaEData(salaId: number, dataReserva: string): Promise<Sala | null> {
        return await this.repository
            .createQueryBuilder('sala')
            .leftJoinAndSelect('sala.reservas', 'reserva')
            .where('sala.id = :salaId', { salaId })
            .andWhere('reserva.dataReserva = :dataReserva', { dataReserva })
            .andWhere('reserva.status IN (:...status)', { status: ['confirmada', 'pendente'] })
            .getOne();
    }
}