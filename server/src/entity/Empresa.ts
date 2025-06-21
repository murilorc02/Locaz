import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Empresa {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nome!: string;

    @Column()
    localizacao!: string;
}