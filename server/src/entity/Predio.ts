import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Sala } from './Sala';
import { Proprietario } from './Proprietario';

@Entity('Predio')
export class Predio {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    nomePredio!: string; // Alterado de 'nome' para 'nomePredio'

    @Column({ type: 'varchar', length: 500, nullable: false })
    endereco!: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    cidade!: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    estado!: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    cep!: string;

    @Column({ type: 'text', nullable: true })
    descricao?: string;

    // Adicionados os campos que estavam faltando
    @Column({ type: 'int', nullable: true })
    capacidade?: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    categoria?: string;

    @Column('simple-array', { nullable: true })
    imagens?: string[];

    @Column('simple-array', { nullable: true })
    comodidades?: string[];

    @Column({ type: 'boolean', default: true })
    disponivel?: boolean;

    @Column({ type: 'boolean', default: true })
    ativo?: boolean;

    @Column({ type: 'boolean', default: false })
    privado?: boolean;

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

    @ManyToOne(() => Proprietario, proprietario => proprietario.predios)
    @JoinColumn({ name: 'proprietario_id' })
    proprietario?: Proprietario;

    @OneToMany(() => Sala, sala => sala.predio)
    salas?: Sala[];
}