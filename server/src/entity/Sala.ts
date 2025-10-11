import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Predio } from './Predio';
import { Reserva } from './Reserva';
import { HorarioSala } from './horarioSala';

@Entity()
export class Sala {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    nome!: string;

    @Column({ type: 'text', nullable: true })
    descricao?: string;

    @Column()
    capacidade!: number;

    @Column({ type: 'text' })
    categoria!: string;

    @Column({ name: 'precoHora', type: 'decimal', precision: 10, scale: 2 })
    precoHora!: number;

    @Column({ default: false })
    reservaGratuita?: boolean;

    @ManyToOne(() => Predio, predio => predio.salas)
    @JoinColumn({ name: 'predio_id' })
    predio!: Predio;

    @OneToMany(() => Reserva, reserva => reserva.sala)
    reservas?: Reserva[];

    @Column({ type: 'text', array: true })
    comodidades!: string[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => HorarioSala, (horarioSala) => horarioSala.sala)
    horarioSala!: HorarioSala[];
}