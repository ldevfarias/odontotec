import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './src/modules/users/entities/user.entity';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const repo = app.get(getRepositoryToken(User));

    const user = await repo.findOne({
        where: { id: 4 },
        select: ['id', 'resetPasswordToken', 'resetPasswordExpires']
    });

    console.log('User 4 Reset Token:', user?.resetPasswordToken);
    console.log('User 4 Expires:', user?.resetPasswordExpires);

    await app.close();
}
bootstrap();
