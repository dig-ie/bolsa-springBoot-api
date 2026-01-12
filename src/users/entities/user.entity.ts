import { ApiProperty } from "@nestjs/swagger";

export class UserEntity {
  @ApiProperty({ example: "1" })
  id: string;

  @ApiProperty({ example: "usuario@exemplo.com" })
  email: string;

  @ApiProperty({ example: "João da Silva" })
  name: string;

  @ApiProperty({ example: "USER", enum: ["USER", "ADMIN"] })
  role: string;

  @ApiProperty({ example: "2025-01-20T12:40:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2025-01-20T12:45:00.000Z" })
  updatedAt: Date;
}
