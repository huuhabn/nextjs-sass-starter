import { describe, expect, it } from 'vitest';

import { UserPreferenceSchema } from './preference';

describe('UserPreferenceSchema', () => {
  it.each([['sidebarHiddenAgentIds'], ['sidebarHiddenGroupIds']])(
    'preserves %s instead of stripping it',
    (key) => {
      const parsed = UserPreferenceSchema.parse({ telemetry: null, [key]: ['id-1', 'id-2'] });

      expect(parsed).toMatchObject({ [key]: ['id-1', 'id-2'] });
    }
  );

  it('preserves the workspace rail order instead of stripping it', () => {
    const parsed = UserPreferenceSchema.parse({
      telemetry: null,
      workspace: { order: ['ws-2', 'ws-1'] }
    });

    expect(parsed).toMatchObject({ workspace: { order: ['ws-2', 'ws-1'] } });
  });
});
