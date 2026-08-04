/** Donation-link disclaimer banner used on the Organizations page. */
export function OrganizationDisclaimer() {
  return (
    <div className="bg-bone border border-border rounded-md p-5">
      <p className="text-sm text-charcoal/75 leading-relaxed">
        <strong>Donations go directly to the named organisation.</strong>{" "}
        Accountability Atlas does not process, hold, or distribute funds.
        Donation links point to the organisation&rsquo;s own official
        donation page. The platform does not receive any commission,
        referral fee, or benefit from these links. A donation link is not
        an endorsement of every position or action of the organisation.
      </p>
    </div>
  );
}
