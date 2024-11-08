import { BadRequestException } from "../core/base/error.base";
import { Injectable } from "../core/decorators/injectable.decorator";
import { Inject } from "../core/decorators/param.decorator";
import { User } from "../db/models/user.model";
import jsonwebtoken from "jsonwebtoken";

@Injectable()
export class AuthService {
  constructor(@Inject(User) private userModel: typeof User) {}

  async login(body: any) {
    const user = await this.userModel
      .findOne({
        email: body.email,
      })
      .lean();
    if (!user || user.password !== body.password) {
      throw new BadRequestException("Email hoặc password không đúng!");
    }
    const { password, ...payload } = user;
    const access_token = jsonwebtoken.sign(
      payload,
      process.env.JWT_SECRET_KEY!,
      {
        expiresIn: "15m",
      }
    );
    return {
      access_token,
    };
  }
}
