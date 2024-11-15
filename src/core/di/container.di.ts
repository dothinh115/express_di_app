import { PARAM_METADATA_KEY, USE_PIPES_METADATA_KEY } from "../utils/constant";
import { getMetadata } from "../metadata/metadata";
import { defaultMethods } from "../utils/common";

export type Constructor<T> = new (...args: any) => T;

export class Container {
  services = new Map<string, Constructor<any>>();
  registered = new Map<string, any>();

  register(constructor: Constructor<any>) {
    if (!this.services.has(constructor.name)) {
      this.services.set(constructor.name, constructor);
    }
  }

  get<T>(constructor: Constructor<T>): T {
    const service = this.services.get(constructor.name);
    if (!service) {
      throw Error(`${constructor.name} chưa được đăng ký`);
    }

    if (this.registered.has(service.name)) {
      return this.registered.get(service.name);
    }

    const paramTypes = Reflect.getMetadata("design:paramtypes", service) ?? [];
    // Quản lý phụ thuộc bằng DI
    let dependencies = paramTypes.map((param: Constructor<any>) => {
      this.register(param);
      return this.get(param);
    });

    // Replace constructor param bằng decorator
    dependencies = dependencies.map((dependency: any, index: number) => {
      const shouldReplaced = getMetadata(PARAM_METADATA_KEY, service, index);
      if (shouldReplaced) {
        try {
          new shouldReplaced.value();
          this.register(shouldReplaced.value);
          return this.get(shouldReplaced.value);
        } catch (error) {
          return shouldReplaced.value;
        }
      }
      return dependency;
    });

    // Replace method param bằng decorator
    const methods = Object.getOwnPropertyNames(service.prototype).filter(
      (method) => !defaultMethods.includes(method)
    );
    methods.forEach((method) => {
      if (typeof service.prototype[method] === "function") {
        const paramTypes =
          Reflect.getMetadata("design:paramtypes", service.prototype, method) ??
          [];

        if (paramTypes.length === 0) return;

        const originalMethod = service.prototype[method];

        const pipe =
          getMetadata(USE_PIPES_METADATA_KEY, service.prototype[method]) ??
          getMetadata(USE_PIPES_METADATA_KEY, service);

        const self = this;

        service.prototype[method] = async function (...args: any[]) {
          const [req, res, next] = args;
          const paramMetadatas = paramTypes
            .map((paramType: any, index: number) => {
              const paramMetadata = getMetadata(
                PARAM_METADATA_KEY,
                service.prototype[method],
                index
              );
              if (paramMetadata) {
                return { ...paramMetadata, index };
              }
              return undefined;
            })
            .filter((paramType: any) => paramType !== undefined);

          for (const paramMetadata of paramMetadatas) {
            let result = paramMetadata.value(req, res, next);
            const index = paramMetadata.index;
            const paramType = paramTypes[index];
            if (pipe) {
              self.register(pipe);
              const pipeInstance = self.get<any>(pipe);
              if (typeof pipeInstance.transform === "function") {
                try {
                  result = await pipeInstance.transform(result, paramType);
                } catch (error) {
                  throw error;
                }
              }
            }
            args[paramMetadata.index] = result;
          }
          return await originalMethod.apply(this, args);
        };
        Object.defineProperty(service.prototype[method], "name", {
          value: originalMethod.name,
        });
        const keys = Reflect.getMetadataKeys(originalMethod);
        keys.forEach((key) => {
          const value = Reflect.getMetadata(key, originalMethod);
          Reflect.defineMetadata(key, value, service.prototype[method]);
        });
        Object.entries(originalMethod).forEach(([key, value]) => {
          service.prototype[method][key] = value;
        });
      }
    });

    const instance = new service(...dependencies);

    if (typeof instance.onInit === "function") {
      instance.onInit();
    }
    this.registered.set(service.name, instance);
    return instance;
  }
}
