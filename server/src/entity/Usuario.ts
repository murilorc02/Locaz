import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Horario } from './Horario'; 
import { Predio } from './Predio';

export enum TipoUsuario {
    LOCADOR = 'locador',
    LOCATARIO = 'locatario'
}

@Entity()
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
    cpf!: string;

    @Column()
    telefone!: string;

    @Column({ type: 'enum', enum: TipoUsuario })
    tipo!: TipoUsuario;

    @OneToMany(() => Horario, horario => horario.usuario)
    horarios!: Horario[];
    
    @OneToMany(() => Predio, (predio) => predio.usuario)
    predios!: Predio[];

}