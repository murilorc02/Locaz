import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Adiciona a propriedade 'user' à interface Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).send('Token de autenticação no formato "Bearer" não fornecido.');
        return;
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const segredo = process.env.JWT_SECRET || 'naosei';
        const payload = jwt.verify(token, segredo);
        
        req.user = payload; 
        next();
    } catch (error) {
        res.status(401).send('Token inválido ou expirado.');
        return;
    }
};