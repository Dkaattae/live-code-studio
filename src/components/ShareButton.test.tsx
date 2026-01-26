import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareButton } from '@/components/ShareButton';

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(() => Promise.resolve()),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

describe('ShareButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render share button', () => {
    render(<ShareButton sessionId="test-session-123" />);
    
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('should open popover on click', async () => {
    render(<ShareButton sessionId="test-session-123" />);
    
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/share this interview/i)).toBeInTheDocument();
    });
  });

  it('should show session URL in popover', async () => {
    render(<ShareButton sessionId="test-session-123" />);
    
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      const input = screen.getByDisplayValue(/test-session-123/);
      expect(input).toBeInTheDocument();
    });
  });

  it('should copy URL to clipboard on copy button click', async () => {
    render(<ShareButton sessionId="test-session-123" />);
    
    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);
    
    await waitFor(() => {
      expect(screen.getByText(/share this interview/i)).toBeInTheDocument();
    });
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('test-session-123')
      );
    });
  });

  it('should show "Copied" text after copying', async () => {
    render(<ShareButton sessionId="test-session-123" />);
    
    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);
    
    await waitFor(() => {
      expect(screen.getByText(/share this interview/i)).toBeInTheDocument();
    });
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });
});
