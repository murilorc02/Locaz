export interface JwtPayload {
  id?: number;
  sub?: number;
  email?: string;
  tipo?: 'PROPRIETARIO' | 'LOCATARIO';
  iat?: number;
  exp?: number;
}