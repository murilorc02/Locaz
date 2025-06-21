import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Usuario } from './Usuario';
import { Sala } from './Sala';

export enum StatusHorario {
    PENDENTE = 'pendente',
    CONFIRMADO = 'confirmado',
    CANCELADO = 'cancelado',
}

@Entity()
export class Horario {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'timestamp' })
    dataHoraInicio!: Date;

    @Column({ type: 'timestamp' })
    dataHoraFim!: Date;

    @Column({ type: 'enum', enum: StatusHorario, default: StatusHorario.PENDENTE })
    status!: StatusHorario;

    @ManyToOne(() => Usuario, usuario => usuario.horarios)
    usuario!: Usuario;

    @ManyToOne(() => Sala, sala => sala.horarios)
    sala!: Sala;
}