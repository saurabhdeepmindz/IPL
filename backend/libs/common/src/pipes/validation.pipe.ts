/**
 * @file    validation.pipe.ts
 * @module  CommonModule
 *
 * @description
 * Checks every request body against its DTO. In plain words: it collects all field errors and returns them together with status 422.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-04
 */

import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { FieldError } from '../errors/app.exception';
import { ValidationFailedException } from '../errors/validation-failed.exception';

/**
 * Validation pipe.
 *
 * In plain words: a form with three mistakes gets three messages in one answer, not one at a time.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   every back-end story
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Injectable()
export class AllFieldsValidationPipe implements PipeTransform {
  /**
   * Validate one argument.
   *
   * In plain words: returns the checked object, or throws a 422 listing every problem.
   *
   * @param value The raw argument
   * @param metadata Says which DTO class to check against
   * @returns The DTO instance (unknown fields removed)
   * @throws ValidationFailedException 422 VALIDATION_FAILED with every field error
   * @dependencies class-transformer.plainToInstance, class-validator.validate
   */
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this.needsCheck(metatype) || value === undefined || value === null) return value;
    const object = plainToInstance(metatype, value);
    const errors = await validate(object as object, { whitelist: true, forbidUnknownValues: false });
    if (errors.length > 0) throw new ValidationFailedException(this.flatten(errors));
    return object;
  }

  private needsCheck(metatype: unknown): boolean {
    return ![String, Boolean, Number, Array, Object].includes(metatype as never);
  }

  private flatten(errors: ValidationError[], parent = ''): FieldError[] {
    return errors.flatMap((e) => {
      const field = parent ? `${parent}.${e.property}` : e.property;
      const own = Object.values(e.constraints ?? {}).map((message) => ({ field, message }));
      return [...own, ...this.flatten(e.children ?? [], field)];
    });
  }
}
