// src/pages/beta/BetaWelcome.tsx
// Beta welcome page — shown to authenticated beta users after login.
// Links to the quick-start guide, feedback, and bug reporting routes,
// plus role-specific documentation and support contacts.

import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { PageIntro } from '../../components/pages/PageIntro';
import { Reveal } from '../../components/ui/Reveal';
import { Button, ArrowIcon } from '../../components/ui/Button';

const nextSteps = [
  {
    title: 'Read the Quick Start',
    description: 'A short walkthrough of the platform — what is here, how to find it, and how to use it.',
    to: '/beta/quick-start',
    cta: 'Open the guide',
  },
  {
    title: 'Send feedback',
    description: 'Tell us what works, what does not, and what is missing. A few clicks, no forms to chase.',
    to: '/beta/feedback',
    cta: 'Give feedback',
  },
  {
    title: 'Report a bug',
    description: 'Found something broken? Describe the steps and expected vs actual behavior so we can fix it.',
    to: '/beta/bug-report',
    cta: 'Report a bug',
  },
];

const supportLinks = [
  { label: 'Beta user guide', to: '/beta/quick-start' },
  { label: 'Feedback & bug process', to: '/beta/feedback' },
  { label: 'Methodology', to: '/methodology' },
  { label: 'Corrections policy', to: '/corrections' },
  { label: 'Privacy', to: '/privacy' },
];

export function BetaWelcome() {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <PageIntro
            eyebrow="Beta Program"
            title="Welcome to the Accountability Atlas beta."
            description="You now have access to the beta feedback and bug reporting routes. Your reports go directly to the maintenance team — they help shape the platform before wider release."
          />

          {/* Next steps */}
          <Reveal delay={0.15}>
            <section className="mb-12" aria-labelledby="next-steps-heading">
              <h2 id="next-steps-heading" className="font-serif text-2xl font-semibold text-ink mb-6">
                Where to start
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {nextSteps.map((step) => (
                  <div
                    key={step.to}
                    className="bg-bone border border-border rounded-lg p-5 flex flex-col"
                  >
                    <h3 className="font-serif text-lg font-semibold text-ink mb-2">{step.title}</h3>
                    <p className="text-sm text-charcoal/80 leading-relaxed mb-4 flex-1">
                      {step.description}
                    </p>
                    <Link
                      to={step.to}
                      className="inline-flex items-center gap-1.5 text-sm text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 rounded-sm transition-colors duration-200"
                    >
                      {step.cta}
                      <ArrowIcon />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* Support / role-specific docs */}
          <Reveal delay={0.2}>
            <section className="mb-12" aria-labelledby="support-heading">
              <h2 id="support-heading" className="font-serif text-2xl font-semibold text-ink mb-4">
                Documentation & support
              </h2>
              <ul className="space-y-2">
                {supportLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-trust hover:text-trust/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 rounded-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="bg-bone border border-charcoal/10 rounded-md p-5 mt-6">
                <p className="text-base text-charcoal/75 leading-relaxed">
                  <strong>Need help?</strong> During the beta, support is handled through the project's
                  public channels. Bug reports submitted through{' '}
                  <Link to="/beta/bug-report" className="text-trust underline underline-offset-2">
                    the bug form
                  </Link>{' '}
                  reach the maintenance team directly.
                </p>
              </div>
            </section>
          </Reveal>

          {/* Actions */}
          <Reveal delay={0.25}>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
              <Button to="/beta/quick-start" variant="primary" icon={<ArrowIcon />}>
                Start the quick start
              </Button>
              <Button to="/" variant="ghost" icon={<ArrowIcon />}>
                Explore the platform
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
