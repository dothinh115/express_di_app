import { Injectable } from "../decorators/injectable.decorator";
import { CommonService } from "./common.service";

@Injectable()
export class UserService {
  constructor(private commonService: CommonService) {}
  create() {
    console.log("create user");
  }
}
