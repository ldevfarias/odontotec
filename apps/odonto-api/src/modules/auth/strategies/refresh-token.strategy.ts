import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is missing');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => (req as Request)?.cookies?.refresh_token as string | null,
      ]),
      secretOrKey: refreshSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, rawPayload: unknown) {
    const refreshToken = req.cookies?.refresh_token as string;
    return { ...(rawPayload as object), refreshToken };
  }
}
