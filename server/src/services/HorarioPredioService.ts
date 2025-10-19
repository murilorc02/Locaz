import { HorarioPredioRepository } from '../repository/HorarioPredioRepository';
import { HorarioPredio, DiaSemana } from '../entity/horarioPredio';
import { Predio } from '../entity/Predio';

export interface CriarHorarioDto {
  diaSemana: DiaSemana;
  horarioAbertura: string;
  horarioFechamento: string;
  ativo?: boolean;
}

export interface AtualizarHorarioDto {
  diaSemana?: DiaSemana;
  horarioAbertura?: string;
  horarioFechamento?: string;
  ativo?: boolean;
}

export class HorarioPredioService {
  private horarioPredioRepository: HorarioPredioRepository;

  constructor() {
    this.horarioPredioRepository = new HorarioPredioRepository();
  }

  async criarHorario(predioId: number, dados: CriarHorarioDto): Promise<HorarioPredio> {
    // Validar horários
    this.validarHorarios(dados.horarioAbertura, dados.horarioFechamento);

    // Verificar se já existe horário para este dia
    const existeHorario = await this.horarioPredioRepository.existeHorarioParaDia(
      predioId,
      dados.diaSemana
    );

    if (existeHorario) {
      throw new Error(`Já existe um horário configurado para ${dados.diaSemana}`);
    }

    const horario = await this.horarioPredioRepository.criar({
      diaSemana: dados.diaSemana,
      horarioAbertura: dados.horarioAbertura,
      horarioFechamento: dados.horarioFechamento,
      ativo: dados.ativo ?? true,
      predio: { id: predioId } as Predio
    });

    return horario;
  }

  async criarMultiplos(predioId: number, horarios: CriarHorarioDto[]): Promise<HorarioPredio[]> {
    // Validar duplicatas nos dados enviados
    const diasUnicos = new Set(horarios.map(h => h.diaSemana));
    if (diasUnicos.size !== horarios.length) {
      throw new Error('Existem dias da semana duplicados na requisição');
    }

    // Validar cada horário
    horarios.forEach(h => {
      this.validarHorarios(h.horarioAbertura, h.horarioFechamento);
    });

    const horariosComPredio = horarios.map(h => ({
      diaSemana: h.diaSemana,
      horarioAbertura: h.horarioAbertura,
      horarioFechamento: h.horarioFechamento,
      ativo: h.ativo ?? true,
      predio: { id: predioId } as Predio
    }));

    return await this.horarioPredioRepository.criarMultiplos(predioId, horariosComPredio);
  }

  async atualizarHorario(horario: HorarioPredio, dados: AtualizarHorarioDto): Promise<HorarioPredio | null> {
    // Validar horários se foram fornecidos
    if (dados.horarioAbertura !== undefined || dados.horarioFechamento !== undefined) {
      const abertura = dados.horarioAbertura ?? horario.horarioAbertura ?? '08:00';
      const fechamento = dados.horarioFechamento ?? horario.horarioFechamento ?? '18:00';
      this.validarHorarios(abertura, fechamento);
    }

    // Se mudou o dia, verificar se já existe outro horário para o novo dia
    if (dados.diaSemana && dados.diaSemana !== horario.diaSemana) {
      const existe = await this.horarioPredioRepository.existeHorarioParaDia(
        horario.predio.id,
        dados.diaSemana,
        horario.id
      );

      if (existe) {
        throw new Error(`Já existe um horário configurado para ${dados.diaSemana}`);
      }
    }

    return await this.horarioPredioRepository.atualizar(horario.id, dados);
  }

  async deletar(horario: HorarioPredio): Promise<void> {
    await this.horarioPredioRepository.deletarPorId(horario.id);
  }

  async deletarPorPredio(predioId: number): Promise<void> {
    await this.horarioPredioRepository.deletarPorPredio(predioId);
  }

  async verificarFuncionamento(
    horario: HorarioPredio,
    horarioVerificacao: string
  ): Promise<boolean> {
    if (!horario.ativo) {
      return false;
    }

    const horarioFormatado = this.compararHorarios(horarioVerificacao);
    const abertura = this.compararHorarios(horario.horarioAbertura ?? '08:00');
    const fechamento = this.compararHorarios(horario.horarioFechamento ?? '18:00');

    return horarioFormatado >= abertura && horarioFormatado <= fechamento;
  }

  private validarHorarios(abertura: string, fechamento: string): void {
    const regexHora = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!regexHora.test(abertura)) {
      throw new Error('Horário de abertura inválido. Use formato HH:MM');
    }

    if (!regexHora.test(fechamento)) {
      throw new Error('Horário de fechamento inválido. Use formato HH:MM');
    }

    const abreEmMinutos = this.compararHorarios(abertura);
    const fechaEmMinutos = this.compararHorarios(fechamento);

    if (abreEmMinutos >= fechaEmMinutos) {
      throw new Error('Horário de abertura deve ser menor que o horário de fechamento');
    }
  }

  private compararHorarios(horario: string): number {
    const [horas, minutos] = horario.split(':').map(Number);
    return horas * 60 + minutos;
  }
}