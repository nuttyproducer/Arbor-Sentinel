import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BetaFeedbackPage } from '../beta/BetaFeedbackPage';
import { BetaBugReportPage } from '../beta/BetaBugReportPage';

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

describe('Beta form pages', () => {
  it('renders the feedback page with the feedback form', () => {
    render(
      <MemoryRouter>
        <BetaFeedbackPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: 'Tell us what you think.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Feedback' })).toBeInTheDocument();
  });

  it('renders the bug report page with the bug report form', () => {
    render(
      <MemoryRouter>
        <BetaBugReportPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: 'Report a bug.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Bug Report' })).toBeInTheDocument();
  });
});
