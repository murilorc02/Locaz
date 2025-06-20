import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UsuarioRepository } from '../repository/UsuarioRepository';
import { CriarUsuarioDto } from '../dto/usuario/criar-usuario.dto';
import { AtualizarUsuarioDto } from '../dto/usuario/atualizar-usuario.dto';
import { Usuario } from '../entity/Usuario';

export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export class UsuarioService {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  public async criar(dados: CriarUsuarioDto): Promise<Omit<Usuario, 'senha'>> {
    const usuarioExistente = await this.usuarioRepository.buscarPorEmail(dados.email);
    if (usuarioExistente) {
      throw new HttpError(409, 'Um usuário com este email já existe.');
    }

    const novoUsuario = new Usuario();
    Object.assign(novoUsuario, dados); 

    const usuarioSalvo = await this.usuarioRepository.salvar(novoUsuario);

    const { senha, ...resultado } = usuarioSalvo;
    return resultado;
  }

  public async buscarPorId(id: number): Promise<Omit<Usuario, 'senha'>> {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new HttpError(404, `Usuário com ID ${id} não encontrado.`);
    }
    const { senha, ...resultado } = usuario;
    return resultado;
  }

  public async atualizar(id: number, dados: AtualizarUsuarioDto): Promise<Omit<Usuario, 'senha'>> {
    await this.buscarPorId(id);
    await this.usuarioRepository.atualizar(id, dados);
    return this.buscarPorId(id);
  }

  public async atualizarSenha(id: number, senhaAtual: string, novaSenha: string): Promise<void> {
    const usuarioComSenha = await this.usuarioRepository.buscarPorIdComSenha(id);
    if (!usuarioComSenha) {
      throw new HttpError(404, 'Usuário não encontrado.');
    }

    const senhasCoincidem = await bcrypt.compare(senhaAtual, usuarioComSenha.senha);
    if (!senhasCoincidem) {
      throw new HttpError(401, 'A senha atual está incorreta.');
    }

    const hashNovaSenha = await bcrypt.hash(novaSenha, 10);
    await this.usuarioRepository.atualizar(id, { senha: hashNovaSenha });
  }


  public async validarUsuario(email: string, senhaInserida: string): Promise<Omit<Usuario, 'senha'> | null> {
    const usuario = await this.usuarioRepository.buscarPorEmailComSenha(email);
    if (!usuario) {
        return null;
    }

    const senhaValida = await bcrypt.compare(senhaInserida, usuario.senha);
    if (senhaValida) {
        const { senha, ...resultado } = usuario;
        return resultado;
    }

    return null;
  }

  public login(usuario: Omit<Usuario, 'senha'>): { access_token: string } {
    const payload = { sub: usuario.id, email: usuario.email, tipo: usuario.tipo };
    const segredo = process.env.JWT_SECRET || 'naosei';

    const token = jwt.sign(payload, segredo, { expiresIn: '1d' });

    return {
        access_token: token,
    };
  }
}