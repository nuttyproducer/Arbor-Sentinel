import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BetaQuickStart } from '../beta/BetaQuickStart';

vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    section: 'section',
    span: 'span',
    p: 'p',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    li: 'li',
    ul: 'ul',
    a: 'a',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useInView: () => true,
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => 0,
  useReducedMotion: () => true,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <BetaQuickStart />
    </MemoryRouter>,
  );
}

describe('BetaQuickStart', () => {
  it('renders the quick start heading', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: /Get started with the Accountability Atlas/i }),
    ).toBeInTheDocument();
  });

  it('covers the required guide sections', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Platform overview' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Key features' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How to find content' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How to use action templates' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How to submit corrections' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How to report bugs' })).toBeInTheDocument();
  });

  it('links to feedback and bug report routes', () => {
    renderPage();
    expect(screen.getByText('Give feedback').closest('a')).toHaveAttribute('href', '/beta/feedback');
    expect(screen.getByText('Report a bug').closest('a')).toHaveAttribute('href', '/beta/bug-report');
  });
});
