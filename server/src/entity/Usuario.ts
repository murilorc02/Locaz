import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TipoUsuario {
    PROPRIETARIO = 'proprietario',
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
    cpf!: string;

    @Column()
    telefone!: string;

    @Column({ 
        type: 'enum', 
        enum: TipoUsuario,
        default: TipoUsuario.LOCATARIO
    })
    tipo!: TipoUsuario;  

    @Column({ name: 'ativo', default: true })
    ativo!: boolean;  

    @CreateDateColumn({ name: 'createdat' }) 
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedat' }) 
    updatedAt!: Date;
}