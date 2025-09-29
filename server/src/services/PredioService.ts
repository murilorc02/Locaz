import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Predio } from '../entity/Predio';
import { HorarioPredio, DiaSemana } from '../entity/horarioPredio';
import { Usuario } from '../entity/Usuario';

interface HorarioFuncionamentoData {
  diaSemana: DiaSemana;
  horarioAbertura: string;
  horarioFechamento: string;
  ativo: boolean;
}

export class PredioService {
  private predioRepository: Repository<Predio>;
  private usuarioRepository: Repository<Usuario>;
  private horarioPredioRepository: Repository<HorarioPredio>;

  constructor() {
    this.predioRepository = AppDataSource.getRepository(Predio);
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
    this.horarioPredioRepository = AppDataSource.getRepository(HorarioPredio);
  }

  async criarPredio(dadosPredio: {
    nome: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    descricao?: string;
    usuarioId: string | number; // Aceitar tanto string quanto number
    horariosFuncionamento?: HorarioFuncionamentoData[];
  }): Promise<Predio> {

    // Converter usuarioId para number se for string
    const userId = typeof dadosPredio.usuarioId === 'string'
      ? parseInt(dadosPredio.usuarioId, 10)
      : dadosPredio.usuarioId;

    // Validar se a conversão foi bem-sucedida
    if (isNaN(userId)) {
      throw new Error('ID do usuário inválido');
    }

    // Buscar o usuário
    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId }
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se já existe um prédio com o mesmo nome
    const predioExistente = await this.predioRepository.findOne({
      where: { nome: dadosPredio.nome }
    });

    if (predioExistente) {
      throw new Error('Já existe um prédio com este nome');
    }

    const { horariosFuncionamento, usuarioId, ...dadosBasicos } = dadosPredio;

    // Criar o prédio
    const predio = this.predioRepository.create({
      ...dadosBasicos,
      usuario // Relacionamento com a entidade usuario
    });

    const predioSalvo = await this.predioRepository.save(predio);

    // Criar os horários de funcionamento se fornecidos
    if (horariosFuncionamento && horariosFuncionamento.length > 0) {
      await this.criarHorariosFuncionamento(predioSalvo.id, horariosFuncionamento);
    }

