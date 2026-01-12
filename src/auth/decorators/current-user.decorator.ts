import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";

/**
 * 👤 Current User Decorator
 *
 * Extrai os dados do usuário autenticado diretamente nos parâmetros do método.
 *
 * COMO FUNCIONA:
 * 1. O JwtAuthGuard valida o token
 * 2. A JwtStrategy anexa os dados do usuário em req.user
 * 3. Este decorator extrai req.user e injeta nos parâmetros do método
 *
 * EXEMPLO DE USO:
 *
 * @Controller('profile')
 * export class ProfileController {
 *   @Get('me')
 *   getProfile(@CurrentUser() user: any) {
 *     // user contém: { userId, email, role }
 *     return { message: `Olá, ${user.email}!` };
 *   }
 *
 *   @Get('my-id')
 *   getMyId(@CurrentUser('userId') userId: string) {
 *     // Extrai apenas o userId
 *     return { id: userId };
 *   }
 * }
 *
 * VANTAGENS:
 * - Código mais limpo (sem precisar usar @Req() e acessar req.user)
 * - Type-safe (pode tipar o usuário)
 * - Pode extrair propriedades específicas
 *
 * @param data - (Opcional) Propriedade específica para extrair (ex: 'userId', 'email')
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("JWT inválido ou ausente.");
    }

    if (data) {
      return user?.[data];
    }

    return user;
  }
);
