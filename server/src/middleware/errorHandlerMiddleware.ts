import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../services/usuarioService';

export interface ErrorResponse {
    message: string;
    statusCode: number;
    timestamp: string;
    path: string;
}

export function errorHandler(
    error: Error | HttpError,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.error('Error:', error);

    // Se é um HttpError customizado
    if (error instanceof HttpError) {
        const errorResponse: ErrorResponse = {
            message: error.message,
            statusCode: error.statusCode,
            timestamp: new Date().toISOString(),
            path: req.path
        };

        res.status(error.statusCode).json(errorResponse);
        return;
    }

    // Erros de validação do TypeORM
    if (error.name === 'QueryFailedError') {
        const errorResponse: ErrorResponse = {
            message: 'Erro na consulta ao banco de dados',
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: req.path
        };

        res.status(400).json(errorResponse);
        return;
    }

    // Erros de validação do class-validator
    if (error.message && error.message.includes('validation failed')) {
        const errorResponse: ErrorResponse = {
            message: 'Dados de entrada inválidos',
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: req.path
        };

        res.status(400).json(errorResponse);
        return;
    }

    // Erro genérico do servidor
    const errorResponse: ErrorResponse = {
        message: 'Erro interno do servidor',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: req.path
    };

    res.status(500).json(errorResponse);
}