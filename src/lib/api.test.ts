import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/lib/api';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'test-session-id',
              code: '// Test code',
              language: 'javascript',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'test-session-id',
              code: '// Test code',
              language: 'javascript',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

describe('API Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a session with default language', async () => {
      const session = await api.createSession();
      
      expect(session).toBeDefined();
      expect(session.id).toBe('test-session-id');
      expect(session.language).toBe('javascript');
    });

    it('should create a session with specified language', async () => {
      const session = await api.createSession('python');
      
      expect(session).toBeDefined();
    });
  });

  describe('getSession', () => {
    it('should retrieve an existing session', async () => {
      const session = await api.getSession('test-session-id');
      
      expect(session).toBeDefined();
      expect(session?.id).toBe('test-session-id');
    });
  });

  describe('updateSessionCode', () => {
    it('should update session code without throwing', async () => {
      await expect(
        api.updateSessionCode('test-session-id', 'new code')
      ).resolves.not.toThrow();
    });
  });

  describe('updateSessionLanguage', () => {
    it('should update session language without throwing', async () => {
      await expect(
        api.updateSessionLanguage('test-session-id', 'typescript')
      ).resolves.not.toThrow();
    });
  });

  describe('subscribeToSession', () => {
    it('should return an unsubscribe function', () => {
      const unsubscribe = api.subscribeToSession('test-session-id', vi.fn());
      
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('subscribeToPresence', () => {
    it('should return an unsubscribe function', () => {
      const unsubscribe = api.subscribeToPresence(
        'test-session-id',
        'test-user-id',
        vi.fn()
      );
      
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
