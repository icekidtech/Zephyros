import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      // look for token in Authorization header or in cookies.jwt
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          return req?.cookies?.jwt;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any, done: VerifiedCallback) {
    // payload = { sub: userId, email, role, iat, exp }
    if (!payload || !payload.sub) {
      return done(new UnauthorizedException(), false);
    }

    // you can load more user info here if needed
    const user = { userId: payload.sub, email: payload.email, role: payload.role };
    return done(null, user);
  }
}
