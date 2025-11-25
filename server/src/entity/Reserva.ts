import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from './Usuario';
import { Sala } from './Sala';

export enum StatusReserva {
  PENDENTE = 'pendente',
  ACEITA = 'aceita',
  RECUSADA = 'recusada',
  CANCELADA = 'cancelada',
}

@Entity('Reserva')
export class Reserva {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'dataReserva', type: 'date' })
  dataReserva!: Date;

  @Column({ name: 'horarioInicio', type: 'time' })
  horarioInicio!: string;

  @Column({ name: 'horarioFim', type: 'time' })
  horarioFim!: string;

  @Column({
    type: 'enum',
    enum: StatusReserva,
    default: StatusReserva.PENDENTE
  })
  status!: StatusReserva;

  @Column({ name: 'valorTotal', type: 'decimal', precision: 10, scale: 2 })
  valorTotal!: number;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.reservas)
  @JoinColumn({ name: 'locatarioId' })
  locatario!: Usuario;

  @ManyToOne(() => Sala, (sala) => sala.reservas)
  @JoinColumn({ name: 'salaId' })
  sala!: Sala;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}