import { Controller } from "../core/decorators/controller.decorator";
import { Get } from "../core/decorators/method.decorator";
import { Param } from "../core/decorators/param.decorator";

@Controller("static")
export class StaticController {
  @Get(":id")
  find(@Param("id") id: string) {
    return id;
  }
}
