import { Injectable } from "../core/decorators/injectable.decorator";
import { AppGuard } from "../core/base/guard.base";
import { AppContext } from "../core/base/context.base";
import { UnAuthorizedException } from "../core/base/error.base";
import { JwtStrategy } from "../strategies/jwt.strategy";
import { PassportService } from "../services/passport.service";
import { getMetadata } from "../core/metadata/metadata";
import { PROTECTED_METADATA_KEY } from "../utils/constant";
import { JwtPayload } from "jsonwebtoken";

@Injectable()
export class AuthGuard extends AppGuard {
  constructor(
    jwtStrategy: JwtStrategy,
    private passportService: PassportService
  ) {
    super();
  }
  canActive(context: AppContext): boolean {
    const passport = this.passportService.passport;
    const controllerClass = context.getClass();
    const handler = context.getHandler();
    const req = context.switchToHttpRequest();
    const res = context.switchToHttpReponse();
    const next = context.getNextFunction();
    const isProtected =
      getMetadata(PROTECTED_METADATA_KEY, handler) ??
      getMetadata(PROTECTED_METADATA_KEY, controllerClass);
    if (!isProtected) {
      return true;
    }

    passport.authenticate(
      "jwt",
      { session: false },
      (error: any, payload: JwtPayload, info: any) => {
        if (error || info) {
          throw new UnAuthorizedException();
        }
        return true;
      }
    )(req, res, next);
    return true;
  }
}
