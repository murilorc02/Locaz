import { Repository } from 'typeorm';
import { Usuario, TipoUsuario } from '../entity/Usuario';
import { AppDataSource } from '../data-source';

export class UsuarioRepository {
    private ormRepository: Repository<Usuario>;

    constructor() {
        this.ormRepository = AppDataSource.getRepository(Usuario);
    }

    public salvar = async (usuario: Usuario): Promise<Usuario> => {
        return this.ormRepository.save(usuario);
    }

    public async buscarPorId(id: number): Promise<Usuario | null> {
        return this.ormRepository.findOne({
            where: { id, ativo: true }
        });
    }

    public buscarPorEmail = async (email: string): Promise<Usuario | null> => {
        return this.ormRepository.findOne({ where: { email } });
    }

    public buscarProprietarios = async (): Promise<Usuario[]> => {
        return this.ormRepository.find({ where: { tipo: TipoUsuario.PROPRIETARIO } });
    }

    public buscarLocatarios = async (): Promise<Usuario[]> => {
        return this.ormRepository.find({ where: { tipo: TipoUsuario.LOCATARIO } });
    }

    public async buscarPorIdComSenha(id: number): Promise<Usuario | null> {
        return this.ormRepository.findOne({
            where: { id: id },
            select: ['id', 'nome', 'email', 'senha', 'cpf', 'telefone', 'tipo', 'ativo']
        });
    }

    public async buscarPorEmailComSenha(email: string): Promise<Usuario | null> {
        return this.ormRepository.findOne({
            where: { email: email},
            //select: ['id', 'nome', 'email', 'senha', 'cpf', 'telefone', 'tipo', 'createdAt', 'updatedAt']
        });
    }

    public atualizar = async (id: number, dados: Partial<Usuario>): Promise<void> => {
        await this.ormRepository.update(id, dados);
    }

    public findByEmail = async (email: string): Promise<Usuario | null> => {
        return this.ormRepository.findOne({ where: { email } });
    }

    public findAtivos = async (): Promise<Usuario[]> => {
        return this.ormRepository.find({ where: { ativo: true } });
    }

    public findOne = async (options: any): Promise<Usuario | null> => {
        // Se options.where tiver ativo, remova
        if (options.where && options.where.ativo) {
            delete options.where.ativo;
        }
        return this.ormRepository.findOne(options);
    }

    public update = async (id: number, dados: Partial<Usuario>): Promise<void> => {
        await this.ormRepository.update(id, dados);
    }

    public create = (dados: Partial<Usuario>): Usuario => {
        return this.ormRepository.create(dados);
    }

    public save = async (usuario: Usuario): Promise<Usuario> => {
        return this.ormRepository.save(usuario);
    }
}

// Exporte uma instância para uso nos services
export const usuarioRepositoryInstance = new UsuarioRepository();