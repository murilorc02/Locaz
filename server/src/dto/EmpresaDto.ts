export class CreateEmpresaDto {
  nome!: string;
  localizacao?: string;
}

export class UpdateEmpresaDto {
  nome?: string;
  localizacao?: string;
}

export class EmpresaResponseDto {
  id?: number;
  nome!: string;
  localizacao?: string;
}