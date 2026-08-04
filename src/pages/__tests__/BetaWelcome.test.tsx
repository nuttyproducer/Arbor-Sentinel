import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BetaWelcome } from '../beta/BetaWelcome';

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
      <BetaWelcome />
    </MemoryRouter>,
  );
}

describe('BetaWelcome', () => {
  it('renders the welcome heading', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: /Welcome to the Accountability Atlas beta/i }),
    ).toBeInTheDocument();
  });

  it('links to the quick start, feedback, and bug report routes', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Open the guide' })).toHaveAttribute('href', '/beta/quick-start');
    expect(screen.getByRole('link', { name: 'Give feedback' })).toHaveAttribute('href', '/beta/feedback');
    expect(screen.getByRole('link', { name: 'Report a bug' })).toHaveAttribute('href', '/beta/bug-report');
  });

  it('provides documentation and support links', () => {
    renderPage();
    expect(screen.getByText('Methodology').closest('a')).toHaveAttribute('href', '/methodology');
    expect(screen.getByText('Privacy').closest('a')).toHaveAttribute('href', '/privacy');
  });
});
