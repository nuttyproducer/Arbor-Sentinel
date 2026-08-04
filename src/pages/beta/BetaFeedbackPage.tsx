// src/pages/beta/BetaFeedbackPage.tsx
// Beta feedback page — hosts the authenticated feedback form.

import { Container } from '../../components/ui/Container';
import { PageIntro } from '../../components/pages/PageIntro';
import { Reveal } from '../../components/ui/Reveal';
import { BetaFeedbackForm } from '../../components/beta/BetaFeedbackForm';
import { Button, ArrowIcon } from '../../components/ui/Button';

export function BetaFeedbackPage() {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <PageIntro
            eyebrow="Beta Feedback"
            title="Tell us what you think."
            description="Your feedback is read by the maintenance team. Please be specific — the more context you give, the more useful it is."
          />

          <Reveal delay={0.1}>
            <div className="bg-white border border-charcoal/10 rounded-lg p-6 lg:p-8">
              <BetaFeedbackForm pageContext="/beta/feedback" />
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border mt-10">
              <Button to="/beta/quick-start" variant="secondary" icon={<ArrowIcon />}>
                Quick start
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
