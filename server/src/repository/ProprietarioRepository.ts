import { AppDataSource } from '../data-source';
import { Proprietario } from '../entity/Proprietario';

export const ProprietarioRepository = AppDataSource.getRepository(Proprietario).extend({
  findByEmail(email: string): Promise<Proprietario | null> {
    return this.findOne({ where: { email } });
  },

  findAtivos(): Promise<Proprietario[]> {
    return this.find({ where: { ativo: true } });
  },

  // Adicione outros métodos necessários
  async findOne(options?: any): Promise<Proprietario | null> {
    return super.findOne(options);
  },

  async find(options?: any): Promise<Proprietario[]> {
    return super.find(options);
  },

  create(data: Partial<Proprietario>): Proprietario {
    return super.create(data);
  },

  async save(entity: Proprietario): Promise<Proprietario> {
    return super.save(entity);
  },

  async update(id: number, data: Partial<Proprietario>): Promise<any> {
    return super.update(id, data);
  },

  async remove(entity: Proprietario): Promise<Proprietario> {
    return super.remove(entity);
  }
});