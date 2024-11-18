import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field((type) => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  age: number;

  @Field()
  password: string;
}
