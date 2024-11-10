export const combinePaths = (...paths: string[]) => {
  return (
    "/" +
    paths
      .filter((path) => path !== "" && path !== "/")
      .map((path) => path.replace(/^\/+|\/$/g, ""))
      .join("/")
  );
};

export const defaultMethods = [
  "constructor",
  "toString",
  "valueOf",
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "__proto__",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__",
  "onInit",
];
