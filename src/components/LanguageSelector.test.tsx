import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageSelector } from '@/components/LanguageSelector';

// Mock scrollIntoView for jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('LanguageSelector', () => {
  it('should render with selected language', () => {
    const onChange = vi.fn();
    render(<LanguageSelector value="javascript" onChange={onChange} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should display current language value', () => {
    const onChange = vi.fn();
    render(<LanguageSelector value="python" onChange={onChange} />);
    
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('should display JavaScript when selected', () => {
    const onChange = vi.fn();
    render(<LanguageSelector value="javascript" onChange={onChange} />);
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('should display TypeScript when selected', () => {
    const onChange = vi.fn();
    render(<LanguageSelector value="typescript" onChange={onChange} />);
    
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('should display C++ when selected', () => {
    const onChange = vi.fn();
    render(<LanguageSelector value="cpp" onChange={onChange} />);
    
    expect(screen.getByText('C++')).toBeInTheDocument();
  });
});
