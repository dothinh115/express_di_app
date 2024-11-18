import { Field, ID, ObjectType } from "type-graphql";
import { User } from "./user";

@ObjectType()
export class Post {
  @Field((type) => ID)
  _id: string;

  @Field()
  content: string;

  @Field()
  title: string;

  @Field()
  authorId: string;

  @Field((type) => User)
  author: User;
}
