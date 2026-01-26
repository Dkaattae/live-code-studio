import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OutputPanel } from '@/components/OutputPanel';

describe('OutputPanel', () => {
  it('should render placeholder text when no result', () => {
    render(<OutputPanel result={null} isExecuting={false} />);
    
    expect(screen.getByText(/click "run code"/i)).toBeInTheDocument();
  });

  it('should show loading state when executing', () => {
    render(<OutputPanel result={null} isExecuting={true} />);
    
    expect(screen.getByText(/running/i)).toBeInTheDocument();
  });

  it('should display successful output', () => {
    const result = {
      output: 'Hello, World!',
      error: null,
      executionTime: 10.5,
    };
    
    render(<OutputPanel result={result} isExecuting={false} />);
    
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    expect(screen.getByText('10.50ms')).toBeInTheDocument();
    expect(screen.getByText(/execution successful/i)).toBeInTheDocument();
  });

  it('should display error output', () => {
    const result = {
      output: '',
      error: 'SyntaxError: Unexpected token',
      executionTime: 5.2,
    };
    
    render(<OutputPanel result={result} isExecuting={false} />);
    
    expect(screen.getByText('SyntaxError: Unexpected token')).toBeInTheDocument();
  });

  it('should show "No output" for empty output', () => {
    const result = {
      output: '',
      error: null,
      executionTime: 2.0,
    };
    
    render(<OutputPanel result={result} isExecuting={false} />);
    
    expect(screen.getByText(/no output/i)).toBeInTheDocument();
  });
});
