import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Sala } from './Sala';

@Entity('Horario')
export class Horario {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'time', nullable: true })
    inicioPeriodo!: string;

    @Column({ type: 'time', nullable: true })
    fimPeriodo!: string;

    @Column({ type: 'boolean', default: true })
    disponivel?: boolean;

    @OneToOne(() => Sala, sala => sala.horario)
    @JoinColumn({ name: 'sala_id' })
    sala?: Sala;
}