import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from './Usuario';
import { Sala } from './Sala';
import { HorarioPredio } from './horarioPredio';

@Entity('Predio')
export class Predio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  nome!: string;

  @Column()
  endereco!: string;

  @Column()
  cidade!: string;

  @Column()
  estado!: string;

  @Column()
  cep!: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @OneToMany(() => Sala, sala => sala.predio)
  salas?: Sala[];

  @OneToMany(() => HorarioPredio, (horarioPredio) => horarioPredio.predio)
  horarioPredio?: HorarioPredio[];

  @ManyToOne(() => Usuario, (usuario) => usuario.predio)
  @JoinColumn({ name: "usuarioId" })
  usuario!: Usuario;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}