    // Retornar o prédio com os horários
    return await this.buscarPorId(predioSalvo.id) as Predio;
  }

  async editarPredio(id: string, dadosAtualizacao: {
    nome?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    descricao?: string;
    horariosFuncionamento?: HorarioFuncionamentoData[];
}): Promise<Predio | null> {
    const predioExistente = await this.predioRepository.findOne({
        where: { id },
        relations: ['usuario']
    });

    if (!predioExistente) {
        throw new Error('Prédio não encontrado');
    }

    const { horariosFuncionamento, ...dadosBasicos } = dadosAtualizacao;

    // Verificar se o nome não está sendo usado por outro prédio (apenas se o nome foi alterado)
    if (dadosBasicos.nome && dadosBasicos.nome.trim() !== predioExistente.nome.trim()) {
        const predioComMesmoNome = await this.predioRepository.findOne({
            where: { nome: dadosBasicos.nome.trim() }
        });

        if (predioComMesmoNome && predioComMesmoNome.id !== id) {
            throw new Error('Já existe um prédio com este nome');
        }
    }

    // Atualizar apenas os campos fornecidos (não undefined)
    const camposParaAtualizar: Partial<Predio> = {};

    if (dadosBasicos.nome !== undefined) camposParaAtualizar.nome = dadosBasicos.nome;
    if (dadosBasicos.endereco !== undefined) camposParaAtualizar.endereco = dadosBasicos.endereco;
    if (dadosBasicos.cidade !== undefined) camposParaAtualizar.cidade = dadosBasicos.cidade;
    if (dadosBasicos.estado !== undefined) camposParaAtualizar.estado = dadosBasicos.estado;
    if (dadosBasicos.cep !== undefined) camposParaAtualizar.cep = dadosBasicos.cep;
    if (dadosBasicos.descricao !== undefined) camposParaAtualizar.descricao = dadosBasicos.descricao;

    // Apenas atualizar se houver campos para atualizar
    if (Object.keys(camposParaAtualizar).length > 0) {
        await this.predioRepository.update(id, camposParaAtualizar);
    }

    // Atualizar horários de funcionamento se fornecidos
    if (horariosFuncionamento !== undefined) {
        // Remover horários existentes
        await this.horarioPredioRepository.delete({ predio: { id } });

        // Criar novos horários
        if (horariosFuncionamento.length > 0) {
            await this.criarHorariosFuncionamento(id, horariosFuncionamento);
        }
    }

    // Retornar o prédio atualizado com apenas as relações necessárias
    return await this.predioRepository.findOne({
        where: { id },
        relations: ['usuario'],
        select: {
            id: true,
            nome: true,
            endereco: true,
            cidade: true,
            estado: true,
            cep: true,
            descricao: true,
            createdAt: true,
            updatedAt: true,
            usuario: {
                id: true,
                nome: true
            }
        }
    });
}

  async buscarPorNome(nome: string): Promise<Predio | null> {
    return await this.predioRepository.findOne({
      where: { nome },
      relations: ['usuario']
    });
  }

  async buscarTodos(): Promise<Predio[]> {
    return await this.predioRepository.find({
      relations: ['salas', 'usuario', 'horarioPredio'],
      order: {
        nome: 'ASC'
      }
    });
  }

  async buscarPorId(id: string): Promise<Predio | null> {
    return await this.predioRepository.findOne({
      where: { id },
      relations: ['salas', 'usuario', 'horarioPredio'],
      order: {
        horarioPredio: {
          diaSemana: 'ASC'
        }
      }
    });
  }

  async buscarHorariosPorPredio(predioId: string): Promise<HorarioPredio[]> {
    return await this.horarioPredioRepository.find({
      where: { predio: { id: predioId } },
      order: { diaSemana: 'ASC' }
    });
  }

  async excluirPredio(id: string): Promise<void> {
    const predio = await this.buscarPorId(id);
    if (!predio) {
      throw new Error('Prédio não encontrado');
    }

    // Remover horários de funcionamento primeiro (devido à foreign key)
    await this.horarioPredioRepository.delete({ predio: { id } });

    // Remover o prédio
    await this.predioRepository.delete(id);
  }

  async verificarFuncionamento(predioId: string, diaSemana: DiaSemana, horario: string): Promise<boolean> {
    const horarioPredio = await this.horarioPredioRepository.findOne({
      where: {
        predio: { id: predioId },
        diaSemana,
        ativo: true
      }
    });

    if (!horarioPredio) {
      return false;
    }

    const horarioFormatado = this.formatarHorario(horario);
    const abertura = this.formatarHorario(horarioPredio.horarioAbertura || '08:00');
    const fechamento = this.formatarHorario(horarioPredio.horarioFechamento || '18:00');

    return horarioFormatado >= abertura && horarioFormatado <= fechamento;
  }

  private async criarHorariosFuncionamento(predioId: string, horarios: HorarioFuncionamentoData[]): Promise<void> {
    const horariosParaCriar = horarios.map(horario =>
      this.horarioPredioRepository.create({
        ...horario,
        predio: { id: predioId } as Predio
      })
    );

    await this.horarioPredioRepository.save(horariosParaCriar);
  }

  private formatarHorario(horario: string): number {
    const [horas, minutos] = horario.split(':').map(Number);
    return horas * 100 + minutos;
  }

  async buscarPrediosAbertos(diaSemana: DiaSemana, horarioAtual: string): Promise<Predio[]> {
    const horarioFormatado = this.formatarHorario(horarioAtual);

    const prediosAbertos = await this.predioRepository
      .createQueryBuilder('predio')
      .leftJoinAndSelect('predio.horarioPredio', 'horario')
      .leftJoinAndSelect('predio.usuario', 'usuario')
      .leftJoinAndSelect('predio.salas', 'salas')
      .where('horario.diaSemana = :diaSemana', { diaSemana })
      .andWhere('horario.ativo = :ativo', { ativo: true })
      .andWhere('horario.horarioAbertura <= :horario', { horario: horarioAtual })
      .andWhere('horario.horarioFechamento >= :horario', { horario: horarioAtual })
      .getMany();

    return prediosAbertos;
  }
}