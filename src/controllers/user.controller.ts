import { Controller } from "../core/decorators/controller.decorator";
import { Delete, Get, Post } from "../core/decorators/method.decorator";
import { Body, Param, Req } from "../core/decorators/param.decorator";
import { Request } from "../core/utils/types";
import { Protected } from "../decorators/protected.decorator";
import { UserService } from "../services/user.service";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @Protected()
  create(@Body() body: any) {
    return this.userService.create(body);
  }

  @Get()
  @Protected()
  find(@Req() req: Request) {
    return this.userService.find();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Delete(":id")
  @Protected()
  delete(@Param("id") id: string) {
    return this.userService.delete(id);
  }
}
