import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function generate() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('OdontoTec API')
        .setDescription('Clínica Odontológica Multi-tenant API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    const outputPath = join(process.cwd(), 'openapi.json');
    writeFileSync(outputPath, JSON.stringify(document, null, 2));
    console.log('OpenAPI spec generated at:', outputPath);

    await app.close();
    process.exit(0);
}

generate();
