import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Predio } from './Predio';
import { Reserva } from './Reserva';

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

export enum DiaSemana {
    SEGUNDA = 'segunda',
    TERCA = 'terca',
    QUARTA = 'quarta',
    QUINTA = 'quinta',
    SEXTA = 'sexta',
    SABADO = 'sabado',
    DOMINGO = 'domingo'
}

export interface HorarioFuncionamentoSala {
    diaSemana: DiaSemana;
    horarioAbertura: string;
    horarioFechamento: string;
    ativo: boolean;
}

@Entity('Sala')
export class Sala {
    @PrimaryGeneratedColumn()
    id!: number;

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
    @JoinColumn({ name: 'predioId' })
    predio!: Predio;

    @OneToMany(() => Reserva, reserva => reserva.sala)
    reservas?: Reserva[];

    @Column({ type: 'text', array: true })
    comodidades!: string[];

    @Column({ type: 'jsonb', nullable: true })
    horariosFuncionamento?: HorarioFuncionamentoSala[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

}