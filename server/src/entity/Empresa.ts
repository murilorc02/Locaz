import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Empresa')
export class Empresa {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    nome!: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    localizacao?: string;
}