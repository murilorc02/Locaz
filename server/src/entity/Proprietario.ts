import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Predio } from './Predio';

@Entity('Proprietario')
export class Proprietario {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    nome!: string;

    @Column()
    email!: string;

    @Column({ type: 'text', nullable: true })
    foto?: string;

    @Column({ type: 'text', nullable: true })
    descricao?: string;

    @OneToMany(() => Predio, predio => predio.proprietario)
    predios?: Predio[]; 
}