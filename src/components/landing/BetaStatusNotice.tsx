import { Reveal } from "../ui/Reveal";
import { Container } from "../ui/Container";
import { Badge } from "../ui/Badge";

export function BetaStatusNotice() {
  return (
    <section className="pt-10 pb-6" aria-labelledby="beta-status-title">
      <Container>
        <Reveal>
          <div className="max-w-3xl bg-bone border border-border rounded-lg p-5 lg:p-6">
            <div className="flex items-start gap-4 flex-wrap">
              <Badge variant="info">Public Static Beta</Badge>
              <div>
                <p
                  id="beta-status-title"
                  className="text-base text-charcoal/75 leading-relaxed"
                >
                  Accountability Atlas is currently being built as a static
                  public beta. Preview pages are clearly labeled, methodology is
                  public, corrections are welcome, and sensitive evidence
                  submissions are not accepted at this stage.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
