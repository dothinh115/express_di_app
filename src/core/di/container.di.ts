export type Constructor<T> = new (...args: any) => T;

export class Container {
  services = new Map<string, Constructor<any>>();
  registered = new Map<string, any>();

  register(constructor: Constructor<any>) {
    this.services.set(constructor.name, constructor);
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
    const dependencies = paramTypes.map((param: Constructor<any>) => {
      this.register(param);
      return this.get(param);
    });

    const instance = new service(...dependencies);
    this.registered.set(service.name, instance);
    return instance;
  }
}
