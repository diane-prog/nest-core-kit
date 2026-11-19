import { validate } from 'class-validator';
import { IsPasswordMatch } from './is-password-match.validator';

class TestDto {
  password: string;

  @IsPasswordMatch('password')
  confirmPassword: string;

  constructor(password: string, confirmPassword: string) {
    this.password = password;
    this.confirmPassword = confirmPassword;
  }
}

class TestDtoWithCustomMessage {
  password: string;

  @IsPasswordMatch('password', {
    message: 'Les mots de passe ne correspondent pas',
  })
  confirmPassword: string;

  constructor(password: string, confirmPassword: string) {
    this.password = password;
    this.confirmPassword = confirmPassword;
  }
}

describe('IsPasswordMatch Validator', () => {
  it('should pass validation when passwords match', async () => {
    const instance = new TestDto('secret123', 'secret123');
    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when passwords do not match', async () => {
    const instance = new TestDto('secret123', 'wrongpassword');
    const errors = await validate(instance);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('isPasswordMatch');
    expect(errors[0].constraints?.isPasswordMatch).toBe(
      'confirmPassword must match password',
    );
  });

  it('should use custom message when provided', async () => {
    const instance = new TestDtoWithCustomMessage('secret123', 'wrong');
    const errors = await validate(instance);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isPasswordMatch).toBe(
      'Les mots de passe ne correspondent pas',
    );
  });
});
