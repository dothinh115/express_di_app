import { User } from "../db/models/user.model";
import { Injectable } from "../decorators/injectable.decorator";
import { Inject } from "../decorators/param.decorator";

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
