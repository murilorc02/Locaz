import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Predio } from './Predio';
import { Reserva } from './Reserva';
import { HorarioSala } from './horarioSala';

export enum CategoriaSala {
    WORKSTATION = 'workstation',
    MEETINGROOM = 'meeting-room',
    TRAININGROOM = 'training-room',
    AUDITORIUM = 'auditorium'
}

/*export enum Comodidade {
    WIFI_GRATIS = 'wifiGratis',
    CAFE_GRATIS = 'cafeGratis',
    CADEIRAS_ERGONOMICAS = 'cadeirasErgonomicas',
    PROJETOR = 'projetor',
    ESPACO_DESCOMPRESSAO = 'espacoDescompressao',
    ESPACO_KIDS = 'espacoKids',
    AR_CONDICIONADO = 'arCondicionado',
    QUADRO_BRANCO = 'quadroBranco',
    ESTACIONAMENTO = 'estacionamento',
    COPA_COZINHA = 'copaCozinha'
}*/

@Entity()
export class Sala {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    nome!: string;

    @Column({ type: 'text', nullable: true })
    descricao?: string;

    @Column()
    capacidade!: number;

    @Column({
        type: 'enum',
        enum: CategoriaSala
    })
    categoria!: CategoriaSala;

    @Column({ name: 'precoHora', type: 'decimal', precision: 10, scale: 2 })
    precoHora!: number;

    @Column({ default: false })
    reservaGratuita?: boolean;

    @ManyToOne(() => Predio, predio => predio.salas)
    @JoinColumn({ name: 'predio_id' })
    predio!: Predio;

    @OneToMany(() => Reserva, reserva => reserva.sala)
    reservas?: Reserva[];

    @Column({ type: 'text', array: true })
    comodidades!: string[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => HorarioSala, (horarioSala) => horarioSala.sala)
    horarioSala!: HorarioSala[];
}