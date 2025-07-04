import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Predio } from '../entity/Predio';
import { CreatePredioDto } from '../dto/usuario/criar-predio.dto';

export class PredioRepository {
    private ormRepository: Repository<Predio>;

    constructor() {
        this.ormRepository = AppDataSource.getRepository(Predio);
    }

    public salvar = async (dadosPredio: CreatePredioDto, usuarioId: number): Promise<Predio> => {
        const usuario = { id: usuarioId } as any;
        const predio = this.ormRepository.create({ ...dadosPredio, usuario });
        return this.ormRepository.save(predio);
    }

    public buscarPorId = async (id: number): Promise<Predio | null> => {
        return this.ormRepository.findOneBy({ id });
    }

    public buscarPorUsuario = async (usuarioId: number): Promise<Predio[]> => {
        return this.ormRepository.find({
            where: {
                usuario: {
                    id: usuarioId
                }
            },
            relations: ['salas'] 
        });
    }
}