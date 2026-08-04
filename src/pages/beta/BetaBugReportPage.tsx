// src/pages/beta/BetaBugReportPage.tsx
// Beta bug report page — hosts the authenticated bug report form.

import { Container } from '../../components/ui/Container';
import { PageIntro } from '../../components/pages/PageIntro';
import { Reveal } from '../../components/ui/Reveal';
import { BetaBugReportForm } from '../../components/beta/BetaBugReportForm';
import { Button, ArrowIcon } from '../../components/ui/Button';

export function BetaBugReportPage() {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <PageIntro
            eyebrow="Beta Bug Report"
            title="Report a bug."
            description="Describe what went wrong and how we can reproduce it. Browser and device details are captured automatically with your submission."
          />

          <Reveal delay={0.1}>
            <div className="bg-white border border-charcoal/10 rounded-lg p-6 lg:p-8">
              <BetaBugReportForm />
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border mt-10">
              <Button to="/beta/feedback" variant="secondary" icon={<ArrowIcon />}>
                Give feedback
              </Button>
              <Button to="/beta/welcome" variant="ghost" icon={<ArrowIcon />}>
                Back to welcome
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
