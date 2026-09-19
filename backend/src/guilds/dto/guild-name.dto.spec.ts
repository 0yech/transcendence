import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GuildNameDto } from './guild-name.dto';

/** Returns the names of the rules a payload breaks, e.g. `isLength`. */
async function brokenRules(payload: object) {
  const errors = await validate(plainToInstance(GuildNameDto, payload));
  return errors.flatMap((error) => Object.keys(error.constraints ?? {}));
}

describe('GuildNameDto', () => {
  it('accepts a valid name', async () => {
    expect(await brokenRules({ name: 'My Guild_1-2' })).toEqual([]);
  });

  it('accepts names at the length limits', async () => {
    expect(await brokenRules({ name: 'abc' })).toEqual([]);
    expect(await brokenRules({ name: 'a'.repeat(20) })).toEqual([]);
  });

  it('rejects a name that is not a string', async () => {
    expect(await brokenRules({ name: 123 })).toContain('isString');
  });

  it('rejects a missing name', async () => {
    expect(await brokenRules({})).toContain('isNotEmpty');
  });

  it('rejects a name that is too short', async () => {
    expect(await brokenRules({ name: 'ab' })).toEqual(['isLength']);
  });

  it('rejects a name that is too long', async () => {
    expect(await brokenRules({ name: 'a'.repeat(21) })).toEqual(['isLength']);
  });

  it('rejects characters outside the allowed set', async () => {
    expect(await brokenRules({ name: 'Bad!Name' })).toEqual(['matches']);
  });

  it('trims before checking the length', async () => {
    expect(await brokenRules({ name: '  ab  ' })).toEqual(['isLength']);
  });

  it('trims the name', () => {
    const dto = plainToInstance(GuildNameDto, { name: '  My Guild  ' });

    expect(dto.name).toBe('My Guild');
  });
});
