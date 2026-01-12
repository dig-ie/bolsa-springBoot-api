import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";

import cookieParser from "cookie-parser";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());

  // -----------------------------------------------------
  // 1. DOCUMENTAÇÃO GERAL (TODOS OS ENDPOINTS)
  // -----------------------------------------------------
  const globalConfig = new DocumentBuilder()
    .setTitle("Bolsa API – Documentação Geral")
    .setDescription("Documentação completa da API")
    .setVersion("1.0")
    .addTag("Auth")
    .addTag("Users")
    .addTag("Assets")
    .build();

  const globalDocument = SwaggerModule.createDocument(app, globalConfig);

  SwaggerModule.setup("api/docs", app, globalDocument, {
    swaggerOptions: { persistAuthorization: true },
  });

  // -----------------------------------------------------
  // 2. DOCUMENTAÇÃO SEPARADA PROPOSITALMENTE (AUTH + USERS)
  // -----------------------------------------------------
  const coreConfig = new DocumentBuilder()
    .setTitle("Bolsa API – Core (Auth + Users)")
    .setDescription(
      "Documentação apenas dos módulos de autenticação e usuários"
    )
    .setVersion("1.0")
    .addTag("Auth")
    .addTag("Users")
    .build();

  const coreDocument = SwaggerModule.createDocument(app, coreConfig, {
    include: [AuthModule, UsersModule],
  });

  SwaggerModule.setup("docs/core", app, coreDocument);

  // -----------------------------------------------------
  // CORS
  // -----------------------------------------------------
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : [];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  });

  // -----------------------------------------------------
  // VALIDATION PIPE
  // -----------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
