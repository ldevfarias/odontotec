import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/modules/auth/auth.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);

    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsInR5cGUiOiJyZXNldCIsImp0aSI6IjFlMmRmOTcwMjI3YzA1MWQwNzVlN2EyOTBlNWNjOGUzOTAyMDYzYWMwNzljOWIwMDJjYzI4ODdhODRhZjMwOTkiLCJpYXQiOjE3NzEzNTc2NDksImV4cCI6MTc3MTM2MTI0OX0.X8E52JWu-gqOBtpTy8A88SNERi22KTVm8Ar-imHVX3w";

    try {
        console.log('Attempting reset with token:', token);
        await authService.resetPassword(token, 'newPass123');
        console.log('Success!');
    } catch (error) {
        console.error('Caught Error:', error);
    }

    await app.close();
}
bootstrap();
