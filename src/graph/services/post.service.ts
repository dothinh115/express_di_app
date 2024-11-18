import { Injectable } from "../../core/decorators/injectable.decorator";
import { Inject } from "../../core/decorators/param.decorator";
import { Post } from "../../db/models/post.model";
import { User } from "../../db/models/user.model";
import { CreatePostInputType } from "../input-types/create-post";

@Injectable()
export class PostGService {
  constructor(
    @Inject(Post) private postModel: typeof Post,
    @Inject(User) private userModel: typeof User
  ) {}

  async find() {
    return await this.postModel.find().lean();
  }

  async create(data: CreatePostInputType) {
    const newPost = new Post(data);
    return await this.postModel.create(newPost);
  }

  async user(id: string) {
    return await this.userModel.findById(id);
  }
}
