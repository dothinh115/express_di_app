import { Controller } from "../core/decorators/controller.decorator";
import { Post } from "../core/decorators/method.decorator";
import { Req } from "../core/decorators/param.decorator";
import { Request } from "../core/utils/types";

@Controller("upload")
export class UploadController {
  @Post()
  create(@Req() req: Request) {
    return req.file;
  }
}
