import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET environment variable is missing');
        }
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: any) => req?.cookies?.access_token,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        const userId = Number(payload.sub);

        if (isNaN(userId)) {
            throw new UnauthorizedException('Invalid token payload: userId must be numeric');
        }

        return { userId, email: payload.email, role: payload.role, isActive: payload.isActive };
    }
}
