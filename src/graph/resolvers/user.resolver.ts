import { Query, Resolver } from "type-graphql";
import { User } from "../types/user";
import { UserGService } from "../services/user.service";

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserGService) {}

  @Query(() => [User])
  user() {
    return this.userService.find();
  }
}
