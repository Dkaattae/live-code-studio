import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';
import { api } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    createSession: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Index Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the landing page', () => {
    renderWithRouter(<Index />);
    
    expect(screen.getByText('CodeInterview')).toBeInTheDocument();
    expect(screen.getByText(/coding interviews/i)).toBeInTheDocument();
  });

  it('should display feature cards', () => {
    renderWithRouter(<Index />);
    
    expect(screen.getByText('Real-time Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Multi-language Support')).toBeInTheDocument();
    expect(screen.getByText('Live Execution')).toBeInTheDocument();
    expect(screen.getByText('Easy Sharing')).toBeInTheDocument();
  });

  it('should have a start interview button', () => {
    renderWithRouter(<Index />);
    
    expect(screen.getByRole('button', { name: /start interview/i })).toBeInTheDocument();
  });

  it('should create session and navigate on button click', async () => {
    const mockSession = {
      id: 'new-session-123',
      code: '',
      language: 'javascript',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    vi.mocked(api.createSession).mockResolvedValueOnce(mockSession);
    
    renderWithRouter(<Index />);
    
    const button = screen.getByRole('button', { name: /start interview/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(api.createSession).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/session/new-session-123');
    });
  });

  it('should show loading state while creating session', async () => {
    vi.mocked(api.createSession).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );
    
    renderWithRouter(<Index />);
    
    const button = screen.getByRole('button', { name: /start interview/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/creating/i)).toBeInTheDocument();
    });
  });
});
