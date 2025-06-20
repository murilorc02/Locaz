import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Horario } from './Horario'; 

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

    @BeforeInsert()
    async hashPassword?() {
        this.senha = await bcrypt.hash(this.senha, 10);
    }
}