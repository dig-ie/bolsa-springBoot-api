import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    example: "usuario@exemplo.com",
    description: "Email válido do usuário",
  })
  @IsEmail({}, { message: "Forneça um email válido" })
  email: string;

  @ApiProperty({
    example: "senha123",
    description: "Senha do usuário (mínimo 6 caracteres)",
  })
  @IsNotEmpty()
  @MinLength(6, { message: "Senha deve ter no mínimo 6 caracteres" })
  password: string;

  @ApiProperty({
    example: "João da Silva",
    description: "Nome completo do usuário",
  })
  @IsNotEmpty({ message: "Nome não pode estar vazio" })
  name: string;
}
