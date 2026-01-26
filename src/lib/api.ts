import { supabase } from "@/integrations/supabase/client";

export interface InterviewSession {
  id: string;
  code: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export const api = {
  /**
   * Create a new interview session
   */
  async createSession(language: string = 'javascript'): Promise<InterviewSession> {
    const defaultCode = getDefaultCode(language);
    
    const { data, error } = await supabase
      .from('interview_sessions')
      .insert({ language, code: defaultCode })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create session: ${error.message}`);
    return data;
  },

  /**
   * Get a session by ID
   */
  async getSession(id: string): Promise<InterviewSession | null> {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get session: ${error.message}`);
    }
    return data;
  },

  /**
   * Update session code
   */
  async updateSessionCode(id: string, code: string): Promise<void> {
    const { error } = await supabase
      .from('interview_sessions')
      .update({ code })
      .eq('id', id);
    
    if (error) throw new Error(`Failed to update code: ${error.message}`);
  },

  /**
   * Update session language
   */
  async updateSessionLanguage(id: string, language: string): Promise<void> {
    const { error } = await supabase
      .from('interview_sessions')
      .update({ language })
      .eq('id', id);
    
    if (error) throw new Error(`Failed to update language: ${error.message}`);
  },

  /**
   * Subscribe to session changes
   */
  subscribeToSession(
    sessionId: string,
    onUpdate: (session: InterviewSession) => void
  ) {
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'interview_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          onUpdate(payload.new as InterviewSession);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Subscribe to presence (connected users)
   */
  subscribeToPresence(
    sessionId: string,
    userId: string,
    onPresenceChange: (users: string[]) => void
  ) {
    const channel = supabase.channel(`presence-${sessionId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        onPresenceChange(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

function getDefaultCode(language: string): string {
  const templates: Record<string, string> = {
    javascript: `// Welcome to the coding interview!
// Write your solution below

function solution(input) {
  // Your code here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
`,
    typescript: `// Welcome to the coding interview!
// Write your solution below

function solution(input: string): string {
  // Your code here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
`,
    python: `# Welcome to the coding interview!
# Write your solution below

def solution(input):
    # Your code here
    return input

# Test your solution
print(solution("Hello, World!"))
`,
    java: `// Welcome to the coding interview!
// Write your solution below

public class Solution {
    public static String solution(String input) {
        // Your code here
        return input;
    }
    
    public static void main(String[] args) {
        System.out.println(solution("Hello, World!"));
    }
}
`,
    cpp: `// Welcome to the coding interview!
// Write your solution below

#include <iostream>
#include <string>

std::string solution(const std::string& input) {
    // Your code here
    return input;
}

int main() {
    std::cout << solution("Hello, World!") << std::endl;
    return 0;
}
`,
  };

  return templates[language] || templates.javascript;
}
