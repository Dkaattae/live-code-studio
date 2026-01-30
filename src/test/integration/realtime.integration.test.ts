import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testSupabase, cleanupTestSessions } from './setup';

describe('Real-time Integration Tests', () => {
    let testSessionId: string;

    beforeEach(async () => {
        await cleanupTestSessions();

        // Create a test session
        const { data } = await testSupabase
            .from('interview_sessions')
            .insert({ language: 'javascript', code: '// initial' })
            .select()
            .single();

        testSessionId = data!.id;
    });

    afterEach(async () => {
        await cleanupTestSessions();
    });

    describe('Session Subscriptions', () => {
        it('should receive updates when session code changes', async () => {
            return new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout waiting for real-time update'));
                }, 10000);

                let updateReceived = false;

                // Subscribe to changes
                const channel = testSupabase
                    .channel(`test-session-${testSessionId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'interview_sessions',
                            filter: `id=eq.${testSessionId}`,
                        },
                        (payload) => {
                            if (!updateReceived) {
                                updateReceived = true;
                                expect(payload.new).toBeDefined();
                                expect((payload.new as any).code).toBe('// updated code');
                                clearTimeout(timeout);
                                testSupabase.removeChannel(channel);
                                resolve();
                            }
                        }
                    )
                    .subscribe(async (status) => {
                        if (status === 'SUBSCRIBED') {
                            // Update the session after subscription is ready
                            await testSupabase
                                .from('interview_sessions')
                                .update({ code: '// updated code' })
                                .eq('id', testSessionId);
                        }
                    });
            });
        });

        it('should receive updates when session language changes', async () => {
            return new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout waiting for real-time update'));
                }, 10000);

                let updateReceived = false;

                const channel = testSupabase
                    .channel(`test-lang-${testSessionId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'interview_sessions',
                            filter: `id=eq.${testSessionId}`,
                        },
                        (payload) => {
                            if (!updateReceived) {
                                updateReceived = true;
                                expect((payload.new as any).language).toBe('python');
                                clearTimeout(timeout);
                                testSupabase.removeChannel(channel);
                                resolve();
                            }
                        }
                    )
                    .subscribe(async (status) => {
                        if (status === 'SUBSCRIBED') {
                            await testSupabase
                                .from('interview_sessions')
                                .update({ language: 'python' })
                                .eq('id', testSessionId);
                        }
                    });
            });
        });

        it('should handle multiple subscribers to the same session', async () => {
            const updates: any[] = [];

            return new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout waiting for real-time updates'));
                }, 10000);

                let subscriber1Ready = false;
                let subscriber2Ready = false;

                // First subscriber
                const channel1 = testSupabase
                    .channel(`test-multi-1-${testSessionId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'interview_sessions',
                            filter: `id=eq.${testSessionId}`,
                        },
                        (payload) => {
                            updates.push({ subscriber: 1, payload: payload.new });
                            checkCompletion();
                        }
                    )
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            subscriber1Ready = true;
                            triggerUpdate();
                        }
                    });

                // Second subscriber
                const channel2 = testSupabase
                    .channel(`test-multi-2-${testSessionId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'interview_sessions',
                            filter: `id=eq.${testSessionId}`,
                        },
                        (payload) => {
                            updates.push({ subscriber: 2, payload: payload.new });
                            checkCompletion();
                        }
                    )
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            subscriber2Ready = true;
                            triggerUpdate();
                        }
                    });

                async function triggerUpdate() {
                    if (subscriber1Ready && subscriber2Ready) {
                        await testSupabase
                            .from('interview_sessions')
                            .update({ code: '// multi-subscriber test' })
                            .eq('id', testSessionId);
                    }
                }

                function checkCompletion() {
                    if (updates.length >= 2) {
                        expect(updates).toHaveLength(2);
                        expect(updates[0].payload.code).toBe('// multi-subscriber test');
                        expect(updates[1].payload.code).toBe('// multi-subscriber test');
                        clearTimeout(timeout);
                        testSupabase.removeChannel(channel1);
                        testSupabase.removeChannel(channel2);
                        resolve();
                    }
                }
            });
        });
    });

    describe('Presence Tracking', () => {
        it('should track user presence', async () => {
            return new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout waiting for presence sync'));
                }, 10000);

                const userId = 'test-user-1';
                const channel = testSupabase.channel(`presence-test-${testSessionId}`, {
                    config: { presence: { key: userId } },
                });

                channel
                    .on('presence', { event: 'sync' }, () => {
                        const state = channel.presenceState();
                        const users = Object.keys(state);

                        if (users.length > 0) {
                            expect(users).toContain(userId);
                            clearTimeout(timeout);
                            testSupabase.removeChannel(channel);
                            resolve();
                        }
                    })
                    .subscribe(async (status) => {
                        if (status === 'SUBSCRIBED') {
                            await channel.track({
                                user_id: userId,
                                online_at: new Date().toISOString()
                            });
                        }
                    });
            });
        });

        it('should track multiple users in the same session', async () => {
            return new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout waiting for presence sync'));
                }, 10000);

                const user1Id = 'test-user-1';
                const user2Id = 'test-user-2';

                const channel1 = testSupabase.channel(`presence-multi-1-${testSessionId}`, {
                    config: { presence: { key: user1Id } },
                });

                const channel2 = testSupabase.channel(`presence-multi-2-${testSessionId}`, {
                    config: { presence: { key: user2Id } },
                });

                let user1Tracked = false;
                let user2Tracked = false;

                channel1
                    .on('presence', { event: 'sync' }, () => {
                        const state = channel1.presenceState();
                        const users = Object.keys(state);

                        if (users.includes(user1Id) && users.includes(user2Id)) {
                            expect(users).toHaveLength(2);
                            clearTimeout(timeout);
                            testSupabase.removeChannel(channel1);
                            testSupabase.removeChannel(channel2);
                            resolve();
                        }
                    })
                    .subscribe(async (status) => {
                        if (status === 'SUBSCRIBED') {
                            user1Tracked = true;
                            await channel1.track({
                                user_id: user1Id,
                                online_at: new Date().toISOString()
                            });
                            trackUser2();
                        }
                    });

                function trackUser2() {
                    if (user1Tracked && !user2Tracked) {
                        channel2.subscribe(async (status) => {
                            if (status === 'SUBSCRIBED') {
                                user2Tracked = true;
                                await channel2.track({
                                    user_id: user2Id,
                                    online_at: new Date().toISOString()
                                });
                            }
                        });
                    }
                }
            });
        });

        it('should detect when a user leaves', async () => {
            return new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout waiting for presence leave'));
                }, 10000);

                const userId = 'test-user-leave';
                const channel = testSupabase.channel(`presence-leave-${testSessionId}`, {
                    config: { presence: { key: userId } },
                });

                let hasJoined = false;

                channel
                    .on('presence', { event: 'join' }, () => {
                        hasJoined = true;
                    })
                    .on('presence', { event: 'leave' }, () => {
                        if (hasJoined) {
                            clearTimeout(timeout);
                            resolve();
                        }
                    })
                    .subscribe(async (status) => {
                        if (status === 'SUBSCRIBED') {
                            await channel.track({
                                user_id: userId,
                                online_at: new Date().toISOString()
                            });

                            // Untrack after a short delay
                            setTimeout(async () => {
                                await channel.untrack();
                                testSupabase.removeChannel(channel);
                            }, 500);
                        }
                    });
            });
        });
    });
});
