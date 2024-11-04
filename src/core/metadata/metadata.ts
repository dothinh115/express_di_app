export const setMetadata = (
  key: string | symbol,
  value: any
): ClassDecorator & MethodDecorator & ParameterDecorator => {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptorOrParamIndex?: PropertyDescriptor | number
  ) => {
    if (propertyKey && typeof descriptorOrParamIndex === "number") {
      // Param decorator cho method
      if (!target[propertyKey].paramMetadata) {
        target[propertyKey].paramMetadata = [];
      }
      target[propertyKey].paramMetadata[descriptorOrParamIndex] = {
        key,
        value,
      };
    } else if (!propertyKey && typeof descriptorOrParamIndex === "number") {
      // Param decorator cho constructor
      if (!target.paramMetadata) {
        target.paramMetadata = [];
      }
      target.paramMetadata[descriptorOrParamIndex] = {
        key,
        value,
      };
    } else if (propertyKey && descriptorOrParamIndex) {
      // Method decorator
      const descriptor = descriptorOrParamIndex as PropertyDescriptor;
      if (!descriptor.value.metadata) {
        descriptor.value.metadata = {};
      }
      descriptor.value.metadata[key] = value;
    } else {
      // Class decorator
      if (!target.metadata) {
        target.metadata = {};
      }
      target.metadata[key] = value;
    }
  };
};

export const getMetadata = (
  key: string | symbol,
  target: any,
  paramIndex?: number
) => {
  if (paramIndex !== undefined && target.paramMetadata) {
    return target.paramMetadata[paramIndex];
  } else if (target.metadata) {
    return target.metadata[key];
  }
  return undefined;
};

export const getAllMetadata = (target: any) => {
  if (target.metadata) {
    return target.metadata;
  }
  return undefined;
};
