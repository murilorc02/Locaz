import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TipoUsuario } from '../entity/Usuario';

interface JwtPayload {
  sub: string;
  email: string;
  tipo: TipoUsuario;
  iat: number;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
    tipo: TipoUsuario;
    iat: number;
    exp: number;
  };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    
    // Verificação mais robusta
    if (decoded && typeof decoded === 'object' && 'sub' in decoded) {
      // Use type assertion para adicionar a propriedade user
      (req as AuthenticatedRequest).user = {
        sub: parseInt(decoded.sub), // Converte string para number
        email: decoded.email,
        tipo: decoded.tipo,
        iat: decoded.iat,
        exp: decoded.exp
      };
    } else {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
    return;
  }
};

// Middleware específico para proprietários
export const proprietarioMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authenticatedReq = req as AuthenticatedRequest;
  
  if (!authenticatedReq.user) {
    res.status(401).json({ error: 'Usuário não autenticado' });
    return;
  }

  if (authenticatedReq.user.tipo !== TipoUsuario.LOCADOR) {
    res.status(403).json({ error: 'Acesso negado. Apenas proprietários podem acessar este recurso.' });
    return;
  }

  next();
};

// Middleware específico para locatários
export const locatarioMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authenticatedReq = req as AuthenticatedRequest;
  
  if (!authenticatedReq.user) {
    res.status(401).json({ error: 'Usuário não autenticado' });
    return;
  }

  if (authenticatedReq.user.tipo !== TipoUsuario.LOCATARIO) {
    res.status(403).json({ error: 'Acesso negado. Apenas locatários podem acessar este recurso.' });
    return;
  }

  next();
};