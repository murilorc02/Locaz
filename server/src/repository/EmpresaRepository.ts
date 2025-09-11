import { AppDataSource } from '../data-source';
import { Empresa } from '../entity/Empresa';

export const EmpresaRepository = AppDataSource.getRepository(Empresa).extend({
  findByNome(nome: string) {
    return this.findOne({ where: { nome } });
  }
});