import { Field, InputType } from "type-graphql";

@InputType()
export class CreatePostInputType {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  authorId: string;
}
