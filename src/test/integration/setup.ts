import "@testing-library/jest-dom";
import { createClient } from "@supabase/supabase-js";

// Setup test Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

export const testSupabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility to clean up test data
export async function cleanupTestSessions() {
    const { error } = await testSupabase
        .from('interview_sessions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all test sessions

    if (error && error.code !== 'PGRST116') {
        console.warn('Cleanup warning:', error.message);
    }
}

// Mock matchMedia for tests
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => { },
    }),
});
