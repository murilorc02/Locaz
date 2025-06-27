import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Sala } from './Sala';
import { Proprietario } from './Proprietario';

@Entity()
export class Predio {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nomePredio!: string;

    @Column()
    endereco!: string;

    @Column('text', { array: true, default: () => "'{}'" })
    pontosDeDestaque!: string[];

    @Column({ type: 'text', nullable: true })
    descricao?: string;

    @OneToMany(() => Sala, sala => sala.predio)
    salas!: Sala[];

    @ManyToOne(() => Proprietario, proprietario => proprietario.predios)
    proprietario!: Proprietario;
}