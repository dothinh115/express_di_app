import { ExtractJwt, Strategy, VerifiedCallback } from "passport-jwt";
import { Injectable } from "../core/decorators/injectable.decorator";
import { JwtPayload } from "jsonwebtoken";
import { Inject } from "../core/decorators/param.decorator";
import { PassportService } from "../services/passport.service";
import { Request } from "../core/utils/types";

@Injectable()
export class JwtStrategy extends Strategy {
  constructor(@Inject(PassportService) passportService: PassportService) {
    super(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET_KEY!,
        passReqToCallback: true,
      },
      (req: Request, payload: JwtPayload, done: VerifiedCallback) => {
        this.validate(req, payload, done);
      }
    );
    passportService.getInstance().use(this);
  }

  validate(req: Request, payload: JwtPayload, done: VerifiedCallback) {
    req.user = payload;
    return done(null, payload);
  }
}
