import * as regex from './regex';

describe('regex tests', () => {
  it('regex contains the correct values', () => {
    expect(regex).toEqual({
      FIRST_NAME_REGEX: '^[a-zA-Z]+$',
    });
  });
});
