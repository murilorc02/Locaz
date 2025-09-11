import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Reserva } from './Reserva';

@Entity('Locatario')
export class Locatario {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    nome!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    email!: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    telefone!: string;

    @Column({ type: 'varchar', length: 14, nullable: true })
    cpf!: string;

    @Column()
    ativo?: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Reserva, reserva => reserva.locatario)
    reservas!: Reserva[];
}