import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { usuarioRepositoryInstance } from '../repository/UsuarioRepository';
import { CreateUsuarioDto, UsuarioResponseDto } from '../dto/UsuarioDto';
import { TipoUsuario } from '../entity/Usuario';

export class HttpError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

export class UsuarioService {
  async criar(createUsuarioDto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    // Verificar se o email já existe
    const usuarioExistente = await usuarioRepositoryInstance.findByEmail(createUsuarioDto.email);
    if (usuarioExistente) {
      throw new Error('Email já está em uso');
    }

    // Validar senha antes de criptografar
    if (!createUsuarioDto.senha || createUsuarioDto.senha.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    // Criptografar a senha com salt consistente
    const senhaHash = await bcrypt.hash(createUsuarioDto.senha.trim(), 12); // Salt 12 para mais segurança

    // Criar usuário
    const novoUsuario = usuarioRepositoryInstance.create({
      nome: createUsuarioDto.nome,
      email: createUsuarioDto.email, // Normalizar email
      senha: senhaHash,
      cpf: createUsuarioDto.cpf,
      telefone: createUsuarioDto.telefone,
      tipo: createUsuarioDto.tipo as TipoUsuario,
      ativo: true
    });

    const usuarioSalvo = await usuarioRepositoryInstance.save(novoUsuario);
    return this.toUsuarioResponseDto(usuarioSalvo);
  }

  async validarUsuario(email: string, senha: string): Promise<any | null> {

    const usuario = await usuarioRepositoryInstance.buscarPorEmailComSenha(email);


    if (!usuario) {
      return null;
    }

    if (!usuario.senha) {
      return null;
    }

    // Teste bcrypt detalhado
    try {
      const novoHash = await bcrypt.hash(senha, 10);
      const testeNovoHash = await bcrypt.compare(senha, novoHash);

      if (!novoHash) {
        return null;
      }

      return usuario;

    } catch (error) {
      return null;
    }
  }


  login(usuario: any): { token: string; user: UsuarioResponseDto } {
    const segredo = process.env.JWT_SECRET || 'naoseinaoseinaoseinaoseinaoseinaoseinaoseinaosei';

    const payload = {
      sub: usuario.id.toString(),
      email: usuario.email,
      tipo: usuario.tipo, // Mudado de tipo para funcao
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };

    const token = jwt.sign(payload, segredo);

    return {
      token,
      user: this.toUsuarioResponseDto(usuario)
    };
  }

  async buscarPorId(id: number): Promise<UsuarioResponseDto> {
    const usuario = await usuarioRepositoryInstance.findOne({ where: { id, ativo: true } });
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    return this.toUsuarioResponseDto(usuario);
  }

  async atualizar(id: number, dadosAtualizacao: any): Promise<UsuarioResponseDto> {
    const usuario = await usuarioRepositoryInstance.findOne({ where: { id, ativo: true } });
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    await usuarioRepositoryInstance.update(id, dadosAtualizacao);
    const usuarioAtualizado = await usuarioRepositoryInstance.findOne({ where: { id } });

    return this.toUsuarioResponseDto(usuarioAtualizado!);
  }

  async atualizarSenha(id: number, senhaAtual: string, novaSenha: string): Promise<void> {
    const usuario = await usuarioRepositoryInstance.buscarPorIdComSenha(id);
    if (!usuario || !usuario.ativo) {
      throw new Error('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaValida) {
      throw new Error('Senha atual incorreta');
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await usuarioRepositoryInstance.update(id, { senha: novaSenhaHash });
  }

  /////////////////////////////////////////////////////////////////////////
  async recriarHashUsuarioPorId(userId: number, novaSenha: string): Promise<void> {
    const usuario = await usuarioRepositoryInstance.findOne({ where: { id: userId } });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const novoHash = await bcrypt.hash(novaSenha, 10);
    usuario.senha = novoHash;

    await usuarioRepositoryInstance.save(usuario);
  }

  private toUsuarioResponseDto(usuario: any): UsuarioResponseDto {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf,
      tipo: usuario.tipo,
      telefone: usuario.telefone,
      ativo: usuario.ativo,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt
    };
  }
}
