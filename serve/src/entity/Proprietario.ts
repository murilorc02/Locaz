import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Predio } from './Predio';

@Entity()
export class Proprietario {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nome!: string;

    @Column('bytea', { nullable: true })
    foto!: Buffer;

    @OneToMany(() => Predio, predio => predio.proprietario)
    predios!: Predio[];
}