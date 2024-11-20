import {
  Arg,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Post } from "../types/post";
import { PostGService } from "../services/post.service";
import { CreatePostInputType } from "../input-types/create-post";
import { User } from "../types/user";
import { Protected } from "../../decorators/protected.decorator";

@Resolver(() => Post)
export class PostResolver {
  constructor(private postService: PostGService) {}

  @Query(() => [Post])
  @Protected()
  post() {
    return this.postService.find();
  }

  @Mutation(() => Post)
  createPost(@Arg("data") data: CreatePostInputType) {
    return this.postService.create(data);
  }

  @FieldResolver(() => User, { name: "author" })
  author(@Root() post: Post) {
    return this.postService.user(post.authorId);
  }
}
