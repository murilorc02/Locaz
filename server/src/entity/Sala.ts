import 'reflect-metadata';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Horario } from './Horario';
import { Predio } from './Predio';

@Entity()
export class Sala {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nomeSala!: string

    @Column()
    capacidade!: string

    @Column()
    categoria!: string

    @Column()
    disponibilidade!: boolean

    @Column()
    quantCadeiras!: number;

    @Column()
    destaques!: boolean;

    @ManyToOne(() => Predio, Predio => Predio.salas)
    predio!: Predio;

    @OneToMany(() => Horario, horario => horario.sala)
    horarios!: Horario[];

}
