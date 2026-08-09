import { redactSensitiveData, REDACTED } from './sensitive-data.filter';

describe('redactSensitiveData', () => {
  it('givenPrimitiveValues_whenRedacting_thenReturnsThemUnchanged', () => {
    expect(redactSensitiveData(42)).toBe(42);
    expect(redactSensitiveData(true)).toBe(true);
    expect(redactSensitiveData(null)).toBeNull();
    expect(redactSensitiveData(undefined)).toBeUndefined();
  });

  it('givenShortNonSensitiveString_whenRedacting_thenReturnsItUnchanged', () => {
    expect(redactSensitiveData('hello world')).toBe('hello world');
  });

  it.each(['token', 'accessToken', 'refreshToken', 'password', 'passwd', 'secret', 'clientSecret', 'authorization', 'credential'])(
    'givenKey_%s_whenRedactingObject_thenValueIsRedactedRegardlessOfContent',
    (key) => {
      const result = redactSensitiveData({ [key]: 'super-sensitive-value' }) as Record<string, unknown>;

      expect(result[key]).toBe(REDACTED);
    },
  );

  it.each(['cv', 'CV', 'curriculumVitae', 'resume', 'coverLetter', 'profileBody', 'fullProfile'])(
    'givenDomainSpecificKey_%s_whenRedactingObject_thenValueIsRedacted',
    (key) => {
      const result = redactSensitiveData({ [key]: 'a very long cv body that should never be logged' }) as Record<
        string,
        unknown
      >;

      expect(result[key]).toBe(REDACTED);
    },
  );

  it('givenNestedObjectWithSensitiveField_whenRedacting_thenOnlyThatFieldIsRedacted', () => {
    const input = {
      email: 'jane.doe@example.com',
      loginForm: { password: 'p@ssw0rd', username: 'jane' },
    };

    const result = redactSensitiveData(input) as Record<string, unknown>;

    expect(result['email']).toBe('jane.doe@example.com');
    expect((result['loginForm'] as Record<string, unknown>)['password']).toBe(REDACTED);
    expect((result['loginForm'] as Record<string, unknown>)['username']).toBe('jane');
  });

  it('givenObjectKeyItselfLooksSensitive_whenRedacting_thenTheWholeValueIsRedactedWithoutBeingWalked', () => {
    const result = redactSensitiveData({ credentials: { password: 'p@ssw0rd', username: 'jane' } }) as Record<
      string,
      unknown
    >;

    expect(result['credentials']).toBe(REDACTED);
  });

  it('givenArrayContainingSensitiveObjects_whenRedacting_thenRedactsEachElement', () => {
    const result = redactSensitiveData([{ token: 'abc' }, { note: 'ok' }]) as Record<string, unknown>[];

    expect(result[0]['token']).toBe(REDACTED);
    expect(result[1]['note']).toBe('ok');
  });

  it('givenJwtShapedStringUnderAnInnocuousKey_whenRedacting_thenValueIsRedacted', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PYE9J7z0Y_Do';

    const result = redactSensitiveData({ value: jwt }) as Record<string, unknown>;

    expect(result['value']).toBe(REDACTED);
  });

  it('givenVeryLongStringUnderAnInnocuousKey_whenRedacting_thenTruncatesRatherThanLogsInFull', () => {
    const cvBody = 'A'.repeat(1000);

    const result = redactSensitiveData({ data: cvBody }) as Record<string, unknown>;

    expect(result['data']).toBe('[TRUNCATED 1000 chars]');
    expect(result['data']).not.toContain('AAAA');
  });

  it('givenNonPlainObject_whenRedacting_thenReturnsAnOpaqueMarkerInsteadOfWalkingIt', () => {
    const result = redactSensitiveData(new Date()) as string;

    expect(result).toBe('[Date]');
  });

  it('givenFormData_whenRedacting_thenDoesNotThrowAndReturnsOpaqueMarker', () => {
    const formData = new FormData();
    formData.append('cv', 'binary-content');

    const result = redactSensitiveData(formData);

    expect(result).toBe('[FormData]');
  });
});
