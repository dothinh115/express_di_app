import { setMetadata } from "../core/metadata/metadata";
import { PROTECTED_METADATA_KEY } from "../utils/constant";

export const Protected = (): MethodDecorator & ClassDecorator =>
  setMetadata(PROTECTED_METADATA_KEY, true);
