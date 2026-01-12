import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    example: "usuario@exemplo.com",
    description: "Email do usuário para login.",
    format: "email",
  })
  @IsEmail({}, { message: "Forneça um email válido" })
  email: string;

  @ApiProperty({
    example: "senha123",
    description: "Senha do usuário.",
    minLength: 1,
  })
  @IsNotEmpty({ message: "Senha não pode estar vazia" })
  password: string;
}
