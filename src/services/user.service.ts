import { Injectable } from "../core/decorators/injectable.decorator";
import { Inject } from "../core/decorators/param.decorator";
import { User } from "../db/models/user.model";

@Injectable()
export class UserService {
  constructor(@Inject(User) private userModel: typeof User) {}
  async create(body: any) {
    return await this.userModel.create(body);
  }

  async find() {
    return await this.userModel.find();
  }
}
