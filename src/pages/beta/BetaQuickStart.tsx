// src/pages/beta/BetaQuickStart.tsx
// Beta quick start guide — platform overview, key features, how to find
// content, action templates, corrections, and bug reporting.

import { Container } from '../../components/ui/Container';
import { PageIntro } from '../../components/pages/PageIntro';
import { Reveal } from '../../components/ui/Reveal';
import { Button, ArrowIcon } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const sections = [
  {
    id: 'overview',
    title: 'Platform overview',
    body: [
      'Accountability Atlas is an open-source platform for organizing verified public evidence, tracking legal and political responsibility, and helping people take lawful action. It is built around a few core ideas:',
    ],
    bullets: [
      'Evidence is sourced from public records and clearly attributed.',
      'Editorial status is separated from legal status — a claim can be verified while a legal process is still pending.',
      'Everything is open to correction and review.',
    ],
  },
  {
    id: 'key-features',
    title: 'Key features',
    body: [
      'The platform currently offers:',
    ],
    bullets: [
      'Gaza Dossier — a structured evidence brief on the regional crisis.',
      'Legal Tracker — court proceedings, investigations, warrants, UN findings, and procedural milestones.',
      'Country & institution accountability pages — with clear competency boundaries.',
      'Organization directory — humanitarian, legal, documentation, and press-freedom groups.',
      'Action Hub — lawful action templates you can send to representatives.',
      'Evidence, sources, and dossiers libraries — browse verified public records.',
      'Interactive map and knowledge-graph explorer.',
    ],
  },
  {
    id: 'find-content',
    title: 'How to find content',
    body: [
      'Use the search bar (client-side, nothing is logged) to search across sources, evidence, legal cases, organizations, actions, countries, institutions, dossiers, and trust pages. Browse from the top navigation, or explore the interactive map and knowledge graph.',
    ],
    bullets: [],
  },
  {
    id: 'action-templates',
    title: 'How to use action templates',
    body: [
      'The Action Hub provides copy-ready templates for lawful actions: contacting a representative, requesting an arms-transfer review, supporting humanitarian access, sending a dossier to a journalist, and more.',
    ],
    bullets: [
      'Read the template and its policy ask carefully.',
      'Personalize the template with your own details where prompted.',
      'Check the audience and jurisdiction — templates are written for specific recipients.',
      'Templates are manual copy during the beta; automated generation is planned for later.',
    ],
  },
  {
    id: 'corrections',
    title: 'How to submit corrections',
    body: [
      'Corrections are part of the trust model. If information is inaccurate, outdated, unsafe, mistranslated, or missing context, tell us.',
    ],
    bullets: [
      'Include the specific page or section, a description of the issue, a suggested correction, and a supporting source.',
      'During the beta, submit corrections through the public GitHub issue tracker (see the Corrections page).',
      'Never include sensitive witness information or private personal data.',
    ],
  },
  {
    id: 'report-bugs',
    title: 'How to report bugs',
    body: [
      'Use the beta bug report form. The more detail you provide, the faster we can reproduce and fix the issue.',
    ],
    bullets: [
      'Describe what you did, what you expected, and what actually happened.',
      'Include the steps to reproduce and the browser/device you were using (captured automatically).',
      'Set a realistic severity so we can triage appropriately.',
    ],
  },
];

export function BetaQuickStart() {
  return (
    <div className="py-24 lg:py-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <PageIntro
            eyebrow="Quick Start"
            title="Get started with the Accountability Atlas."
            description="A short walkthrough of the platform. Full details live in the beta user guide and the public documentation."
          />

          <Reveal delay={0.15}>
            <div className="flex flex-wrap gap-2 mb-10">
              <Badge variant="info">Beta</Badge>
              <Badge variant="neutral">Static preview</Badge>
              <Badge variant="neutral">Open source</Badge>
            </div>
          </Reveal>

          {sections.map((section, index) => (
            <Reveal key={section.id} delay={0.1 + index * 0.04}>
              <section
                id={section.id}
                aria-labelledby={`${section.id}-heading`}
                className="mb-12"
              >
                <h2
                  id={`${section.id}-heading`}
                  className="font-serif text-2xl font-semibold text-ink mb-4"
                >
                  {section.title}
                </h2>
                {section.body.map((para) => (
                  <p key={para} className="text-charcoal/80 leading-relaxed mb-3">
                    {para}
                  </p>
                ))}
                {section.bullets.length > 0 && (
                  <ul className="space-y-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="text-clay mt-1.5" aria-hidden="true">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </Reveal>
          ))}

          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
              <Button to="/beta/feedback" variant="primary" icon={<ArrowIcon />}>
                Give feedback
              </Button>
              <Button to="/beta/bug-report" variant="secondary" icon={<ArrowIcon />}>
                Report a bug
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
