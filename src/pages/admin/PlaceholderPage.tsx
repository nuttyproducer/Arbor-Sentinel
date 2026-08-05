// src/pages/admin/PlaceholderPage.tsx
// "Coming Soon" placeholder for admin routes not yet implemented.

import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";

export interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Container>
      <PageIntro
        title={title}
        description={description ?? "This section is coming soon."}
      />
    </Container>
  );
}
