import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UsuarioRepository } from '../repository/UsuarioRepository';
import { CriarUsuarioDto } from '../dto/usuario/criar-usuario.dto';
import { AtualizarUsuarioDto } from '../dto/usuario/atualizar-usuario.dto';
import { Usuario } from '../entity/Usuario';
import { config } from '../config'

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
    console.log('=== DEBUG REGISTRO ===');
    console.log('Senha antes do hash:', dados.senha);
    console.log('Tipo da senha:', typeof dados.senha);
    console.log('Length da senha:', dados.senha.length);
    console.log('Bytes da senha:', Buffer.from(dados.senha, 'utf8'));

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dados.senha, saltRounds);
    
    console.log('Hash gerado:', hashedPassword);
    console.log('Tamanho do hash:', hashedPassword.length);

    const testeImediato = await bcrypt.compare(dados.senha, hashedPassword);
    console.log('Teste imediato do hash criado:', testeImediato);

    const usuarioExistente = await this.usuarioRepository.buscarPorEmail(dados.email);

    if (usuarioExistente) {
      throw new HttpError(409, 'Este endereço de e-mail já está em uso.');
    }

    const novoUsuario = new Usuario();
    Object.assign(novoUsuario, dados);
    novoUsuario.senha = hashedPassword;

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
      throw new HttpError(401, 'Credenciais inválidas.');
    }

    const senhasCoincidem = await bcrypt.compare(senhaAtual, usuarioComSenha.senha);
    if (!senhasCoincidem) {
      throw new HttpError(401, 'Credenciais inválidas.');
    }

    const hashNovaSenha = await bcrypt.hash(novaSenha, 10);
    await this.usuarioRepository.atualizar(id, { senha: hashNovaSenha });
  }


  public async validarUsuario(email: string, senhaInserida: string): Promise<any> {
    console.log('=== DEBUG LOGIN DETALHADO ===');
    console.log('Email:', email);
    console.log('Senha inserida:', senhaInserida);
    console.log('Tipo da senha inserida:', typeof senhaInserida);
    console.log('Length da senha inserida:', senhaInserida.length);
    console.log('Bytes da senha inserida:', Buffer.from(senhaInserida, 'utf8'));
    
    const usuario = await this.usuarioRepository.buscarPorEmailComSenha(email);
    
    if (!usuario) {
        console.log('Usuário não encontrado');
        return null;
    }
    
    console.log('Usuário encontrado:', usuario.id);
    console.log('Hash da senha no DB:', usuario.senha);
    console.log('Tamanho do hash:', usuario.senha.length);
    console.log('Tipo do hash:', typeof usuario.senha);
    
    try {
        // Teste 1: Comparação original
        const senhaValida = await bcrypt.compare(senhaInserida, usuario.senha);
        console.log('Resultado da comparação original:', senhaValida);
        
        // Teste 2: Criar um novo hash da mesma senha para comparar
        const novoHash = await bcrypt.hash(senhaInserida, 10);
        console.log('Novo hash criado:', novoHash);
        const testeNovoHash = await bcrypt.compare(senhaInserida, novoHash);
        console.log('Comparação com novo hash:', testeNovoHash);
        
        // Teste 3: Verificar se o hash no DB é válido
        const hashValido = /^\$2[abxy]?\$\d+\$/.test(usuario.senha);
        console.log('Hash no DB é válido (regex):', hashValido);
        
        // Teste 4: Tentar com diferentes encodings da senha
        const senhaUtf8 = Buffer.from(senhaInserida, 'utf8').toString();
        const senhaLatin1 = Buffer.from(senhaInserida, 'latin1').toString();
        
        const testeUtf8 = await bcrypt.compare(senhaUtf8, usuario.senha);
        const testeLatin1 = await bcrypt.compare(senhaLatin1, usuario.senha);
        
        console.log('Teste UTF-8:', testeUtf8);
        console.log('Teste Latin-1:', testeLatin1);
        
        if (senhaValida) {
            const { senha, ...resultado } = usuario;
            return resultado;
        }
        
        return null;
    } catch (error) {
        console.error('Erro no bcrypt:', error);
        throw error;
    }

  }

  public login(usuario: Omit<Usuario, 'senha'>): { access_token: string } {
    const payload = { sub: usuario.id, email: usuario.email, tipo: usuario.tipo };

    if (!config.jwtSecret) {
      throw new Error("secret não configurada no env");
    }
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1d' });

    return {
      access_token: token,
    };
  }
}
