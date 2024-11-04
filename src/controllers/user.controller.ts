import { BadRequestException } from "../core/base/error.base";
import { Controller } from "../decorators/controller.decorator";
import { Get, Post } from "../decorators/method.decorator";
import { UserService } from "../services/user.service";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create() {
    return this.userService.create();
  }

  @Get()
  find() {
    // throw new BadRequestException("test lỗi");
    return "all users";
  }

  @Get(":id") // /user/:id
  findById() {}
}
