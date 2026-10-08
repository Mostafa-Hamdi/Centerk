import { describe, expect, it, vi } from 'vitest';
import { normalizeMe } from './normalizeMe';

const jwt = (claims: object) =>
  `x.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.sig`;

describe('normalizeMe', () => {
  it('keeps the spec shape as-is', () => {
    const me = normalizeMe(
      {
        id: 'u1',
        fullName: 'أحمد سامي',
        phone: '+201000000001',
        kind: 'Staff',
        isOwner: true,
        roles: [{ id: 'r1', name: 'Owner' }],
        tenant: { id: 't1', name: 'سنتر', plan: 'Pro' },
        branches: [{ id: 'b1', name: 'سموحة' }],
        permissions: ['students.view'],
        dataScope: 'AllBranches',
        hidePhones: false,
      },
      null,
    );
    expect(me).toMatchObject({
      fullName: 'أحمد سامي',
      isOwner: true,
      branches: [{ id: 'b1', name: 'سموحة' }],
    });
    expect(me.tenant.plan).toBe('Pro');
  });

  it('never throws on a different shape and fills gaps from the token (the login bug)', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const token = jwt({
      sub: 'u9',
      name: 'منى سمير',
      tenant_id: 't9',
      branch_ids: ['b1', 'b2'],
      role: 'Owner',
      plan: 'Center',
    });
    const me = normalizeMe({ profile: { displayName: 'منى سمير' } }, token);
    expect(me.fullName).toBe('منى سمير');
    expect(me.isOwner).toBe(true);
    expect(me.roles[0]?.name).toBe('المالك');
    expect(me.branches.map((branch) => branch.id)).toEqual(['b1', 'b2']);
    expect(me.tenant).toMatchObject({ id: 't9', plan: 'Center' });
    expect(me.kind).toBe('Staff');
  });

  it('detects guardian accounts and non-owner roles', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(normalizeMe({ name: 'إبراهيم', roles: ['Guardian'] }, null).kind).toBe('Guardian');
    expect(normalizeMe({ name: 'كريم', roles: ['Teacher'] }, null).isOwner).toBe(false);
  });

  it('survives a null body', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(normalizeMe(null, null)).toMatchObject({
      fullName: 'مستخدم',
      branches: [],
      permissions: [],
    });
  });
});
