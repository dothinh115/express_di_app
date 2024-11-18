import { Injectable } from "../../core/decorators/injectable.decorator";
import { Inject } from "../../core/decorators/param.decorator";
import { User } from "../../db/models/user.model";

@Injectable()
export class UserGService {
  constructor(@Inject(User) private userModel: typeof User) {}

  async find() {
    return await this.userModel.find().lean();
  }
}
