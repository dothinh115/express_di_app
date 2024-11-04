export const Body = (): ParameterDecorator => {
  return (
    target: any,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) => {};
};
