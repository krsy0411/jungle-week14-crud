import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 글로벌 prefix 설정
  app.setGlobalPrefix('api');

  /* ValidationPipe 설정
   * ValidationPipe : DTO(Data Transfer Object)의 유효성 검사를 자동으로 수행
   * 들어오는 HTTP 요청의 데이터를 자동으로 검증하고, 유효하지 않은 데이터가 포함된 요청을 차단
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성 있으면 오류 발생
      transform: true, // 자동 타입 변환 활성화
    }),
  );

  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('게시판 CRUD API')
    .setDescription('간단한 게시판 애플리케이션의 RESTful API 명세서')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', '인증 및 인가 관련 API')
    .addTag('Users', '사용자 관리 API')
    .addTag('Posts', '게시글 관리 API')
    .addTag('Comments', '댓글 관리 API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
