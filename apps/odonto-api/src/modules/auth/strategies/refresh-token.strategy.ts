import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(configService: ConfigService) {
        const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
        if (!refreshSecret) {
            throw new Error('JWT_REFRESH_SECRET environment variable is missing');
        }
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: any) => req?.cookies?.refresh_token,
            ]),
            secretOrKey: refreshSecret,
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: any) {
        const refreshToken = req.cookies?.refresh_token;
        return { ...payload, refreshToken };
    }
}
