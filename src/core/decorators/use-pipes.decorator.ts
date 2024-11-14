import { Constructor } from "../di/container.di";
import { setMetadata } from "../metadata/metadata";
import { USE_PIPES_METADATA_KEY } from "../utils/constant";

export const UsePipes = (
  constructors: Constructor<any>
): ClassDecorator & MethodDecorator =>
  setMetadata(USE_PIPES_METADATA_KEY, constructors);
