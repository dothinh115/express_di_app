import passport from "passport";
import { Injectable } from "../core/decorators/injectable.decorator";

@Injectable()
export class PassportService {
  passport = passport;
}
