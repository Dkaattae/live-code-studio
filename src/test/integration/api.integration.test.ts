import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testSupabase, cleanupTestSessions } from './setup';

describe('API Integration Tests', () => {
    let testSessionId: string;

    beforeEach(async () => {
        // Clean up before each test
        await cleanupTestSessions();
    });

    afterEach(async () => {
        // Clean up after each test
        await cleanupTestSessions();
    });

    describe('Session CRUD Operations', () => {
        it('should create a new session', async () => {
            const { data, error } = await testSupabase
                .from('interview_sessions')
                .insert({ language: 'javascript', code: '// Test code' })
                .select()
                .single();

            expect(error).toBeNull();
            expect(data).toBeDefined();
            expect(data?.language).toBe('javascript');
            expect(data?.code).toBe('// Test code');
            expect(data?.id).toBeDefined();

            testSessionId = data!.id;
        });

        it('should retrieve an existing session', async () => {
            // First create a session
            const { data: created } = await testSupabase
                .from('interview_sessions')
                .insert({ language: 'python', code: 'print("hello")' })
                .select()
                .single();

            testSessionId = created!.id;

            // Then retrieve it
            const { data, error } = await testSupabase
                .from('interview_sessions')
                .select('*')
                .eq('id', testSessionId)
                .single();

            expect(error).toBeNull();
            expect(data).toBeDefined();
            expect(data?.id).toBe(testSessionId);
            expect(data?.language).toBe('python');
            expect(data?.code).toBe('print("hello")');
        });

        it('should update session code', async () => {
            // Create a session
            const { data: created } = await testSupabase
                .from('interview_sessions')
                .insert({ language: 'javascript', code: 'const x = 1;' })
                .select()
                .single();

            testSessionId = created!.id;

            // Update the code
            const newCode = 'const x = 2;\nconsole.log(x);';
            const { error: updateError } = await testSupabase
                .from('interview_sessions')
                .update({ code: newCode })
                .eq('id', testSessionId);

            expect(updateError).toBeNull();

            // Verify the update
            const { data: updated } = await testSupabase
                .from('interview_sessions')
                .select('*')
                .eq('id', testSessionId)
                .single();

            expect(updated?.code).toBe(newCode);
        });

        it('should update session language', async () => {
            // Create a session
            const { data: created } = await testSupabase
                .from('interview_sessions')
                .insert({ language: 'javascript', code: '// code' })
                .select()
                .single();

            testSessionId = created!.id;

            // Update the language
            const { error: updateError } = await testSupabase
                .from('interview_sessions')
                .update({ language: 'typescript' })
                .eq('id', testSessionId);

            expect(updateError).toBeNull();

            // Verify the update
            const { data: updated } = await testSupabase
                .from('interview_sessions')
                .select('*')
                .eq('id', testSessionId)
                .single();

            expect(updated?.language).toBe('typescript');
        });

        it('should handle concurrent updates correctly', async () => {
            // Create a session
            const { data: created } = await testSupabase
                .from('interview_sessions')
                .insert({ language: 'javascript', code: 'initial' })
                .select()
                .single();

            testSessionId = created!.id;

            // Perform multiple updates concurrently
            await Promise.all([
                testSupabase
                    .from('interview_sessions')
                    .update({ code: 'update1' })
                    .eq('id', testSessionId),
                testSupabase
                    .from('interview_sessions')
                    .update({ code: 'update2' })
                    .eq('id', testSessionId),
            ]);

            // Verify final state (one of the updates should win)
            const { data: final } = await testSupabase
                .from('interview_sessions')
                .select('*')
                .eq('id', testSessionId)
                .single();

            expect(final?.code).toMatch(/update[12]/);
        });

        it('should persist data across queries', async () => {
            // Create a session
            const { data: created } = await testSupabase
                .from('interview_sessions')
                .insert({
                    language: 'java',
                    code: 'public class Test { }'
                })
                .select()
                .single();

            testSessionId = created!.id;

            // Query multiple times
            for (let i = 0; i < 3; i++) {
                const { data } = await testSupabase
                    .from('interview_sessions')
                    .select('*')
                    .eq('id', testSessionId)
                    .single();

                expect(data?.language).toBe('java');
                expect(data?.code).toBe('public class Test { }');
            }
        });

        it('should return null for non-existent session', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';

            const { data, error } = await testSupabase
                .from('interview_sessions')
                .select('*')
                .eq('id', fakeId)
                .single();

            expect(error).toBeDefined();
            expect(error?.code).toBe('PGRST116'); // Not found
            expect(data).toBeNull();
        });
    });

    describe('Session Timestamps', () => {
        it('should set created_at on session creation', async () => {
            const beforeCreate = new Date();

            const { data } = await testSupabase
                .from('interview_sessions')
                .insert({ language: 'javascript', code: '// test' })
                .select()
                .single();

            testSessionId = data!.id;
            const afterCreate = new Date();

            const createdAt = new Date(data!.created_at);
            expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
            expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
        });

        it('should update updated_at on session update', async () => {
            // Create a session
            const { data: created } = await testSupabase
                .from('interview_sessions')
                .insert({ language: 'javascript', code: '// initial' })
                .select()
                .single();

            testSessionId = created!.id;
            const initialUpdatedAt = new Date(created!.updated_at);

            // Wait a bit to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 100));

            // Update the session
            await testSupabase
                .from('interview_sessions')
                .update({ code: '// updated' })
                .eq('id', testSessionId);

            // Verify updated_at changed
            const { data: updated } = await testSupabase
                .from('interview_sessions')
                .select('*')
                .eq('id', testSessionId)
                .single();

            const newUpdatedAt = new Date(updated!.updated_at);
            expect(newUpdatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
        });
    });
});
