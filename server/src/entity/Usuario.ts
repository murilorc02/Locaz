import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Predio } from './Predio';
import { Reserva } from './Reserva';

export enum TipoUsuario {
    LOCADOR = 'locador',
    LOCATARIO = 'locatario'
}

@Entity('Usuario')
export class Usuario {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nome!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    senha!: string;

    @Column()
    cpfcnpj!: string;

    @Column()
    telefone!: string;

    @Column({ 
        type: 'enum', 
        enum: TipoUsuario,
        default: TipoUsuario.LOCATARIO
    })
    tipo!: TipoUsuario;  

    @CreateDateColumn() 
    createdAt!: Date;

    @UpdateDateColumn() 
    updatedAt!: Date;

    @OneToMany(() => Predio, (predio) => predio.usuario)
    predio?: Predio;

    @OneToMany(() => Reserva, (reserva) => reserva.locatario)
    reservas?: Reserva;
}