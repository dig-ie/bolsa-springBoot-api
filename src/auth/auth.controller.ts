import { Controller, Post, Body, Get, Res, HttpCode } from "@nestjs/common";
import { type Response } from "express";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Public } from "./decorators/public.decorator";
// import { CurrentUser } from "./decorators/current-user.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  @ApiOperation({
    summary: "Realiza login com email e senha",
    description:
      "Retorna o usuário autenticado e envia o token JWT via cookie httpOnly.",
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      exemplo: {
        summary: "Corpo do login",
        value: {
          email: "admin@bolsa.com",
          password: "admin123",
        },
      },
    },
  })
  @ApiOkResponse({
    description: "Login realizado com sucesso",
    schema: {
      example: {
        user: {
          id: 1,
          email: "admin@bolsa.com",
          role: "user",
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Erro de validação no DTO",
    schema: {
      example: {
        statusCode: 400,
        message: [
          "email must be an email",
          "password must be longer than or equal to 3 characters",
        ],
        error: "Bad Request",
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Credenciais inválidas",
    schema: {
      example: {
        statusCode: 401,
        message: "Email ou senha incorretos",
        error: "Unauthorized",
      },
    },
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { token, user } = await this.authService.login(
      dto.email,
      dto.password
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token_httpOnly", token, {
      httpOnly: true,
      secure: isProd, // true somente em produção HTTPS
      sameSite: "none",
      path: "/",
    });

    return { user };
  }

  // @Get("profile")
  // @ApiCookieAuth()
  // @ApiOperation({
  //   summary: "Retorna dados do usuário autenticado",
  //   description: "Endpoint protegido por JWT via cookie httpOnly.",
  // })
  // @ApiOkResponse({
  //   description: "Retorna o usuário logado",
  //   schema: {
  //     example: {
  //       message: "Dados do usuário autenticado",
  //       user: {
  //         id: 1,
  //         email: "admin@bolsa.com",
  //         role: "user",
  //       },
  //     },
  //   },
  // })
  // @ApiUnauthorizedResponse({
  //   description: "Token inválido ou ausente",
  //   schema: {
  //     example: {
  //       statusCode: 401,
  //       message: "Unauthorized",
  //     },
  //   },
  // })
  // async getProfile(@CurrentUser() user: any) {
  //   return {
  //     message: "Dados do usuário autenticado",
  //     user: {
  //       id: user.userId,
  //       email: user.email,
  //       role: user.role,
  //     },
  //   };
  // }
}
