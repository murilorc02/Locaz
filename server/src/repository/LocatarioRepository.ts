import { AppDataSource } from '../data-source';
import { Locatario } from '../entity/Locatario';

export const LocatarioRepository = AppDataSource.getRepository(Locatario).extend({
  findByEmail(email: string) {
    return this.findOne({ where: { email } });
  },
  
  findAtivos() {
    return this.find({ where: { ativo: true } });
  }
});