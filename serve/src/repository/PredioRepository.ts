import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Predio } from '../entity/Predio';
import { CreatePredioDto } from '../dto/usuario/criar-predio.dto';

export class PredioRepository {
    private ormRepository: Repository<Predio>;

    constructor() {
        this.ormRepository = AppDataSource.getRepository(Predio);
    }

    public salvar = async (dadosPredio: CreatePredioDto, proprietarioId: number): Promise<Predio> => {
        const proprietario = { id: proprietarioId } as any;
        const predio = this.ormRepository.create({ ...dadosPredio, proprietario });
        return this.ormRepository.save(predio);
    }

    public buscarPorId = async (id: number): Promise<Predio | null> => {
        return this.ormRepository.findOneBy({ id });
    }
}