import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export const validationMiddleware = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dadosDto = plainToInstance(dtoClass, req.body);
    const erros = await validate(dadosDto);

    if (erros.length > 0) {
      res.status(400).json(erros);
    } else {
      req.body = dadosDto;
      next();
    }
  };
};