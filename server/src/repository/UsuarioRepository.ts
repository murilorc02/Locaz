import { getRepository, Repository } from 'typeorm';
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

    public buscarPorId = async (id: number): Promise<Usuario | null> => {
        return this.ormRepository.findOneBy({ id });
    }

    public buscarPorEmail = async (email: string): Promise<Usuario | null> => {
        return this.ormRepository.findOne({ where: { email } });
    }

    public buscarLocadores = async (): Promise<Usuario[]> => {
        return this.ormRepository.find({ where: { tipo: TipoUsuario.LOCADOR } });
    }

    public buscarLocatarios = async (): Promise<Usuario[]> => {
        return this.ormRepository.find({ where: { tipo: TipoUsuario.LOCATARIO } });
    }

    public buscarPorIdComSenha = async (id: number): Promise<Usuario | null> => {
        return this.ormRepository.findOne({
            where: { id },
            select: ['id', 'nome', 'email', 'cpf', 'telefone', 'tipo', 'senha']
        });
    }

    public buscarPorEmailComSenha = async (email: string): Promise<Usuario | null> => {
        return this.ormRepository.findOne({
            where: { email },
            select: ['id', 'nome', 'email', 'cpf', 'telefone', 'tipo', 'senha']
        });
    }

    public atualizar = async (id: number, dados: Partial<Usuario>): Promise<void> => {
        await this.ormRepository.update(id, dados);
    }

}