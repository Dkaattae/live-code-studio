import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParticipantIndicator } from '@/components/ParticipantIndicator';
import { TooltipProvider } from '@/components/ui/tooltip';

const renderWithProvider = (component: React.ReactNode) => {
  return render(<TooltipProvider>{component}</TooltipProvider>);
};

describe('ParticipantIndicator', () => {
  it('should display participant count', () => {
    renderWithProvider(<ParticipantIndicator count={3} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should show single participant correctly', () => {
    renderWithProvider(<ParticipantIndicator count={1} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should display avatar initials for participants', () => {
    renderWithProvider(<ParticipantIndicator count={3} />);
    
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('should show +N indicator when more than 5 participants', () => {
    renderWithProvider(<ParticipantIndicator count={8} />);
    
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('should show at most 5 avatars', () => {
    renderWithProvider(<ParticipantIndicator count={10} />);
    
    // Should show A, B, C, D, E and +5
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByText('+5')).toBeInTheDocument();
  });

  it('should handle zero participants', () => {
    renderWithProvider(<ParticipantIndicator count={0} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
