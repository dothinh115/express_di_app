export const combinePaths = (...paths: string[]) => {
  return (
    "/" +
    paths
      .filter((path) => path !== "")
      .map((path) => path.replace(/^\/+|\/$/g, ""))
      .join("/")
  );
};
