import { plainToInstance } from "class-transformer";
import { AppPipes } from "../core/base/pipe.base";
import { Injectable } from "../core/decorators/injectable.decorator";
import { validate } from "class-validator";
import { BadRequestException } from "../core/base/error.base";

@Injectable()
export class ValidationPipe implements AppPipes {
  async transform(value: any, type: any): Promise<any> {
    if (typeof type !== "function" || !this.isDto(type)) {
      return value;
    }

    value = plainToInstance(type, value);

    const errors = await validate(value, { whitelist: true });
    if (errors.length > 0) {
      const errorMessages = errors.flatMap((error) => {
        if (!error.constraints) return;
        return Object.entries(error.constraints).map(([key, value]) => value);
      });
      throw new BadRequestException(errorMessages);
    }

    return value;
  }

  private isDto(type: any) {
    const excludedTypes = [Object, Number, String, Array, Boolean];
    return !excludedTypes.includes(type);
  }
}
