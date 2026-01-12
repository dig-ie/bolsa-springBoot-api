import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Delete,
  HttpCode,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiExtraModels,
  getSchemaPath,
} from "@nestjs/swagger";

import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserEntity } from "./entities/user.entity";

import { Public } from "../auth/decorators/public.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("Users")
@ApiExtraModels(UserEntity)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ------------------------------------------------
  // 📌 REGISTRAR USUÁRIO (PÚBLICO)
  // ------------------------------------------------
  @Public()
  @Post()
  @ApiOperation({
    summary: "Registrar novo usuário",
    description: "Cria um novo usuário com role padrão USER.",
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: "Usuário criado com sucesso",
    schema: { $ref: getSchemaPath(UserEntity) },
  })
  @ApiBadRequestResponse({
    description: "Erro de validação no DTO",
    schema: {
      example: {
        statusCode: 400,
        message: [
          "Forneça um email válido",
          "Senha deve ter no mínimo 6 caracteres",
          "Nome não pode estar vazio",
        ],
        error: "Bad Request",
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ------------------------------------------------
  // 👮 LISTAR TODOS (ADMIN)
  // ------------------------------------------------
  @Roles("ADMIN")
  @Get()
  @ApiOperation({
    summary: "Listar todos os usuários",
    description: "Apenas administradores podem acessar esta rota.",
  })
  @ApiOkResponse({
    description: "Lista de usuários retornada com sucesso",
    schema: {
      type: "array",
      items: { $ref: getSchemaPath(UserEntity) },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Token inválido ou ausente",
  })
  @ApiForbiddenResponse({
    description: "Acesso negado — apenas administradores",
  })
  async findAll(@CurrentUser() admin: any) {
    return this.usersService.findAll();
  }

  // ------------------------------------------------
  // 👤 VER PERFIL PRÓPRIO (AUTENTICADO)
  // ------------------------------------------------
  @Get("me")
  @ApiOperation({
    summary: "Obter o próprio perfil",
  })
  @ApiOkResponse({
    description: "Perfil retornado com sucesso",
    schema: { $ref: getSchemaPath(UserEntity) },
  })
  @ApiUnauthorizedResponse({
    description: "Token inválido ou ausente",
  })
  async getMyProfile(@CurrentUser("userId") userId: string) {
    return this.usersService.findOne(userId);
  }

  // ------------------------------------------------
  // 👮 VER USUÁRIO ESPECÍFICO (ADMIN)
  // ------------------------------------------------
  @Roles("ADMIN")
  @Get(":id")
  @ApiOperation({
    summary: "Buscar usuário por ID",
    description: "Apenas administradores podem acessar esta rota.",
  })
  @ApiOkResponse({
    description: "Usuário encontrado",
    schema: { $ref: getSchemaPath(UserEntity) },
  })
  @ApiNotFoundResponse({
    description: "Usuário não encontrado",
    schema: {
      example: {
        statusCode: 404,
        message: "Usuário não encontrado",
        error: "Not Found",
      },
    },
  })
  @ApiForbiddenResponse({
    description: "Acesso negado — apenas administradores",
  })
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  // ------------------------------------------------
  // 👮 DELETAR USUÁRIO (ADMIN)
  // ------------------------------------------------
  @Roles("ADMIN")
  @Delete(":id")
  @ApiOperation({
    summary: "Deletar usuário",
    description: "Apenas administradores podem excluir usuários.",
  })
  @ApiOkResponse({
    description: "Usuário deletado com sucesso",
  })
  @ApiNotFoundResponse({
    description: "Usuário não encontrado",
  })
  @ApiForbiddenResponse({
    description: "Acesso negado — apenas administradores",
  })
  async remove(@Param("id") id: string, @CurrentUser() admin: any) {
    return this.usersService.remove(id);
  }
}
