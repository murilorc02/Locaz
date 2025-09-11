import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Predio } from './Predio';
import { Reserva } from './Reserva';
import { Proprietario } from './Proprietario';
import { Horario } from './Horario';
import { Empresa } from './Empresa';

@Entity('Sala')
export class Sala {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    nomeSala!: string;

    @Column({ type: 'int', default: 0 })
    capacidade?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    preco!: number;

    @Column({ type: 'text', nullable: false })
    descricao?: string;

    @Column({ type: 'simple-json', nullable: true })
    pontosDeDestaque?: string[];

    @Column('simple-array', { nullable: true }) 
    imagem?: string[];

    @Column({ type: 'boolean', default: true })
    ativo?: boolean;

    @Column({ type: 'boolean', default: false })
    privado?: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @ManyToOne(() => Predio, predio => predio.salas)
    @JoinColumn({ name: 'predio_id' })
    predio!: Predio;

    @ManyToOne(() => Empresa)
    @JoinColumn({ name: 'empresa_id' })
    empresa!: Empresa;

    @ManyToOne(() => Proprietario)
    @JoinColumn({ name: 'proprietario_id' })
    proprietario!: Proprietario;

    @OneToMany(() => Reserva, reserva => reserva.sala)
    reservas!: Reserva[];

    @OneToOne(() => Horario, horario => horario.sala)
    horario!: Horario;
}