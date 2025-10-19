import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Predio } from './Predio';

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
export class HorarioPredio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: DiaSemana,
    name: 'diaSemana'
  })
  diaSemana?: DiaSemana;

  @Column({ name: 'horarioAbertura', type: 'time' , default: '08:00'})
  horarioAbertura?: string;

  @Column({ name: 'horarioFechamento', type: 'time' , default: '18:00'})
  horarioFechamento?: string;

  @Column({ default: true })
  ativo?: boolean;

  @ManyToOne(() => Predio, (predio) => predio.horarioPredio, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'predioId' })
  predio!: Predio;
}