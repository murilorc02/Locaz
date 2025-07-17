import { Repository, ILike } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Sala } from '../entity/Sala';
import { createSalaDto } from '../dto/sala/createSala.dto';

export class SalaRepository {
    private ormRepository: Repository<Sala>;

    constructor() {
        this.ormRepository = AppDataSource.getRepository(Sala);
    }

    public buscarPorId = async (id: number): Promise<Sala | null> => {
        return this.ormRepository.findOneBy({ id });
    }

    public salvar = async (dadosSala: createSalaDto, usuarioId: number): Promise<Sala> => {
        const sala = this.ormRepository.create({...dadosSala})
        return this.ormRepository.save(sala)
    }

    public pesquisar = async (filtros: any): Promise<Sala[]> => {
        const { cidade, precoMax, capacidadeMinima } = filtros;
        const query = this.ormRepository.createQueryBuilder('sala')
            .leftJoinAndSelect('sala.predio', 'predio');

        if (cidade) {
            query.where('predio.cidade ILIKE :cidade', { cidade: `%${cidade}%` });
        }
        if (precoMax) {
            query.andWhere('sala.precoPorHora <= :precoMax', { precoMax });
        }
        if (capacidadeMinima) {
            query.andWhere('sala.capacidade >= :capacidadeMinima', { capacidadeMinima });
        }
        
        return query.getMany();
    }
}