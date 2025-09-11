import { AppDataSource } from "../data-source";
import { Horario } from "../entity/Horario";


export const HorarioRepository = AppDataSource.getRepository(Horario).extend({
  findBySalaId(salaId: number) {
    return this.findOne({ 
      where: { sala: { id: salaId } },
      relations: ['sala']
    });
  },

  findDisponiveis() {
    return this.find({ 
      where: { disponivel: true },
      relations: ['sala']
    });
  }
});