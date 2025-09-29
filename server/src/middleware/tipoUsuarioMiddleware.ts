import { TipoUsuario } from "../entity/Usuario";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: number;
        email: string;
        tipo: TipoUsuario;
        iat: number;
        exp: number;
      };
    }
  }
}

export {}
