import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { ClinicsModule } from '../clinics/clinics.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [
        UsersModule,
        ClinicsModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET');
                if (!secret) {
                    throw new Error('JWT_SECRET environment variable is required');
                }
                return {
                    secret,
                    signOptions: { expiresIn: '15m' },
                };
            },
            inject: [ConfigService],
        }),
        EmailModule,
    ],
    providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
    controllers: [AuthController],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
