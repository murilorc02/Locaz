import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Sala } from './Sala';
import { Locatario } from './Locatario';

export enum StatusReserva {
    PENDENTE = 'Pendente',
    CONFIRMADO = 'Confirmado',
    CANCELADO = 'Cancelado'
}

@Entity('Reserva')
export class Reserva {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    clienteNome!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    clienteEmail!: string;

    @Column({ type: 'date', nullable: false })
    dataReserva!: Date;

    @Column({ type: 'time', nullable: false })
    horaInicio!: string;

    @Column({ type: 'time', nullable: false })
    horaFim!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    valorTotal?: number;

    @Column({
        type: 'enum',
        enum: StatusReserva,
        default: StatusReserva.PENDENTE
    })
    status!: StatusReserva;

    @Column({ type: 'text', nullable: true })
    observacoes?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @ManyToOne(() => Sala, sala => sala.reservas)
    @JoinColumn({ name: 'sala_id' })
    sala?: Sala;

    @ManyToOne(() => Locatario, locatario => locatario.reservas)
    @JoinColumn({ name: 'locatario_id' })
    locatario?: Locatario;
}