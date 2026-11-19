import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Décorateur de validation class-validator vérifiant que la valeur de la propriété
 * est identique à celle d'une autre propriété (ex: confirmPassword vs password).
 *
 * Issu de l'architecture Finanx.
 *
 * Exemple :
 *   class RegisterDto {
 *     @IsString()
 *     password: string;
 *
 *     @IsPasswordMatch('password', { message: 'Les mots de passe ne correspondent pas.' })
 *     confirmPassword: string;
 *   }
 */
export function IsPasswordMatch(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPasswordMatch',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${propertyName} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}
