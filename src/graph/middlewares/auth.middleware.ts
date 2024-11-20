import {
  getMetadataStorage,
  MiddlewareInterface,
  NextFn,
  ResolverData,
} from "type-graphql";
import { Injectable } from "../../core/decorators/injectable.decorator";
import { getMetadata } from "../../core/metadata/metadata";
import { PROTECTED_METADATA_KEY } from "../../utils/constant";
import { Inject } from "../../core/decorators/param.decorator";
import { User } from "../../db/models/user.model";
import jsonwebtoken from "jsonwebtoken";
import { UnAuthorizedException } from "../../core/base/error.base";

@Injectable()
export class AuthGraphMiddleware implements MiddlewareInterface {
  constructor(@Inject(User) private userModel: typeof User) {}

  async use(action: ResolverData<any>, next: NextFn) {
    const { context, info } = action;
    const isRootResolver =
      info.parentType.name === "Query" || info.parentType.name === "Mutation";
    const key = info.parentType.name === "Query" ? "queries" : "mutations";
    if (isRootResolver) {
      const metadataStorage = getMetadataStorage();
      const resolverClass = metadataStorage[key].find(
        (metadata) => metadata.methodName === info.fieldName
      )?.target;
      const isProtected =
        getMetadata(
          PROTECTED_METADATA_KEY,
          resolverClass?.prototype[info.fieldName]
        ) ?? getMetadata(PROTECTED_METADATA_KEY, resolverClass);
      if (!isProtected) {
        return next();
      }
      const token = context.req.headers.authorization?.split("Bearer ")[1];

      try {
        let user: any = jsonwebtoken.decode(token);
        user = await this.userModel.findById(user._id).lean();
        context.user = user;
      } catch (error) {
        throw new UnAuthorizedException();
      }
    }
    return next();
  }
}
