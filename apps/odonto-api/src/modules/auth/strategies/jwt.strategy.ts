import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string | number;
  email: string;
  role: string;
  isActive: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is missing');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => (req as Request)?.cookies?.access_token as string | null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(rawPayload: unknown) {
    const payload = rawPayload as JwtPayload;
    const userId = Number(payload.sub);

    if (isNaN(userId)) {
      throw new UnauthorizedException(
        'Invalid token payload: userId must be numeric',
      );
    }

    return {
      userId,
      email: payload.email,
      role: payload.role,
      isActive: payload.isActive,
    };
  }
}
