import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sala } from './Sala';

export enum DiaSemana {
  SEGUNDA = 'segunda',
  TERCA = 'terca',
  QUARTA = 'quarta',
  QUINTA = 'quinta',
  SEXTA = 'sexta',
  SABADO = 'sabado',
  DOMINGO = 'domingo'
}

@Entity()
export class HorarioSala {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({
    type: 'enum',
    enum: DiaSemana,
    name: 'dia_semana'
  })
  diaSemana!: DiaSemana;

  @Column({ name: 'horario_inicio', type: 'time' , default: '08:00'})
  horarioInicio!: string;

  @Column({ name: 'horario_fim', type: 'time' , default: '18:00'})
  horarioFim!: string;

  @Column({ name: 'horarioPadrao', default: false })
  horarioPadrao!: boolean;

  @Column({ default: true })
  disponivel!: boolean;

  @Column({ default: true })
  ativo!: boolean;

  @ManyToOne(() => Sala, (sala) => sala.horarioSala)
  @JoinColumn({ name: 'salaId' })
  sala!: Sala;
}