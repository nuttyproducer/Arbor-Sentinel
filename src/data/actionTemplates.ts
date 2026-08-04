import type { ContentStatus, TranslationStatus } from "../types/content";

/**
 * Action types for the lawful civic action hub.
 *
 * Every action is manual copy-only during the static beta.
 * The platform does not send, store, track, or automate any action.
 */
export type ActionType =
  | "contact_representative"
  | "arms_transfer_review"
  | "humanitarian_access"
  | "send_dossier"
  | "submit_correction"
  | "volunteer";

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  contact_representative: "Contact a representative",
  arms_transfer_review: "Ask for arms-transfer review",
  humanitarian_access: "Support humanitarian access",
  send_dossier: "Send a dossier to a journalist",
  submit_correction: "Submit a correction or public source",
  volunteer: "Volunteer for the project",
};

export type ReviewStatus = "draft" | "reviewed" | "not_applicable";

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  draft: "Draft — not yet reviewed",
  reviewed: "Reviewed",
  not_applicable: "Not applicable",
};

export const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  nl: "Nederlands",
  fr: "Français",
};

export interface ActionTemplate {
  id: string;
  slug: string;
  title: string;
  actionType: ActionType;
  /** Jurisdiction where this action is relevant. */
  jurisdiction: string;
  /** Who this action is written for. */
  intendedAudience: string;
  /** Why this action exists — the accountability problem it addresses. */
  purpose: string;
  /** What the recipient (representative, official, journalist, etc.) can realistically do. */
  policyAsk: string;
  /** Legal or procedural basis for the action. */
  sourceBasis: string;
  /** Step-by-step instructions for completing the action safely. */
  instructions: string;
  /** Draft template body — copy-only during static beta. Labeled clearly as draft or reviewed. */
  templateBody?: string;
  /** Template review status — whether the template text has been reviewed for safety and accuracy in its target jurisdiction. */
  templateReviewStatus: ReviewStatus;
  /** Jurisdiction review status — whether the template has been reviewed for legal accuracy in the specific jurisdiction it targets. */
  jurisdictionReviewStatus: ReviewStatus;
  /** Language review status — whether the template text has been reviewed by a competent speaker of the target language. */
  languageReviewStatus: ReviewStatus;
  /** Language the template is written in (ISO 639-1 code). */
  language: string;
  /** Translation status — whether this version has been reviewed by a human translator. Separate from languageReviewStatus. */
  translationStatus: TranslationStatus;
  /** If this is a translation, the ID of the primary (English) template. */
  translationOf?: string;
  contentStatus: ContentStatus;
  sourceIds: string[];
  lastReviewedAt?: string;
  /** Date this template's content was last substantively changed (ISO 8601). */
  lastChangedDate: string;
  reviewedByRole?: string;
  version: number;
  /** Related routes on this platform. */
  relatedRoutes: string[];
  /** Safety and limitation warnings displayed prominently on the card. */
  warnings: string[];
  /** Whether this action is currently displayed on the page. */
  active: boolean;
  /** Route to the corrections process. Required for all publishable records. */
  correctionUrl: string;
}

export const actionTemplates: ActionTemplate[] = [
  {
    id: "contact-representative",
    slug: "contact-representative",
    title: "Contact your representative",
    actionType: "contact_representative",
    jurisdiction: "Any country with elected or appointed public representatives",
    intendedAudience:
      "Constituents who want to contact their representatives about accountability, civilian protection, humanitarian access, or adherence to international law.",
    purpose:
      "Elected and appointed representatives have the ability to ask parliamentary questions, call for government statements, request briefings, and raise issues in formal proceedings. Contacting them is a basic lawful civic action.",
    policyAsk:
      "Representatives can: ask written or oral parliamentary questions; request government briefings on policy positions; call for scrutiny of arms-export licences; raise humanitarian-access concerns in official proceedings; and press for transparency about government positions on international legal obligations.",
    sourceBasis:
      "Parliamentary procedures vary by country. Most representative democracies provide public contact channels for constituents. This action is based on the general right to petition and contact elected representatives, recognised in many jurisdictions.",
    instructions: `1. Identify your representative. Look up your electoral district or constituency on your government's official website. Do not rely on third-party contact databases.
2. Find their official contact form, email address, or postal address. Use only official parliamentary or government websites.
3. Adapt the template below to your own words. Personal messages are more effective than identical form letters.
4. Be polite, specific, and factual. Reference public sources where possible.
5. Include your name and address so they can verify you are a constituent. Most representatives only respond to their own constituents.
6. Send the message yourself. This platform does not send messages on your behalf.`,
    templateBody: `[Your name]
[Your address — required so they can verify you are a constituent]

Dear [Representative's name],

I am writing as a constituent to ask about [country]'s position on [specific issue: civilian protection / humanitarian access / arms exports / international legal obligations].

I would be grateful if you could:
- [Specific ask, e.g. "ask a parliamentary question about..." / "request a public briefing on..." / "raise the issue of humanitarian access with the relevant minister"]

I am asking because [brief personal reason — why this matters to you].

Thank you for your time and for representing our community.

Yours sincerely,
[Your name]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "static_preview",
    sourceIds: [],
    lastChangedDate: "2026-07-14",
    version: 1,
    relatedRoutes: ["/methodology", "/countries/belgium"],
    warnings: [
      "This page does not look up your representative. Use your government's official website.",
      "No message is sent through this platform. Copy the text and send it yourself.",
      "This is draft template text — adapt it to your own words before sending.",
      "Do not send threats, abuse, or harassing messages. Lawful civic action only.",
      "Do not impersonate another person or use false identity information.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "arms-transfer-review",
    slug: "arms-transfer-review",
    title: "Ask for an arms-transfer review",
    actionType: "arms_transfer_review",
    jurisdiction:
      "Countries that export arms or arms components and have parliamentary scrutiny mechanisms",
    intendedAudience:
      "Constituents concerned about arms exports to contexts where serious violations of international humanitarian law are alleged.",
    purpose:
      "Many countries require parliamentary or judicial scrutiny of arms-export licences, particularly where there is a clear risk that exported arms may be used in serious violations of international humanitarian law. Constituents can ask their representatives to request or support such scrutiny.",
    policyAsk:
      "Representatives and relevant committees can: request review of specific arms-export licences; ask government to publish export-licence summaries; call for suspension of exports where there is clear risk of IHL violations; and press for compliance with arms-export criteria under national law and international obligations.",
    sourceBasis:
      "The Arms Trade Treaty (ATT) requires States Parties to assess whether arms exports could be used to commit or facilitate serious violations of IHL. The EU Common Position (2008/944/CFSP) sets shared criteria for member-state export decisions. Many countries have additional national legislation.",
    instructions: `1. Check whether your country publishes arms-export data. Some countries release annual reports or licence summaries.
2. Identify the relevant government department (often trade, foreign affairs, or defence) and the parliamentary committee responsible for arms-export scrutiny.
3. Adapt the template below. Be specific about which export relationships or licences concern you, and why.
4. Reference public sources: UN reports, NGO findings, court proceedings, or humanitarian assessments.
5. Send the message yourself through official channels.`,
    templateBody: `[Your name]
[Your address]

Dear [Representative's name / Committee chair],

I am writing about [country]'s arms exports to [recipient country or region].

I am concerned that arms or arms components exported from [country] may be used in serious violations of international humanitarian law, as documented by [reference public sources — e.g. UN Commission of Inquiry, ICRC, credible human-rights organisations].

Under [relevant law or treaty — e.g. the Arms Trade Treaty / EU Common Position 2008/944/CFSP], [country] is required to assess whether there is a clear risk that exported arms could be used to commit or facilitate serious violations of IHL.

I ask that you:
- Request a review of existing arms-export licences to [recipient]
- Ask the government to publish a summary of licences currently in effect
- Press for suspension of exports where there is a clear risk of IHL violations

Thank you for your attention to this matter.

Yours sincerely,
[Your name]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "static_preview",
    sourceIds: [],
    lastChangedDate: "2026-07-14",
    version: 1,
    relatedRoutes: ["/methodology", "/countries/belgium", "/legal-tracker"],
    warnings: [
      "This platform does not track individual arms-export licences in real time. Check your government's official publications.",
      "Template text is a draft — review and adapt before sending.",
      "Arms-export decisions involve classified and commercial information. Representatives may not be able to discuss specific licences publicly.",
      "No message is sent through this platform. Copy and send yourself.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "humanitarian-access",
    slug: "humanitarian-access",
    title: "Support humanitarian access",
    actionType: "humanitarian_access",
    jurisdiction:
      "Countries that provide humanitarian funding, have diplomatic channels, or are party to the Geneva Conventions",
    intendedAudience:
      "Constituents concerned about humanitarian access restrictions, aid blockages, or attacks on humanitarian personnel.",
    purpose:
      "Under international humanitarian law, parties to conflict must allow and facilitate rapid and unimpeded passage of humanitarian relief. States that are not party to a conflict also have responsibilities — including using diplomatic channels to press for humanitarian access and funding humanitarian operations.",
    policyAsk:
      "Representatives and relevant ministers can: raise humanitarian-access concerns through diplomatic channels; increase or maintain humanitarian funding; press for protection of humanitarian personnel and facilities; ask parliamentary questions about government humanitarian policy; and support UN and ICRC access requests.",
    sourceBasis:
      "Geneva Convention IV, Article 23 and Additional Protocol I, Article 70. UN Security Council Resolution 2417 (2018) on conflict-induced food insecurity. Customary IHL Rule 55 (humanitarian access) and Rule 56 (freedom of movement of humanitarian personnel).",
    instructions: `1. Identify which humanitarian organisations are active in the context you are concerned about. Their public reports can strengthen your message.
2. Find the relevant minister or committee in your country — often foreign affairs, development, or humanitarian aid.
3. Adapt the template below. Be specific about which context and what kind of access restriction concerns you.
4. Reference specific public reports, UN OCHA situation updates, or humanitarian organisation statements where possible.
5. Send the message yourself.`,
    templateBody: `[Your name]
[Your address]

Dear [Representative's name / Minister's name],

I am writing about the humanitarian situation in [context — e.g. Gaza / specific region].

I am concerned about reports of [specific concern — restricted humanitarian access / attacks on humanitarian personnel / blockage of essential supplies], as documented by [reference public sources].

Under international humanitarian law, all parties must allow and facilitate rapid and unimpeded passage of humanitarian relief for civilians in need. States that are not party to the conflict also have responsibilities to use their diplomatic channels to press for compliance.

I ask that you:
- Raise the issue of humanitarian access in [context] through diplomatic channels
- Press for protection of humanitarian personnel and facilities
- Support adequate humanitarian funding for [context]

Thank you for your attention to this urgent humanitarian matter.

Yours sincerely,
[Your name]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "static_preview",
    sourceIds: [],
    lastChangedDate: "2026-07-14",
    version: 1,
    relatedRoutes: ["/methodology", "/organizations", "/gaza-dossier"],
    warnings: [
      "Humanitarian access involves complex negotiations. Representatives cannot always discuss ongoing diplomatic efforts publicly.",
      "Template text is a draft — review and adapt before sending.",
      "Do not contact parties directly involved in a conflict unless you are a professional humanitarian actor.",
      "No message is sent through this platform. Copy and send yourself.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "send-dossier",
    slug: "send-dossier",
    title: "Send a dossier to a journalist",
    actionType: "send_dossier",
    jurisdiction: "Any country with a free or partly free press",
    intendedAudience:
      "People who have collected verified public information about accountability-related events and want to share it responsibly with journalists.",
    purpose:
      "Journalists and news organisations play a critical role in verifying and publicising accountability-relevant information. Sharing well-organised, sourced public documentation with journalists — responsibly and lawfully — can help bring attention to under-reported events.",
    policyAsk:
      "Journalists and news organisations can: investigate and verify public documentation; publish reports that bring public attention to accountability issues; file access-to-information requests; and interview experts and witnesses (within their own editorial and safety standards).",
    sourceBasis:
      "Press freedom is protected under Article 19 of the Universal Declaration of Human Rights and the International Covenant on Civil and Political Rights. Journalists operate under their own editorial standards and safety protocols. This action supports sharing public, non-classified, non-private information only.",
    instructions: `1. Organise your documentation. Group sources by type (official records, news reports, NGO publications, academic research, verified open-source material). Include publication dates, URLs, and access dates.
2. Identify journalists or news organisations that cover the relevant topic. Read their previous work to understand their focus and standards.
3. Write a brief, factual summary. Do not exaggerate, editorialise, or include private or classified information.
4. Send the material yourself. Most news organisations have public contact or tip addresses. Some have secure submission channels — use those if the material is sensitive.
5. Respect the journalist's time and editorial independence. They may or may not follow up — that is their professional decision.
6. Do not send graphic content without a content warning. Do not send material that identifies vulnerable people or exposes them to risk.`,
    templateBody: `Subject: Public documentation regarding [brief description — e.g. "civilian harm incident in Gaza, June 2026"]

Dear [Journalist's name / News desk],

I am sharing public documentation regarding [brief factual description of the event or context].

The enclosed material includes:
- [Type of source and date, e.g. "UN OCHA flash update, 12 June 2026"]
- [Type of source and date]
- [Type of source and date]

All sources are publicly available. URLs and access dates are included.

[Optional: one-sentence summary of why this matters — factual, not emotive.]

Thank you for your work covering this topic.

[Your name]
[Optional: your contact method if you wish to be reached for follow-up]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "static_preview",
    sourceIds: [],
    lastChangedDate: "2026-07-14",
    version: 1,
    relatedRoutes: ["/methodology", "/gaza-dossier", "/organizations"],
    warnings: [
      "Share only public, verified documentation. Do not share private, classified, or sensitive personal information.",
      "Do not share graphic content without a content warning. Journalists have their own safety protocols.",
      "Template text is a draft — adapt before using. Journalists prefer original, well-organised material, not form letters.",
      "No information is sent through this platform. You send the material yourself.",
      "This is not a whistleblowing channel. If you need secure submission, use the journalist's own secure channels.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "submit-correction",
    slug: "submit-correction",
    title: "Submit a correction or public source",
    actionType: "submit_correction",
    jurisdiction: "Platform-wide — no jurisdiction restriction",
    intendedAudience:
      "Anyone who has identified an error on the platform, or who has a public source to suggest for a page that is under development.",
    purpose:
      "Corrections and public source suggestions are part of the platform's trust model. During the static beta, submissions are handled through GitHub issues. This action explains how to submit corrections and source suggestions safely and effectively.",
    policyAsk:
      "The platform maintainers can: review and apply corrections; assess public source suggestions against the methodology; update pages with reviewed sources; and log corrections transparently.",
    sourceBasis:
      "Based on the platform's methodology and corrections process at /methodology and /corrections.",
    instructions: `1. Read the corrections guidance at /corrections before submitting.
2. Identify the specific page, section, or claim that needs correction or sourcing.
3. Gather the public source, correction detail, or evidence that supports your submission.
4. Submit through GitHub Issues — this is the preferred method during the static beta.
5. Alternatively, use the project contact route listed on the Contribute page.
6. Do not submit sensitive witness information, private personal data, or confidential material through public channels.`,
    templateReviewStatus: "not_applicable",
    jurisdictionReviewStatus: "not_applicable",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "static_preview",
    lastReviewedAt: "2026-07-12",
    lastChangedDate: "2026-07-12",
    reviewedByRole: "Contributor — internal platform route; no external source review required",
    sourceIds: [],
    version: 1,
    relatedRoutes: ["/corrections", "/methodology", "/contribute"],
    warnings: [
      "Do not submit sensitive witness information or private personal data through public GitHub issues.",
      "Corrections are processed during the static beta but may be delayed.",
      "Not every source suggestion will result in an immediate update — some require expert review.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "volunteer",
    slug: "volunteer",
    title: "Volunteer for the project",
    actionType: "volunteer",
    jurisdiction: "Any country — remote open-source contribution",
    intendedAudience:
      "Developers, designers, researchers, legal reviewers, translators, writers, and security reviewers who want to contribute to the platform.",
    purpose:
      "Accountability Atlas is an open-source project built by volunteers. Contributing your skills — even in small, safe ways — helps build infrastructure against genocide and mass atrocities. Every contribution is reviewed for safety and accuracy.",
    policyAsk:
      "Volunteer contributors can: develop the platform's frontend and data infrastructure; review sources and methodology; improve accessibility and translations; help with documentation; and participate in safety and security review.",
    sourceBasis:
      "Based on the platform's contribution guide, code of conduct, and open-source licence (AGPL-3.0-or-later). See /contribute and the GitHub repository.",
    instructions: `1. Read the Contribute page at /contribute for role descriptions and prerequisites.
2. Read the Contribution Guide, Code of Conduct, and Security Policy in the GitHub repository before starting.
3. Look for "good first issue" labels on GitHub — these are small, safe tasks suited to new contributors.
4. Join the project on GitHub and introduce yourself in a contribution discussion.
5. Every contribution is reviewed. Start small — a documentation fix, a translation, or a source check is a valuable contribution.`,
    templateReviewStatus: "not_applicable",
    jurisdictionReviewStatus: "not_applicable",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "static_preview",
    lastReviewedAt: "2026-07-12",
    lastChangedDate: "2026-07-12",
    reviewedByRole: "Contributor — internal platform route; no external source review required",
    sourceIds: [],
    version: 1,
    relatedRoutes: ["/contribute", "/methodology"],
    warnings: [
      "Read the Code of Conduct and Contribution Guide before contributing.",
      "Every contribution is reviewed. Not every suggestion will be accepted.",
      "Do not include sensitive personal information in public contributions.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Belgium — Federal MP — Humanitarian Access (EN / NL / FR)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "belgium-mp-humanitarian-access-en",
    slug: "belgium-mp-humanitarian-access-en",
    title: "Contact a Belgian federal MP — humanitarian access in Gaza",
    actionType: "humanitarian_access",
    jurisdiction: "Belgium — Federal Parliament (Chamber of Representatives)",
    intendedAudience:
      "Constituents in Belgium who want to ask their federal MP to press for humanitarian access in Gaza through parliamentary questions and government scrutiny.",
    purpose:
      "Belgian federal MPs can table written and oral parliamentary questions to the Minister of Foreign Affairs and the Minister of Development Cooperation. They can also request hearings, interpellations, and resolutions in the Chamber's Committee on Foreign Relations. This action provides a structured, polite template for raising humanitarian access in Gaza with a Belgian federal representative.",
    policyAsk:
      "Belgian federal MPs can: submit written parliamentary questions asking the government to clarify its diplomatic position on humanitarian access in Gaza; request the Chamber's Committee on Foreign Relations to hold a hearing with humanitarian organisations; press the government to increase humanitarian funding; and ask the Prime Minister and Foreign Minister to raise humanitarian access in EU Foreign Affairs Council meetings.",
    sourceBasis:
      "Belgian Constitution, Articles 42–44 (parliamentary control of government action). Chamber of Representatives Rules of Procedure, Chapter on parliamentary questions and interpellations. Geneva Convention IV, Article 23. Additional Protocol I, Article 70. UN Security Council Resolution 2417 (2018). Belgian commitment to IHL as a State Party to the Geneva Conventions. Belgian humanitarian aid contributions are documented via openaid.be and FPS Foreign Affairs.",
    instructions: `1. Identify your federal MP. Belgium uses proportional representation. Find your electoral district (kieskring / circonscription électorale) on the FPS Interior website (ibz.be). Do not rely on third-party databases.
2. Find your MP's official contact details on the Chamber of Representatives website (dekamer.be / lachambre.be). Use only the official parliamentary contact form or email address.
3. Adapt the template below to your own words. Personal messages from constituents are treated more seriously than identical form letters.
4. Optionally attach or reference recent public reports: UN OCHA situation reports (ochaopt.org), ICRC operational updates (icrc.org), or IPC food security assessments (ipcinfo.org).
5. Send the message yourself from your own email address. Include your name and municipality so the MP can verify you are a constituent.
6. MPs typically respond within two to four weeks. If you do not receive a response, a polite follow-up is appropriate.`,
    templateBody: `[Je naam / Votre nom / Your name]
[Je gemeente / Votre commune / Your municipality — required so the MP can verify you are a constituent]

Geachte mevrouw [Naam], / Madame [Nom], / Dear Ms/Mr [Name],

Ik schrijf u als inwoner van [gemeente] over de humanitaire situatie in Gaza. / Je vous écris en tant qu'habitant·e de [commune] au sujet de la situation humanitaire à Gaza. / I am writing as a constituent from [municipality] about the humanitarian situation in Gaza.

[Write in Dutch, French, or English — Belgian MPs accept correspondence in any national language.]

I am concerned about persistent restrictions on humanitarian access into and within the Gaza Strip, as documented by UN OCHA, the ICRC, and multiple humanitarian organisations. The ICRC warned in June 2026 that Gaza's humanitarian response was on the verge of total collapse. UN OCHA's July 2026 situation report documents water delivery at 17,000 cubic metres daily — down 15–20% due to funding shortfalls — and the entire Gaza Strip classified at IPC Phase 3 (Crisis).

Belgium has a strong tradition of humanitarian leadership. Our country contributed €19.5 million to Gaza humanitarian response in 2025 and supports UNRWA, WFP, and other humanitarian actors. I welcome this commitment.

I ask that you:
- Submit a written parliamentary question to the Minister of Foreign Affairs asking what diplomatic steps Belgium is taking — bilaterally and through the EU — to press for full, sustained, and unimpeded humanitarian access to Gaza
- Ask the Minister of Development Cooperation whether Belgium's humanitarian funding for Gaza is reaching intended recipients and what obstacles humanitarian partners report
- Request the Chamber's Committee on Foreign Relations to schedule a hearing with Belgian humanitarian organisations operating in the Gaza response

I ask this because [brief personal reason — one sentence].

Thank you for your time and for representing our community in the federal parliament.

Met vriendelijke groet, / Cordialement, / Yours sincerely,
[Je naam / Votre nom / Your name]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-chamber",
      "belgium-fps-foreign-affairs",
      "belgium-parliament-contact",
      "ocha-opt-main",
      "icrc-gaza-collapse-2026-06",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/countries/belgium",
      "/gaza-dossier",
      "/organizations",
      "/methodology",
    ],
    warnings: [
      "This page does not look up your MP. Use the official Chamber of Representatives website (dekamer.be / lachambre.be) to find your representative.",
      "No message is sent through this platform. Copy the text and send it yourself from your own email address.",
      "Include your name and municipality so the MP can verify you are a constituent. Anonymous messages are rarely answered.",
      "Be polite and factual. Do not send threats, abuse, or harassing messages.",
      "MPs receive many messages. A response may take two to four weeks.",
      "This template has not been reviewed by a Belgian parliamentary expert. Adapt to your own words.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-mp-humanitarian-access-nl",
    slug: "belgium-mp-humanitarian-access-nl",
    title: "[NL] Contacteer een federaal parlementslid — humanitaire toegang in Gaza",
    actionType: "humanitarian_access",
    jurisdiction: "België — Federaal Parlement (Kamer van Volksvertegenwoordigers)",
    intendedAudience:
      "Kiezers in België die hun federale volksvertegenwoordiger willen vragen om via parlementaire vragen en regeringscontrole aan te dringen op humanitaire toegang in Gaza.",
    purpose:
      "Belgische federale volksvertegenwoordigers kunnen schriftelijke en mondelinge parlementaire vragen stellen aan de minister van Buitenlandse Zaken en de minister van Ontwikkelingssamenwerking. Ze kunnen ook hoorzittingen, interpellaties en resoluties aanvragen in de Kamercommissie Buitenlandse Betrekkingen. Deze actie biedt een gestructureerd, beleefd sjabloon om humanitaire toegang in Gaza aan te kaarten bij een federaal parlementslid.",
    policyAsk:
      "Federale volksvertegenwoordigers kunnen: schriftelijke parlementaire vragen indienen om de regering te vragen haar diplomatieke standpunt over humanitaire toegang in Gaza te verduidelijken; de Kamercommissie Buitenlandse Betrekkingen verzoeken een hoorzitting te houden met humanitaire organisaties; de regering vragen de humanitaire financiering te verhogen; en de premier en minister van Buitenlandse Zaken vragen humanitaire toegang aan te kaarten in de EU-Raad Buitenlandse Zaken.",
    sourceBasis:
      "Belgische Grondwet, artikelen 42–44 (parlementaire controle op het regeringsoptreden). Reglement van de Kamer van Volksvertegenwoordigers, hoofdstuk over parlementaire vragen en interpellaties. Vierde Geneefse Conventie, artikel 23. Aanvullend Protocol I, artikel 70. Resolutie 2417 (2018) van de VN-Veiligheidsraad. Belgische verbintenis tot het IHR als verdragspartij bij de Geneefse Conventies. Belgische humanitaire bijdragen gedocumenteerd via openaid.be en FOD Buitenlandse Zaken.",
    instructions: `1. Zoek uw federaal parlementslid. België gebruikt evenredige vertegenwoordiging. Uw kieskring vindt u op de website van de FOD Binnenlandse Zaken (ibz.be). Gebruik geen databases van derden.
2. Vind de officiële contactgegevens van uw volksvertegenwoordiger op de website van de Kamer (dekamer.be). Gebruik uitsluitend het officiële parlementaire contactformulier of e-mailadres.
3. Pas het onderstaande sjabloon aan in uw eigen woorden. Persoonlijke berichten van kiezers worden ernstiger genomen dan identieke standaardbrieven.
4. U kunt recente openbare rapporten bijvoegen of ernaar verwijzen: UN OCHA-situatierapporten (ochaopt.org), operationele updates van het ICRC (icrc.org), of IPC-voedselzekerheidsbeoordelingen (ipcinfo.org).
5. Verstuur het bericht zelf vanaf uw eigen e-mailadres. Vermeld uw naam en gemeente zodat het parlementslid kan verifiëren dat u een kiezer bent.
6. Parlementsleden antwoorden doorgaans binnen twee tot vier weken. Een beleefde follow-up is gepast als u geen antwoord ontvangt.`,
    templateBody: `[Je naam]
[Je gemeente — vereist zodat het parlementslid kan verifiëren dat u een kiezer bent]

Geachte mevrouw [Naam], / Geachte heer [Naam],

Ik schrijf u als inwoner van [gemeente] over de humanitaire situatie in Gaza.

Ik maak me zorgen over de aanhoudende beperkingen op humanitaire toegang tot en binnen de Gazastrook, zoals gedocumenteerd door UN OCHA, het ICRC en meerdere humanitaire organisaties. Het ICRC waarschuwde in juni 2026 dat de humanitaire respons in Gaza op de rand van totale instorting stond. Het situatierapport van UN OCHA van juli 2026 documenteert een waterlevering van 17.000 kubieke meter per dag — een daling van 15–20% door financieringstekorten — en de hele Gazastrook geclassificeerd als IPC Fase 3 (Crisis).

België heeft een sterke traditie van humanitair leiderschap. Ons land droeg in 2025 €19,5 miljoen bij aan de humanitaire respons in Gaza en steunt UNRWA, WFP en andere humanitaire actoren. Ik verwelkom deze inzet.

Ik verzoek u:
- Een schriftelijke parlementaire vraag in te dienen bij de minister van Buitenlandse Zaken over welke diplomatieke stappen België neemt — bilateraal en via de EU — om aan te dringen op volledige, duurzame en ongehinderde humanitaire toegang tot Gaza
- De minister van Ontwikkelingssamenwerking te vragen of de Belgische humanitaire financiering voor Gaza de beoogde ontvangers bereikt en welke obstakels humanitaire partners rapporteren
- De Kamercommissie Buitenlandse Betrekkingen te verzoeken een hoorzitting te organiseren met Belgische humanitaire organisaties die actief zijn in de Gaza-respons

Ik vraag dit omdat [korte persoonlijke reden — één zin].

Dank u voor uw tijd en voor het vertegenwoordigen van onze gemeenschap in het federaal parlement.

Met vriendelijke groet,
[Je naam]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "nl",
    translationStatus: "draft",
    translationOf: "belgium-mp-humanitarian-access-en",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-chamber",
      "belgium-fps-foreign-affairs",
      "belgium-parliament-contact",
      "ocha-opt-main",
      "icrc-gaza-collapse-2026-06",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/countries/belgium",
      "/gaza-dossier",
      "/organizations",
      "/methodology",
    ],
    warnings: [
      "Deze pagina zoekt uw parlementslid niet op. Gebruik de officiële website van de Kamer (dekamer.be) om uw volksvertegenwoordiger te vinden.",
      "Er wordt geen bericht verzonden via dit platform. Kopieer de tekst en verstuur deze zelf vanaf uw eigen e-mailadres.",
      "Vermeld uw naam en gemeente zodat het parlementslid kan verifiëren dat u een kiezer bent. Anonieme berichten worden zelden beantwoord.",
      "Wees beleefd en feitelijk. Verstuur geen bedreigingen, beledigingen of intimiderende berichten.",
      "Parlementsleden ontvangen veel berichten. Een antwoord kan twee tot vier weken duren.",
      "Dit sjabloon is een conceptvertaling en werd niet beoordeeld door een Nederlandstalige juridische reviewer. Pas aan in uw eigen woorden.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-mp-humanitarian-access-fr",
    slug: "belgium-mp-humanitarian-access-fr",
    title: "[FR] Contacter un député fédéral belge — accès humanitaire à Gaza",
    actionType: "humanitarian_access",
    jurisdiction: "Belgique — Parlement fédéral (Chambre des représentants)",
    intendedAudience:
      "Électeurs et électrices en Belgique souhaitant demander à leur député·e fédéral·e d'insister sur l'accès humanitaire à Gaza par le biais de questions parlementaires et du contrôle gouvernemental.",
    purpose:
      "Les député·e·s fédéraux belges peuvent poser des questions parlementaires écrites et orales au ministre des Affaires étrangères et au ministre de la Coopération au développement. Ils peuvent également demander des auditions, des interpellations et des résolutions au sein de la Commission des Relations extérieures de la Chambre. Cette action fournit un modèle structuré et poli pour soulever la question de l'accès humanitaire à Gaza auprès d'un·e représentant·e fédéral·e belge.",
    policyAsk:
      "Les député·e·s fédéraux peuvent : soumettre des questions parlementaires écrites pour demander au gouvernement de clarifier sa position diplomatique sur l'accès humanitaire à Gaza ; demander à la Commission des Relations extérieures de la Chambre d'organiser une audition avec des organisations humanitaires ; presser le gouvernement d'augmenter le financement humanitaire ; et demander au Premier ministre et au ministre des Affaires étrangères de soulever la question de l'accès humanitaire lors des réunions du Conseil des Affaires étrangères de l'UE.",
    sourceBasis:
      "Constitution belge, articles 42–44 (contrôle parlementaire de l'action gouvernementale). Règlement de la Chambre des représentants, chapitre sur les questions parlementaires et interpellations. Quatrième Convention de Genève, article 23. Protocole additionnel I, article 70. Résolution 2417 (2018) du Conseil de sécurité de l'ONU. Engagement de la Belgique envers le DIH en tant qu'État partie aux Conventions de Genève. Contributions humanitaires belges documentées via openaid.be et le SPF Affaires étrangères.",
    instructions: `1. Identifiez votre député·e fédéral·e. La Belgique utilise la représentation proportionnelle. Trouvez votre circonscription électorale sur le site du SPF Intérieur (ibz.be). N'utilisez pas de bases de données tierces.
2. Trouvez les coordonnées officielles de votre député·e sur le site de la Chambre (lachambre.be). Utilisez uniquement le formulaire de contact parlementaire officiel ou l'adresse e-mail.
3. Adaptez le modèle ci-dessous dans vos propres mots. Les messages personnels des électeurs sont pris plus au sérieux que les lettres types identiques.
4. Vous pouvez joindre ou référencer des rapports publics récents : rapports de situation d'UN OCHA (ochaopt.org), mises à jour opérationnelles du CICR (icrc.org), ou évaluations de la sécurité alimentaire de l'IPC (ipcinfo.org).
5. Envoyez le message vous-même depuis votre propre adresse e-mail. Indiquez votre nom et votre commune pour que le/la député·e puisse vérifier que vous êtes un·e électeur·rice.
6. Les député·e·s répondent généralement dans un délai de deux à quatre semaines. Un suivi poli est approprié si vous ne recevez pas de réponse.`,
    templateBody: `[Votre nom]
[Votre commune — requis pour que le/la député·e vérifie votre qualité d'électeur·rice]

Madame la Députée, / Monsieur le Député,

Je vous écris en tant qu'habitant·e de [commune] au sujet de la situation humanitaire à Gaza.

Je suis préoccupé·e par les restrictions persistantes à l'accès humanitaire vers et à l'intérieur de la bande de Gaza, telles que documentées par UN OCHA, le CICR et de nombreuses organisations humanitaires. Le CICR a averti en juin 2026 que la réponse humanitaire à Gaza était au bord de l'effondrement total. Le rapport de situation d'UN OCHA de juillet 2026 documente une distribution d'eau de 17 000 mètres cubes par jour — en baisse de 15–20 % en raison de déficits de financement — et l'ensemble de la bande de Gaza classée en IPC Phase 3 (Crise).

La Belgique a une forte tradition de leadership humanitaire. Notre pays a contribué à hauteur de 19,5 millions d'euros à la réponse humanitaire à Gaza en 2025 et soutient l'UNRWA, le PAM et d'autres acteurs humanitaires. Je salue cet engagement.

Je vous demande de bien vouloir :
- Poser une question parlementaire écrite au ministre des Affaires étrangères pour lui demander quelles démarches diplomatiques la Belgique entreprend — bilatéralement et via l'UE — pour garantir un accès humanitaire complet, durable et sans entrave à Gaza
- Demander au ministre de la Coopération au développement si le financement humanitaire belge pour Gaza parvient aux bénéficiaires prévus et quels obstacles les partenaires humanitaires signalent
- Demander à la Commission des Relations extérieures de la Chambre d'organiser une audition avec les organisations humanitaires belges actives dans la réponse à Gaza

Je vous en fais la demande parce que [brève raison personnelle — une phrase].

Je vous remercie pour votre temps et pour représenter notre communauté au parlement fédéral.

Cordialement,
[Votre nom]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "fr",
    translationStatus: "draft",
    translationOf: "belgium-mp-humanitarian-access-en",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-chamber",
      "belgium-fps-foreign-affairs",
      "belgium-parliament-contact",
      "ocha-opt-main",
      "icrc-gaza-collapse-2026-06",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/countries/belgium",
      "/gaza-dossier",
      "/organizations",
      "/methodology",
    ],
    warnings: [
      "Cette page ne recherche pas votre député·e. Utilisez le site officiel de la Chambre (lachambre.be) pour trouver votre représentant·e.",
      "Aucun message n'est envoyé via cette plateforme. Copiez le texte et envoyez-le vous-même depuis votre propre adresse e-mail.",
      "Indiquez votre nom et votre commune pour que le/la député·e puisse vérifier que vous êtes électeur·rice. Les messages anonymes reçoivent rarement une réponse.",
      "Soyez poli·e et factuel·le. N'envoyez pas de menaces, d'injures ou de messages intimidants.",
      "Les député·e·s reçoivent de nombreux messages. Une réponse peut prendre deux à quatre semaines.",
      "Ce modèle est une traduction provisoire et n'a pas été examiné par un·e juriste francophone. Adaptez-le dans vos propres mots.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Belgium — Federal MP — ICC/ICJ Cooperation (EN / NL / FR)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "belgium-mp-icc-icj-cooperation-en",
    slug: "belgium-mp-icc-icj-cooperation-en",
    title: "Contact a Belgian federal MP — ICC and ICJ cooperation",
    actionType: "contact_representative",
    jurisdiction: "Belgium — Federal Parliament (Chamber of Representatives and Senate)",
    intendedAudience:
      "Constituents in Belgium who want to ask their federal MP to press for full Belgian cooperation with the International Criminal Court and the International Court of Justice in accountability processes concerning Gaza.",
    purpose:
      "Belgium is a State Party to the Rome Statute of the ICC and has filed an Article 63 declaration of intervention in the ICJ Genocide Convention case (South Africa v. Israel, December 2025). Belgian federal MPs can hold the government accountable for fulfilling these legal obligations — including enforcing ICC arrest warrants, supporting the ICC's budget and institutional integrity, and maintaining Belgium's intervention in the ICJ case.",
    policyAsk:
      "Belgian federal MPs can: submit written parliamentary questions asking the government to confirm that Belgium will enforce ICC arrest warrants if a person subject to a warrant enters Belgian territory; ask the government to state its position on the ICC Prosecutor's institutional continuity during the ASP review process; press for continued Belgian diplomatic support for the ICJ Genocide Convention case; and request clarity on Belgium's voting position at the ICC Assembly of States Parties.",
    sourceBasis:
      "Rome Statute of the International Criminal Court (Belgium ratified 28 June 2000). Belgian law of 29 March 2004 on cooperation with the ICC. ICJ Statute, Article 63 (Belgium intervention filed 23 December 2025). Brussels-Capital Region Parliament resolution (May 2025) calling for enforcement of ICC arrest warrants. Belgian Constitution, Articles 167–168 (treaty obligations and parliamentary oversight of foreign policy).",
    instructions: `1. Identify your federal MP on the Chamber of Representatives website (dekamer.be / lachambre.be). Senate members can also be contacted but the Chamber holds primary government oversight authority.
2. Find your MP's official parliamentary contact details. Use only the official parliamentary contact form or email address.
3. Adapt the template below. Reference specific recent developments — for example, the ICC ASP special session on 24 July 2026 regarding the Prosecutor, or Belgium's ICJ intervention of December 2025.
4. Send the message yourself from your own email address. Include your name and municipality.
5. Be specific about what you are asking. MPs receive many messages — a clear, focused request is more likely to receive a substantive response.`,
    templateBody: `[Your name]
[Your municipality]

Dear Ms/Mr [MP's name],

I am writing as a constituent from [municipality] about Belgium's cooperation with international criminal justice institutions regarding the situation in Gaza.

Belgium has a proud record of support for international justice. Our country hosts the ICC, the ICJ, and multiple international courts and tribunals. Belgium ratified the Rome Statute in 2000 and adopted comprehensive cooperation legislation in 2004. In December 2025, Belgium filed a declaration of intervention under Article 63 of the ICJ Statute in the South Africa v. Israel Genocide Convention case.

I welcome these actions, and I ask you to help ensure Belgium continues to lead by:

- Confirming publicly — through a parliamentary question to the Minister of Foreign Affairs — that Belgium will enforce ICC arrest warrants if any person subject to an active warrant enters Belgian territory
- Asking the government to state its position on maintaining the ICC Prosecutor's institutional independence and continuity during the Assembly of States Parties review process
- Pressing for continued diplomatic and financial support for the ICJ Genocide Convention case
- Requesting clarity on how Belgium votes at the ICC Assembly of States Parties on matters affecting the Palestine situation

Belgium's commitment to international justice is not only a legal obligation — it is a core part of our foreign policy identity and our contribution to a rules-based international order.

Thank you for your time and for your service in the federal parliament.

Yours sincerely,
[Your name]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-chamber",
      "belgium-icj-intervention-2025",
      "belgium-brussels-parliament-icc-2025-05",
      "icc-arrest-warrants-2024-11",
      "icc-palestine-2024",
      "icc-khan-2025-2026",
      "icj-case-192",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/countries/belgium",
      "/legal-tracker",
      "/methodology",
    ],
    warnings: [
      "This page does not look up your MP. Use the official Chamber website (dekamer.be / lachambre.be).",
      "No message is sent through this platform. Copy and send yourself.",
      "Include your name and municipality — anonymous messages are rarely answered.",
      "Do not send threats, abuse, or harassing messages. Lawful civic engagement only.",
      "ICC and ICJ proceedings are complex and ongoing. Be precise about what is a ruling, a warrant, an investigation, or a procedural step.",
      "This template has not been reviewed by a Belgian parliamentary expert or international law specialist.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-mp-icc-icj-cooperation-nl",
    slug: "belgium-mp-icc-icj-cooperation-nl",
    title: "[NL] Contacteer een federaal parlementslid — samenwerking met ICC en ICJ",
    actionType: "contact_representative",
    jurisdiction: "België — Federaal Parlement (Kamer van Volksvertegenwoordigers en Senaat)",
    intendedAudience:
      "Kiezers in België die hun federale volksvertegenwoordiger willen vragen aan te dringen op volledige Belgische samenwerking met het Internationaal Strafhof en het Internationaal Gerechtshof in verantwoordingsprocessen betreffende Gaza.",
    purpose:
      "België is verdragspartij bij het Statuut van Rome van het ICC en heeft een verklaring van interventie onder artikel 63 ingediend in de Genocideconventie-zaak bij het ICJ (Zuid-Afrika t. Israël, december 2025). Belgische federale volksvertegenwoordigers kunnen de regering ter verantwoording roepen voor het nakomen van deze wettelijke verplichtingen — inclusief het uitvoeren van ICC-arrestatiebevelen, het ondersteunen van de begroting en institutionele integriteit van het ICC, en het handhaven van de Belgische interventie in de ICJ-zaak.",
    policyAsk:
      "Federale volksvertegenwoordigers kunnen: schriftelijke parlementaire vragen indienen om de regering te vragen te bevestigen dat België ICC-arrestatiebevelen zal uitvoeren als een persoon tegen wie een bevel loopt Belgisch grondgebied betreedt; de regering vragen haar standpunt kenbaar te maken over de institutionele continuïteit van de ICC-Aanklager tijdens het ASP-beoordelingsproces; aandringen op voortgezette Belgische diplomatieke steun voor de ICJ-Genocideconventiezaak; en duidelijkheid vragen over het Belgische stemgedrag in de Vergadering van Verdragspartijen van het ICC.",
    sourceBasis:
      "Statuut van Rome van het Internationaal Strafhof (België geratificeerd op 28 juni 2000). Belgische wet van 29 maart 2004 betreffende de samenwerking met het ICC. Statuut van het ICJ, artikel 63 (Belgische interventie ingediend op 23 december 2025). Resolutie van het Brussels Hoofdstedelijk Parlement (mei 2025) waarin wordt opgeroepen tot uitvoering van ICC-arrestatiebevelen. Belgische Grondwet, artikelen 167–168 (verdragsverplichtingen en parlementair toezicht op buitenlands beleid).",
    instructions: `1. Zoek uw federaal parlementslid op de website van de Kamer (dekamer.be). Ook senatoren kunnen worden aangeschreven, maar de Kamer heeft de primaire bevoegdheid voor regeringscontrole.
2. Vind de officiële parlementaire contactgegevens van uw volksvertegenwoordiger. Gebruik uitsluitend het officiële parlementaire contactformulier of e-mailadres.
3. Pas het onderstaande sjabloon aan. Verwijs naar specifieke recente ontwikkelingen — bijvoorbeeld de bijzondere zitting van de ASP van het ICC op 24 juli 2026 over de Aanklager, of de Belgische ICJ-interventie van december 2025.
4. Verstuur het bericht zelf vanaf uw eigen e-mailadres. Vermeld uw naam en gemeente.
5. Wees specifiek over wat u vraagt. Parlementsleden ontvangen veel berichten — een duidelijk, gericht verzoek krijgt eerder een inhoudelijk antwoord.`,
    templateBody: `[Je naam]
[Je gemeente]

Geachte mevrouw [Naam], / Geachte heer [Naam],

Ik schrijf u als inwoner van [gemeente] over de Belgische samenwerking met internationale strafrechtelijke instellingen aangaande de situatie in Gaza.

België heeft een trotse traditie van steun aan internationale gerechtigheid. Ons land huisvest het ICC, het ICJ en meerdere internationale hoven en tribunalen. België ratificeerde het Statuut van Rome in 2000 en nam uitgebreide samenwerkingswetgeving aan in 2004. In december 2025 diende België een verklaring van interventie onder artikel 63 van het ICJ-Statuut in in de zaak Zuid-Afrika t. Israël over de Genocideconventie.

Ik verwelkom deze stappen en verzoek u te helpen ervoor te zorgen dat België blijft leiden door:

- Via een parlementaire vraag aan de minister van Buitenlandse Zaken openbaar te laten bevestigen dat België ICC-arrestatiebevelen zal uitvoeren als een persoon tegen wie een actief bevel loopt Belgisch grondgebied betreedt
- De regering te vragen haar standpunt kenbaar te maken over het handhaven van de institutionele onafhankelijkheid en continuïteit van de ICC-Aanklager tijdens het beoordelingsproces van de Vergadering van Verdragspartijen
- Aan te dringen op voortgezette diplomatieke en financiële steun voor de ICJ-Genocideconventiezaak
- Duidelijkheid te vragen over hoe België stemt in de Vergadering van Verdragspartijen van het ICC over zaken die de Palestina-situatie beïnvloeden

De Belgische inzet voor internationale gerechtigheid is niet alleen een wettelijke verplichting — het is een kernonderdeel van onze identiteit in het buitenlands beleid en onze bijdrage aan een op regels gebaseerde internationale orde.

Dank u voor uw tijd en voor uw inzet in het federaal parlement.

Met vriendelijke groet,
[Je naam]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "nl",
    translationStatus: "draft",
    translationOf: "belgium-mp-icc-icj-cooperation-en",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-chamber",
      "belgium-icj-intervention-2025",
      "belgium-brussels-parliament-icc-2025-05",
      "icc-arrest-warrants-2024-11",
      "icc-palestine-2024",
      "icc-khan-2025-2026",
      "icj-case-192",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/countries/belgium",
      "/legal-tracker",
      "/methodology",
    ],
    warnings: [
      "Deze pagina zoekt uw parlementslid niet op. Gebruik de officiële Kamerwebsite (dekamer.be).",
      "Er wordt geen bericht verzonden via dit platform. Kopieer en verstuur zelf.",
      "Vermeld uw naam en gemeente — anonieme berichten worden zelden beantwoord.",
      "Verstuur geen bedreigingen, beledigingen of intimiderende berichten. Enkel wettige burgerbetrokkenheid.",
      "ICC- en ICJ-procedures zijn complex en lopende. Wees precies over wat een uitspraak, een bevel, een onderzoek of een procedurele stap is.",
      "Dit sjabloon is een conceptvertaling en werd niet beoordeeld door een Belgische parlementaire expert of internationaalrechtelijke specialist.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-mp-icc-icj-cooperation-fr",
    slug: "belgium-mp-icc-icj-cooperation-fr",
    title: "[FR] Contacter un député fédéral belge — coopération avec la CPI et la CIJ",
    actionType: "contact_representative",
    jurisdiction: "Belgique — Parlement fédéral (Chambre des représentants et Sénat)",
    intendedAudience:
      "Électeurs et électrices en Belgique souhaitant demander à leur député·e fédéral·e d'insister sur la pleine coopération de la Belgique avec la Cour pénale internationale et la Cour internationale de Justice dans les processus de responsabilité concernant Gaza.",
    purpose:
      "La Belgique est un État partie au Statut de Rome de la CPI et a déposé une déclaration d'intervention au titre de l'article 63 dans l'affaire de la Convention sur le génocide devant la CIJ (Afrique du Sud c. Israël, décembre 2025). Les député·e·s fédéraux belges peuvent demander des comptes au gouvernement pour le respect de ces obligations légales — y compris l'exécution des mandats d'arrêt de la CPI, le soutien au budget et à l'intégrité institutionnelle de la CPI, et le maintien de l'intervention belge dans l'affaire devant la CIJ.",
    policyAsk:
      "Les député·e·s fédéraux peuvent : poser des questions parlementaires écrites pour demander au gouvernement de confirmer que la Belgique exécutera les mandats d'arrêt de la CPI si une personne faisant l'objet d'un mandat entre sur le territoire belge ; demander au gouvernement de préciser sa position sur la continuité institutionnelle du Procureur de la CPI pendant le processus d'examen de l'ASP ; insister pour un soutien diplomatique belge continu à l'affaire de la Convention sur le génocide devant la CIJ ; et demander des précisions sur le vote de la Belgique à l'Assemblée des États parties de la CPI.",
    sourceBasis:
      "Statut de Rome de la Cour pénale internationale (ratifié par la Belgique le 28 juin 2000). Loi belge du 29 mars 2004 relative à la coopération avec la CPI. Statut de la CIJ, article 63 (intervention belge déposée le 23 décembre 2025). Résolution du Parlement de la Région de Bruxelles-Capitale (mai 2025) appelant à l'exécution des mandats d'arrêt de la CPI. Constitution belge, articles 167–168 (obligations conventionnelles et contrôle parlementaire de la politique étrangère).",
    instructions: `1. Identifiez votre député·e fédéral·e sur le site de la Chambre (lachambre.be). Les sénateurs peuvent également être contactés, mais la Chambre détient l'autorité principale de contrôle gouvernemental.
2. Trouvez les coordonnées parlementaires officielles de votre député·e. Utilisez uniquement le formulaire de contact parlementaire officiel ou l'adresse e-mail.
3. Adaptez le modèle ci-dessous. Faites référence à des développements récents spécifiques — par exemple, la session extraordinaire de l'ASP de la CPI le 24 juillet 2026 concernant le Procureur, ou l'intervention belge à la CIJ de décembre 2025.
4. Envoyez le message vous-même depuis votre propre adresse e-mail. Indiquez votre nom et votre commune.
5. Soyez précis·e dans votre demande. Les député·e·s reçoivent de nombreux messages — une demande claire et ciblée a plus de chances d'obtenir une réponse substantielle.`,
    templateBody: `[Votre nom]
[Votre commune]

Madame la Députée, / Monsieur le Député,

Je vous écris en tant qu'habitant·e de [commune] au sujet de la coopération de la Belgique avec les institutions de justice pénale internationale concernant la situation à Gaza.

La Belgique a une fière tradition de soutien à la justice internationale. Notre pays accueille la CPI, la CIJ et de multiples cours et tribunaux internationaux. La Belgique a ratifié le Statut de Rome en 2000 et a adopté une législation complète de coopération en 2004. En décembre 2025, la Belgique a déposé une déclaration d'intervention au titre de l'article 63 du Statut de la CIJ dans l'affaire Afrique du Sud c. Israël concernant la Convention sur le génocide.

Je salue ces actions et je vous demande de bien vouloir aider à garantir que la Belgique continue de montrer la voie en :

- Confirmant publiquement — par le biais d'une question parlementaire au ministre des Affaires étrangères — que la Belgique exécutera les mandats d'arrêt de la CPI si une personne faisant l'objet d'un mandat actif entre sur le territoire belge
- Demandant au gouvernement de préciser sa position sur le maintien de l'indépendance et de la continuité institutionnelle du Procureur de la CPI pendant le processus d'examen de l'Assemblée des États parties
- Insistant pour un soutien diplomatique et financier continu à l'affaire de la Convention sur le génocide devant la CIJ
- Demandant des précisions sur la manière dont la Belgique vote à l'Assemblée des États parties de la CPI sur les questions affectant la situation en Palestine

L'engagement de la Belgique en faveur de la justice internationale n'est pas seulement une obligation légale — c'est un élément central de notre identité en matière de politique étrangère et de notre contribution à un ordre international fondé sur des règles.

Je vous remercie pour votre temps et pour votre service au parlement fédéral.

Cordialement,
[Votre nom]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "fr",
    translationStatus: "draft",
    translationOf: "belgium-mp-icc-icj-cooperation-en",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-chamber",
      "belgium-icj-intervention-2025",
      "belgium-brussels-parliament-icc-2025-05",
      "icc-arrest-warrants-2024-11",
      "icc-palestine-2024",
      "icc-khan-2025-2026",
      "icj-case-192",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/countries/belgium",
      "/legal-tracker",
      "/methodology",
    ],
    warnings: [
      "Cette page ne recherche pas votre député·e. Utilisez le site officiel de la Chambre (lachambre.be).",
      "Aucun message n'est envoyé via cette plateforme. Copiez et envoyez vous-même.",
      "Indiquez votre nom et votre commune — les messages anonymes reçoivent rarement une réponse.",
      "N'envoyez pas de menaces, d'injures ou de messages intimidants. Engagement civique légal uniquement.",
      "Les procédures de la CPI et de la CIJ sont complexes et en cours. Soyez précis·e sur ce qui constitue un arrêt, un mandat, une enquête ou une étape procédurale.",
      "Ce modèle est une traduction provisoire et n'a pas été examiné par un·e expert·e parlementaire belge ou un·e spécialiste du droit international.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Belgium — Regional Representative — Arms-Export Transparency (EN / NL / FR)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "belgium-regional-arms-review-en",
    slug: "belgium-regional-arms-review-en",
    title: "Contact a Belgian regional representative — arms-export transparency and review",
    actionType: "arms_transfer_review",
    jurisdiction: "Belgium — Regional governments (Flanders, Wallonia, Brussels-Capital)",
    intendedAudience:
      "Constituents in Belgium who want to contact their regional representative about arms-export licensing, transit, and transparency — an area of regional competence under Belgian federalism.",
    purpose:
      "In Belgium, arms-export licensing is a regional competence. The Flemish, Walloon, and Brussels-Capital governments each issue, deny, and review arms-export and transit licences independently. Regional parliaments can hold their governments accountable for licensing decisions. This action provides a template for constituents in any Belgian region to contact their regional MP about arms-export transparency and review.",
    policyAsk:
      "Regional MPs can: ask written questions to the regional Minister-President or competent minister about specific arms-export licences and transit approvals; request regional parliamentary hearings on arms-export policy; press the regional government to publish licensing summaries and compliance data; and demand enforcement of existing restrictions — including the Flemish court-ordered halt to defence-related transit (Brussels Court of First Instance, July 2025) and Wallonia's enforcement of transit licensing requirements.",
    sourceBasis:
      "Belgian Constitution, Articles 39 and 127–130 (regional competences). Special Act of 8 August 1980 on Institutional Reform (arms-export licensing as a regional competence since 2003). Flemish Decree of 15 June 2012 on arms-export control. Walloon Decree of 20 October 2016 on arms-export control. Brussels-Capital Region Ordinance on arms transit (as amended). Brussels Court of First Instance order (July 2025) halting Flemish arms transit. EU Common Position 2008/944/CFSP. Arms Trade Treaty (Belgium ratified 2014).",
    instructions: `1. Determine your region and identify your regional MP. Flanders: vlaamsparlement.be. Wallonia: parlement-wallonie.be. Brussels-Capital: parlement.brussels. Use official parliamentary websites only.
2. Find your regional MP's contact details on the relevant regional parliament website.
3. Arms-export licensing is technical. If you are concerned about a specific licence, transit, or policy, reference public information where available. Belgium publishes annual arms-export reports to the EU; Wallonia and Flanders publish regional export data.
4. Adapt the template. Specify which region you are writing to and which aspect of arms-export policy concerns you.
5. Send from your own email address. Include your name and municipality.`,
    templateBody: `[Your name]
[Your municipality — in the relevant region]

Dear Ms/Mr [Regional MP's name],

I am writing as a constituent from [municipality, region] about [Flanders' / Wallonia's / Brussels-Capital Region's] arms-export licensing and transit policy concerning [recipient country or region — e.g. Israel / parties to the Gaza conflict].

I am concerned that arms or arms components licensed for export or transit through [Flanders / Wallonia / Brussels-Capital] may be used in serious violations of international humanitarian law, as documented by [reference public sources — UN Commission of Inquiry, ICRC, credible human-rights organisations].

Belgium's regions have significant autonomy in arms-export control. This autonomy carries responsibility. Under the EU Common Position 2008/944/CFSP, Member States must deny export licences where there is a clear risk that the items would be used to commit serious IHL violations. The Arms Trade Treaty requires the same assessment.

[If writing in Flanders: I note the Brussels Court of First Instance order of July 2025 requiring the Flemish government to halt all transit of defence-related products to Israel without firm assurance of exclusive civilian use, and imposing €50,000 fines per violation.]

[If writing in Wallonia: I note Wallonia's October 2025 action blocking a Swiss military shipment destined for Elbit Systems at Liège Airport, and the Council of State's annulment of the earlier transit ban decree.]

I ask that you:
- Ask the regional government, through a parliamentary question, to clarify how many export and transit licences for [recipient] are currently active in [Flanders / Wallonia / Brussels-Capital]
- Press for a review of existing licences against the criteria of EU Common Position 2008/944/CFSP
- Request the regional government to publish a summary of licensing data and compliance assessments

I ask this because [brief personal reason].

Thank you for your time and for your service in the [Flemish / Walloon / Brussels-Capital] Parliament.

Yours sincerely,
[Your name]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-flanders-court-2025-07",
      "belgium-wallonia-block-2025-10",
      "belgium-seizure-2026-04",
      "eu-common-position-2008-944",
      "arms-trade-treaty",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/countries/belgium",
      "/legal-tracker",
      "/methodology",
    ],
    warnings: [
      "This page does not look up your regional MP. Use your regional parliament's official website.",
      "No message is sent through this platform. Copy and send yourself.",
      "Arms-export licensing involves commercial and security-classified information. Representatives may not be able to discuss specific licences publicly.",
      "Belgium's regional competence structure is complex. Verify you are contacting the correct level of government before sending.",
      "This template has not been reviewed by a Belgian arms-export control expert. Adapt to your own words.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-regional-arms-review-nl",
    slug: "belgium-regional-arms-review-nl",
    title: "[NL] Contacteer een regionaal parlementslid — transparantie en toetsing van wapenuitvoer",
    actionType: "arms_transfer_review",
    jurisdiction: "België — Regionale overheden (Vlaanderen, Wallonië, Brussels Hoofdstedelijk Gewest)",
    intendedAudience:
      "Kiezers in België die hun regionale volksvertegenwoordiger willen contacteren over wapenuitvoervergunningen, doorvoer en transparantie — een regionale bevoegdheid onder het Belgisch federalisme.",
    purpose:
      "In België is wapenuitvoervergunning een regionale bevoegdheid. De Vlaamse, Waalse en Brusselse Hoofdstedelijke regeringen verlenen, weigeren en toetsen elk onafhankelijk wapenuitvoer- en doorvoervergunningen. Regionale parlementen kunnen hun regeringen ter verantwoording roepen over vergunningsbeslissingen. Deze actie biedt een sjabloon voor kiezers in elke Belgische regio om hun regionale parlementslid aan te schrijven over transparantie en toetsing van wapenuitvoer.",
    policyAsk:
      "Regionale parlementsleden kunnen: schriftelijke vragen stellen aan de regionale minister-president of bevoegde minister over specifieke wapenuitvoervergunningen en doorvoergoedkeuringen; regionale parlementaire hoorzittingen over wapenuitvoerbeleid aanvragen; de regionale regering vragen vergunningssamenvattingen en nalevingsgegevens te publiceren; en handhaving eisen van bestaande beperkingen — inclusief het Vlaamse gerechtelijke bevel tot stopzetting van defensiegerelateerde doorvoer (Rechtbank van Eerste Aanleg Brussel, juli 2025) en de Waalse handhaving van doorvoervergunningsvereisten.",
    sourceBasis:
      "Belgische Grondwet, artikelen 39 en 127–130 (regionale bevoegdheden). Bijzondere Wet van 8 augustus 1980 tot Hervorming der Instellingen (wapenuitvoervergunning als regionale bevoegdheid sinds 2003). Vlaams Decreet van 15 juni 2012 betreffende de controle op wapenuitvoer. Waals Decreet van 20 oktober 2016 betreffende de controle op wapenuitvoer. Brusselse Hoofdstedelijke Ordonnantie inzake wapendoorvoer (zoals gewijzigd). Bevel van de Rechtbank van Eerste Aanleg Brussel (juli 2025) tot stopzetting van Vlaamse wapendoorvoer. EU-Gemeenschappelijk Standpunt 2008/944/GBVB. Wapenhandelsverdrag (België geratificeerd in 2014).",
    instructions: `1. Bepaal uw regio en zoek uw regionaal parlementslid. Vlaanderen: vlaamsparlement.be. Wallonië: parlement-wallonie.be. Brussels Hoofdstedelijk Gewest: parlement.brussels. Gebruik uitsluitend officiële parlementaire websites.
2. Vind de contactgegevens van uw regionale parlementslid op de relevante regionale parlementswebsite.
3. Wapenuitvoervergunning is technisch. Als u zich zorgen maakt over een specifieke vergunning, doorvoer of beleid, verwijs dan naar openbare informatie waar beschikbaar. België publiceert jaarlijkse wapenuitvoerrapporten aan de EU; Vlaanderen en Wallonië publiceren regionale uitvoergegevens.
4. Pas het sjabloon aan. Specificeer naar welke regio u schrijft en welk aspect van het wapenuitvoerbeleid u zorgen baart.
5. Verstuur vanaf uw eigen e-mailadres. Vermeld uw naam en gemeente.`,
    templateBody: `[Je naam]
[Je gemeente — in de relevante regio]

Geachte mevrouw [Naam], / Geachte heer [Naam],

Ik schrijf u als inwoner van [gemeente, regio] over het wapenuitvoer- en doorvoerbeleid van [Vlaanderen / Wallonië / het Brussels Hoofdstedelijk Gewest] met betrekking tot [ontvangend land of regio — bv. Israël / partijen bij het conflict in Gaza].

Ik maak me zorgen dat wapens of wapenonderdelen waarvoor een uitvoer- of doorvoervergunning is verleend in [Vlaanderen / Wallonië / Brussel] gebruikt kunnen worden bij ernstige schendingen van het internationaal humanitair recht, zoals gedocumenteerd door [verwijs naar openbare bronnen — VN-Onderzoekscommissie, ICRC, geloofwaardige mensenrechtenorganisaties].

De Belgische regio's hebben aanzienlijke autonomie in wapenuitvoercontrole. Deze autonomie brengt verantwoordelijkheid met zich mee. Volgens het EU-Gemeenschappelijk Standpunt 2008/944/GBVB moeten lidstaten uitvoervergunningen weigeren wanneer er een duidelijk risico bestaat dat de goederen gebruikt zullen worden voor ernstige IHR-schendingen. Het Wapenhandelsverdrag vereist dezelfde beoordeling.

[Indien u schrijft naar Vlaanderen: Ik wijs op het bevel van de Rechtbank van Eerste Aanleg Brussel van juli 2025 waarin de Vlaamse regering werd opgedragen alle doorvoer van defensiegerelateerde producten naar Israël te stoppen zonder stevige garantie van uitsluitend civiel gebruik, met boetes van €50.000 per overtreding.]

[Indien u schrijft naar Wallonië: Ik wijs op het optreden van Wallonië in oktober 2025 waarbij een Zwitserse militaire zending bestemd voor Elbit Systems werd geblokkeerd op de luchthaven van Luik, en de vernietiging door de Raad van State van het eerdere doorvoerverboddecreet.]

Ik verzoek u:
- De regionale regering, via een parlementaire vraag, te vragen te verduidelijken hoeveel uitvoer- en doorvoervergunningen voor [ontvanger] momenteel actief zijn in [Vlaanderen / Wallonië / Brussel]
- Aan te dringen op een toetsing van bestaande vergunningen aan de criteria van EU-Gemeenschappelijk Standpunt 2008/944/GBVB
- De regionale regering te verzoeken een samenvatting van vergunningsgegevens en nalevingsbeoordelingen te publiceren

Ik vraag dit omdat [korte persoonlijke reden].

Dank u voor uw tijd en voor uw inzet in het [Vlaams / Waals / Brussels Hoofdstedelijk] Parlement.

Met vriendelijke groet,
[Je naam]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "nl",
    translationStatus: "draft",
    translationOf: "belgium-regional-arms-review-en",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-flanders-court-2025-07",
      "belgium-wallonia-block-2025-10",
      "belgium-seizure-2026-04",
      "eu-common-position-2008-944",
      "arms-trade-treaty",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/countries/belgium",
      "/legal-tracker",
      "/methodology",
    ],
    warnings: [
      "Deze pagina zoekt uw regionale parlementslid niet op. Gebruik de officiële website van uw regionaal parlement.",
      "Er wordt geen bericht verzonden via dit platform. Kopieer en verstuur zelf.",
      "Wapenuitvoervergunning heeft te maken met commercieel en veiligheidsgeclassificeerde informatie. Volksvertegenwoordigers kunnen mogelijk niet openbaar over specifieke vergunningen praten.",
      "De Belgische regionale bevoegdheidsstructuur is complex. Controleer voor verzending dat u het juiste overheidsniveau aanschrijft.",
      "Dit sjabloon is een conceptvertaling en werd niet beoordeeld door een Belgische expert in wapenuitvoercontrole. Pas aan in uw eigen woorden.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-regional-arms-review-fr",
    slug: "belgium-regional-arms-review-fr",
    title: "[FR] Contacter un élu régional belge — transparence et contrôle des exportations d'armes",
    actionType: "arms_transfer_review",
    jurisdiction: "Belgique — Gouvernements régionaux (Flandre, Wallonie, Bruxelles-Capitale)",
    intendedAudience:
      "Électeurs et électrices en Belgique souhaitant contacter leur élu·e régional·e au sujet des licences d'exportation et de transit d'armes, et de la transparence — une compétence régionale dans le fédéralisme belge.",
    purpose:
      "En Belgique, la licence d'exportation d'armes est une compétence régionale. Les gouvernements flamand, wallon et bruxellois délivrent, refusent et contrôlent chacun indépendamment les licences d'exportation et de transit d'armes. Les parlements régionaux peuvent demander des comptes à leurs gouvernements sur les décisions de licence. Cette action fournit un modèle pour que les électeurs de toute région belge puissent contacter leur député·e régional·e au sujet de la transparence et du contrôle des exportations d'armes.",
    policyAsk:
      "Les député·e·s régionaux peuvent : poser des questions écrites au ministre-président ou au ministre compétent de la région sur des licences d'exportation et des autorisations de transit spécifiques ; demander des auditions parlementaires régionales sur la politique d'exportation d'armes ; presser le gouvernement régional de publier des résumés de licences et des données de conformité ; et exiger l'application des restrictions existantes — y compris l'ordonnance judiciaire flamande de cessation du transit lié à la défense (Tribunal de première instance de Bruxelles, juillet 2025) et l'application par la Wallonie des exigences de licence de transit.",
    sourceBasis:
      "Constitution belge, articles 39 et 127–130 (compétences régionales). Loi spéciale du 8 août 1980 de réformes institutionnelles (licence d'exportation d'armes comme compétence régionale depuis 2003). Décret flamand du 15 juin 2012 relatif au contrôle des exportations d'armes. Décret wallon du 20 octobre 2016 relatif au contrôle des exportations d'armes. Ordonnance de la Région de Bruxelles-Capitale sur le transit d'armes (telle que modifiée). Ordonnance du Tribunal de première instance de Bruxelles (juillet 2025) ordonnant l'arrêt du transit d'armes flamand. Position commune de l'UE 2008/944/PESC. Traité sur le commerce des armes (ratifié par la Belgique en 2014).",
    instructions: `1. Déterminez votre région et identifiez votre député·e régional·e. Flandre : vlaamsparlement.be. Wallonie : parlement-wallonie.be. Bruxelles-Capitale : parlement.brussels. Utilisez uniquement les sites officiels des parlements.
2. Trouvez les coordonnées de votre député·e régional·e sur le site du parlement régional concerné.
3. Les licences d'exportation d'armes sont techniques. Si vous êtes préoccupé·e par une licence, un transit ou une politique spécifique, référencez des informations publiques lorsqu'elles sont disponibles. La Belgique publie des rapports annuels sur les exportations d'armes à l'UE ; la Flandre et la Wallonie publient des données régionales sur les exportations.
4. Adaptez le modèle. Précisez à quelle région vous vous adressez et quel aspect de la politique d'exportation d'armes vous préoccupe.
5. Envoyez depuis votre propre adresse e-mail. Indiquez votre nom et votre commune.`,
    templateBody: `[Votre nom]
[Votre commune — dans la région concernée]

Madame la Députée, / Monsieur le Député,

Je vous écris en tant qu'habitant·e de [commune, région] au sujet de la politique de [la Flandre / la Wallonie / la Région de Bruxelles-Capitale] en matière de licences d'exportation et de transit d'armes concernant [pays ou région destinataire — ex. Israël / parties au conflit à Gaza].

Je suis préoccupé·e par le fait que des armes ou des composants d'armes dont l'exportation ou le transit est autorisé par [la Flandre / la Wallonie / Bruxelles-Capitale] puissent être utilisés dans des violations graves du droit international humanitaire, telles que documentées par [référencez des sources publiques — Commission d'enquête de l'ONU, CICR, organisations de droits humains crédibles].

Les régions belges disposent d'une autonomie significative en matière de contrôle des exportations d'armes. Cette autonomie s'accompagne de responsabilités. Selon la Position commune de l'UE 2008/944/PESC, les États membres doivent refuser les licences d'exportation lorsqu'il existe un risque manifeste que les articles soient utilisés pour commettre des violations graves du DIH. Le Traité sur le commerce des armes exige la même évaluation.

[Si vous écrivez en Flandre : Je note l'ordonnance du Tribunal de première instance de Bruxelles de juillet 2025 exigeant du gouvernement flamand qu'il cesse tout transit de produits liés à la défense vers Israël sans assurance ferme d'usage civil exclusif, avec des amendes de 50 000 € par infraction.]

[Si vous écrivez en Wallonie : Je note l'action de la Wallonie en octobre 2025 bloquant un envoi militaire suisse destiné à Elbit Systems à l'aéroport de Liège, et l'annulation par le Conseil d'État du précédent décret d'interdiction de transit.]

Je vous demande de bien vouloir :
- Demander au gouvernement régional, par une question parlementaire, de clarifier combien de licences d'exportation et de transit pour [destinataire] sont actuellement actives en [Flandre / Wallonie / Bruxelles-Capitale]
- Insister pour un examen des licences existantes au regard des critères de la Position commune de l'UE 2008/944/PESC
- Demander au gouvernement régional de publier un résumé des données de licence et des évaluations de conformité

Je vous en fais la demande parce que [brève raison personnelle].

Je vous remercie pour votre temps et pour votre service au Parlement [flamand / wallon / de la Région de Bruxelles-Capitale].

Cordialement,
[Votre nom]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "fr",
    translationStatus: "draft",
    translationOf: "belgium-regional-arms-review-en",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-flanders-court-2025-07",
      "belgium-wallonia-block-2025-10",
      "belgium-seizure-2026-04",
      "eu-common-position-2008-944",
      "arms-trade-treaty",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/countries/belgium",
      "/legal-tracker",
      "/methodology",
    ],
    warnings: [
      "Cette page ne recherche pas votre député·e régional·e. Utilisez le site officiel de votre parlement régional.",
      "Aucun message n'est envoyé via cette plateforme. Copiez et envoyez vous-même.",
      "Les licences d'exportation d'armes impliquent des informations commerciales et classifiées. Les représentants peuvent ne pas pouvoir discuter publiquement de licences spécifiques.",
      "La structure des compétences régionales belges est complexe. Vérifiez que vous contactez le bon niveau de gouvernement avant d'envoyer.",
      "Ce modèle est une traduction provisoire et n'a pas été examiné par un·e expert·e belge du contrôle des exportations d'armes. Adaptez-le dans vos propres mots.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // English-only templates 4–10 for brevity — NL and FR translations follow
  // the same pattern (translationStatus: "draft", languageReviewStatus: "draft",
  // contentStatus: "review_pending"). Full EN/NL/FR records are in the data
  // file. This block covers the remaining 7 English templates.
  // ═══════════════════════════════════════════════════════════════════════════

  // 4. Belgian Foreign Affairs — Public Policy Clarification (EN)
  {
    id: "belgium-foreign-affairs-clarification-en",
    slug: "belgium-foreign-affairs-clarification-en",
    title: "Contact Belgian Foreign Affairs — request public policy clarification",
    actionType: "contact_representative",
    jurisdiction: "Belgium — Federal Public Service Foreign Affairs",
    intendedAudience:
      "Anyone — Belgian residents and international observers — who wants to request a public clarification of Belgium's foreign policy position on Gaza, arms transfers, ICC/ICJ cooperation, or humanitarian access. FPS Foreign Affairs responds to public and media enquiries.",
    purpose:
      "The Belgian Federal Public Service Foreign Affairs publishes official government positions and responds to public enquiries about foreign policy. This action provides a polite, factual template for requesting public clarification of Belgium's policy on specific Gaza-related accountability issues — arms exports, sanctions policy, ICC arrest warrant enforcement, humanitarian funding, or diplomatic positions at the UN and EU.",
    policyAsk:
      "FPS Foreign Affairs can: publish official clarifications of government policy on its website (diplomatie.belgium.be); confirm Belgium's votes and positions in EU and UN forums; respond to public enquiries about specific policy areas; and direct enquiries to the competent minister or service.",
    sourceBasis:
      "Belgian law of 11 April 1994 on administrative transparency (public access to administrative documents). FPS Foreign Affairs mission statement and public communication policy (diplomatie.belgium.be). Belgian Constitution, Article 32 (right to consult administrative documents). This action is based on the general right of any person to request information from public authorities.",
    instructions: `1. Visit the FPS Foreign Affairs website (diplomatie.belgium.be) and navigate to the contact or press section.
2. Select the appropriate contact form — general enquiries, press, or a specific policy area.
3. Use the template below as a guide. Be specific: ask about one policy area per message. A focused request is more likely to receive a substantive response.
4. Send from your own email address. You do not need to be a Belgian resident to request public policy information, but including your country of residence and the reason for your interest may help contextualise your request.
5. Government public information services typically respond within two to four weeks. A response may be a general statement rather than a detailed policy analysis.`,
    templateBody: `[Your name]
[Your country and city of residence — optional but helpful]

To the FPS Foreign Affairs press and information service,

I am writing to request public clarification of Belgium's current policy position on the following matter:

[Choose ONE specific topic — be precise:
- Belgium's enforcement policy regarding ICC arrest warrants issued in the Palestine situation (November 2024)
- Belgium's diplomatic position on the EU-Israel Association Agreement review and proposed partial suspension
- Belgium's current assessment of compliance with EU Common Position 2008/944/CFSP criteria for arms-export licences concerning Israel
- Belgium's humanitarian funding commitments for Gaza in 2026 and obstacles reported by humanitarian partners
- Belgium's voting position at the ICC Assembly of States Parties on matters concerning the Palestine situation]

I am asking because [brief reason — e.g. "I am a researcher documenting state practice on ICC cooperation" / "I am a Belgian constituent concerned about the consistency of Belgian foreign policy" / "I am a journalist preparing a report on EU member-state positions"].

I would be grateful for any public statement, published policy document, or official position that you can direct me to — or for a brief clarification if one is available.

Thank you for your time.

Yours faithfully,
[Your name]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-fps-foreign-affairs",
      "belgium-sanctions-2025-09",
      "belgium-humanitarian-2025-09",
      "belgium-icj-intervention-2025",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/countries/belgium",
      "/methodology",
    ],
    warnings: [
      "No message is sent through this platform. Send from your own email address.",
      "Government information services provide public information — not legal advice or detailed policy analysis.",
      "Be polite and factual. This is a request for public information, not a demand or complaint.",
      "A response may take several weeks or may be a general statement. You may not receive a detailed answer to every question.",
      "This template has not been reviewed by a Belgian administrative law expert.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-foreign-affairs-clarification-nl",
    slug: "belgium-foreign-affairs-clarification-nl",
    title: "[NL] Contacteer FOD Buitenlandse Zaken — verzoek om publieke beleidsverduidelijking",
    actionType: "contact_representative",
    jurisdiction: "België — Federale Overheidsdienst Buitenlandse Zaken",
    intendedAudience:
      "Iedereen — inwoners van België en internationale waarnemers — die een publieke verduidelijking wil vragen van het Belgische buitenlandbeleid over Gaza, wapenuitvoer, samenwerking met ICC/ICJ of humanitaire toegang.",
    purpose:
      "De FOD Buitenlandse Zaken publiceert officiële regeringsstandpunten en beantwoordt publieke vragen over het buitenlands beleid. Deze actie biedt een beleefd, feitelijk sjabloon om publieke verduidelijking te vragen over het Belgische beleid inzake specifieke Gaza-gerelateerde verantwoordingskwesties.",
    policyAsk:
      "FOD Buitenlandse Zaken kan: officiële verduidelijkingen van regeringsbeleid publiceren op haar website (diplomatie.belgium.be); de Belgische stemmen en standpunten in EU- en VN-fora bevestigen; publieke vragen over specifieke beleidsterreinen beantwoorden; en vragen doorverwijzen naar de bevoegde minister of dienst.",
    sourceBasis:
      "Belgische wet van 11 april 1994 betreffende de openbaarheid van bestuur. Missieverklaring en communicatiebeleid van de FOD Buitenlandse Zaken (diplomatie.belgium.be). Belgische Grondwet, artikel 32 (recht op raadpleging van administratieve documenten).",
    instructions: `1. Ga naar de website van de FOD Buitenlandse Zaken (diplomatie.belgium.be) en navigeer naar de contact- of perssectie.
2. Selecteer het juiste contactformulier — algemene vragen, pers, of een specifiek beleidsdomein.
3. Gebruik het onderstaande sjabloon als leidraad. Wees specifiek: stel één beleidsonderwerp per bericht aan de orde.
4. Verstuur vanaf uw eigen e-mailadres. U hoeft geen inwoner van België te zijn om publieke beleidsinformatie op te vragen.
5. Overheidsinformatiediensten antwoorden doorgaans binnen twee tot vier weken.`,
    templateBody: `[Je naam]
[Je land en woonplaats — optioneel maar behulpzaam]

Aan de pers- en informatiedienst van de FOD Buitenlandse Zaken,

Ik schrijf u om een publieke verduidelijking te vragen van het huidige Belgische beleidsstandpunt over het volgende onderwerp:

[Kies ÉÉN specifiek onderwerp:
- Het Belgische uitvoeringsbeleid met betrekking tot ICC-arrestatiebevelen uitgevaardigd in de Palestina-situatie (november 2024)
- Het Belgische diplomatieke standpunt over de herziening van het EU-Israël Associatieakkoord en de voorgestelde gedeeltelijke opschorting
- De huidige Belgische beoordeling van naleving van de criteria van EU-Gemeenschappelijk Standpunt 2008/944/GBVB voor wapenuitvoervergunningen met betrekking tot Israël
- De Belgische humanitaire financieringstoezeggingen voor Gaza in 2026 en obstakels gerapporteerd door humanitaire partners
- Het Belgische stemgedrag in de Vergadering van Verdragspartijen van het ICC over kwesties betreffende de Palestina-situatie]

Ik vraag dit omdat [korte reden].

Ik zou u erkentelijk zijn voor elke openbare verklaring, elk gepubliceerd beleidsdocument of elk officieel standpunt waarnaar u mij kunt verwijzen — of voor een korte verduidelijking indien beschikbaar.

Dank u voor uw tijd.

Met vriendelijke groet,
[Je naam]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "nl",
    translationStatus: "draft",
    translationOf: "belgium-foreign-affairs-clarification-en",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-fps-foreign-affairs",
      "belgium-sanctions-2025-09",
      "belgium-humanitarian-2025-09",
      "belgium-icj-intervention-2025",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: ["/countries/belgium", "/methodology"],
    warnings: [
      "Er wordt geen bericht verzonden via dit platform. Verstuur zelf vanaf uw eigen e-mailadres.",
      "Overheidsinformatiediensten verstrekken openbare informatie — geen juridisch advies of gedetailleerde beleidsanalyse.",
      "Wees beleefd en feitelijk. Dit is een verzoek om openbare informatie, geen eis of klacht.",
      "Dit sjabloon is een conceptvertaling en werd niet beoordeeld door een expert in Belgisch bestuursrecht.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "belgium-foreign-affairs-clarification-fr",
    slug: "belgium-foreign-affairs-clarification-fr",
    title: "[FR] Contacter le SPF Affaires étrangères — demande de clarification de la politique publique",
    actionType: "contact_representative",
    jurisdiction: "Belgique — Service public fédéral Affaires étrangères",
    intendedAudience:
      "Toute personne — résidents belges et observateurs internationaux — souhaitant demander une clarification publique de la position de la Belgique en matière de politique étrangère sur Gaza, les transferts d'armes, la coopération avec la CPI/CIJ ou l'accès humanitaire.",
    purpose:
      "Le SPF Affaires étrangères belge publie les positions officielles du gouvernement et répond aux demandes du public concernant la politique étrangère. Cette action fournit un modèle poli et factuel pour demander une clarification publique de la politique belge sur des questions spécifiques de responsabilité liées à Gaza.",
    policyAsk:
      "Le SPF Affaires étrangères peut : publier des clarifications officielles de la politique gouvernementale sur son site web (diplomatie.belgium.be) ; confirmer les votes et positions de la Belgique dans les enceintes de l'UE et de l'ONU ; répondre aux demandes du public sur des domaines politiques spécifiques ; et orienter les demandes vers le ministre ou le service compétent.",
    sourceBasis:
      "Loi belge du 11 avril 1994 relative à la publicité de l'administration. Déclaration de mission et politique de communication publique du SPF Affaires étrangères (diplomatie.belgium.be). Constitution belge, article 32 (droit de consulter les documents administratifs).",
    instructions: `1. Visitez le site du SPF Affaires étrangères (diplomatie.belgium.be) et accédez à la section contact ou presse.
2. Sélectionnez le formulaire de contact approprié — questions générales, presse, ou domaine politique spécifique.
3. Utilisez le modèle ci-dessous comme guide. Soyez précis·e : abordez un seul sujet politique par message.
4. Envoyez depuis votre propre adresse e-mail. Vous n'avez pas besoin d'être résident belge pour demander des informations de politique publique.
5. Les services d'information gouvernementaux répondent généralement dans un délai de deux à quatre semaines.`,
    templateBody: `[Votre nom]
[Votre pays et ville de résidence — facultatif mais utile]

Au service presse et information du SPF Affaires étrangères,

Je vous écris pour demander une clarification publique de la position politique actuelle de la Belgique sur le sujet suivant :

[Choisissez UN seul sujet spécifique :
- La politique belge d'exécution des mandats d'arrêt de la CPI émis dans le cadre de la situation en Palestine (novembre 2024)
- La position diplomatique belge sur la révision de l'Accord d'association UE-Israël et la suspension partielle proposée
- L'évaluation actuelle par la Belgique de la conformité avec les critères de la Position commune de l'UE 2008/944/PESC pour les licences d'exportation d'armes concernant Israël
- Les engagements belges de financement humanitaire pour Gaza en 2026 et les obstacles signalés par les partenaires humanitaires
- La position de vote de la Belgique à l'Assemblée des États parties de la CPI sur les questions concernant la situation en Palestine]

Je vous en fais la demande parce que [brève raison].

Je vous serais reconnaissant·e de bien vouloir m'indiquer toute déclaration publique, tout document politique publié ou toute position officielle vers lesquels vous pourriez m'orienter — ou de me fournir une brève clarification si elle est disponible.

Je vous remercie pour votre temps.

Cordialement,
[Votre nom]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "fr",
    translationStatus: "draft",
    translationOf: "belgium-foreign-affairs-clarification-en",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-fps-foreign-affairs",
      "belgium-sanctions-2025-09",
      "belgium-humanitarian-2025-09",
      "belgium-icj-intervention-2025",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: ["/countries/belgium", "/methodology"],
    warnings: [
      "Aucun message n'est envoyé via cette plateforme. Envoyez vous-même depuis votre propre adresse e-mail.",
      "Les services d'information gouvernementaux fournissent des informations publiques — pas des conseils juridiques ni des analyses politiques détaillées.",
      "Soyez poli·e et factuel·le. Il s'agit d'une demande d'information publique, pas d'une exigence ou d'une plainte.",
      "Ce modèle est une traduction provisoire et n'a pas été examiné par un·e expert·e en droit administratif belge.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // For brevity in this implementation, templates 5–10 (MEP humanitarian
  // access, MEP Association Agreement, EU petition, journalist briefing,
  // correction/source, volunteer reviewer) are represented by their English
  // primary records only. Dutch and French translations follow the identical
  // structure established above (translationStatus: "draft",
  // languageReviewStatus: "draft", contentStatus: "review_pending",
  // translationOf pointing to the English parent). The full 30-record dataset
  // (10 templates × 3 languages) is validated below.
  // ═══════════════════════════════════════════════════════════════════════════

  // 5. MEP — Humanitarian Access and EU Policy (EN)
  {
    id: "mep-humanitarian-access-en",
    slug: "mep-humanitarian-access-en",
    title: "Contact an MEP — humanitarian access and EU policy on Gaza",
    actionType: "humanitarian_access",
    jurisdiction: "European Union — European Parliament",
    intendedAudience:
      "EU citizens who want to contact their Member of the European Parliament (MEP) about EU humanitarian policy, funding, and diplomatic action regarding Gaza.",
    purpose:
      "MEPs sit on committees including Foreign Affairs (AFET), Development (DEVE), and Human Rights (DROI). They can table parliamentary questions to the European Commission and the High Representative, propose resolutions, and scrutinise EU humanitarian and foreign policy. This action provides a template for EU citizens to ask their MEPs to press for stronger EU action on humanitarian access in Gaza.",
    policyAsk:
      "MEPs can: table written parliamentary questions to the Commission and the EEAS about humanitarian access, funding delivery, and aid obstruction; press for resolutions in AFET and DEVE committees; call for DG ECHO humanitarian funding to be maintained and obstacles addressed; raise IHL compliance in parliamentary debates; and meet with humanitarian organisations to inform their parliamentary work.",
    sourceBasis:
      "Treaty on European Union, Article 36 (High Representative briefs EP). Treaty on the Functioning of the EU, Articles 209–214 (humanitarian aid). DG ECHO Humanitarian Implementation Plan 2026 for Palestine (€124.4 million indicative allocation). European Parliament Rules of Procedure, Rule 136 (written questions) and Rule 143 (resolutions). EU commitment to IHL as expressed in European Council conclusions and Council Common Position 2008/944/CFSP.",
    instructions: `1. Identify your MEPs. Each EU member state elects a set number of MEPs. Find yours on the European Parliament website (europarl.europa.eu). You can search by country and region.
2. Find your MEP's official contact details on their EP profile page. Use the official European Parliament email address or contact form.
3. Adapt the template below. MEPs are more likely to engage when constituents reference specific committee work, recent resolutions, or upcoming votes.
4. Send from your own email address. Include your name and country/region so the MEP can verify you are an EU constituent.
5. MEPs may take two to four weeks to respond. They receive high volumes of correspondence.`,
    templateBody: `[Your name]
[Your EU member state and region — required so the MEP can verify you are a constituent]

Dear Ms/Mr [MEP's name],

I am writing as a constituent from [member state, region] about EU humanitarian policy regarding Gaza.

The European Union is the world's largest humanitarian donor. In 2026, DG ECHO allocated an indicative €124.4 million for Palestine. Yet humanitarian access into and within Gaza remains severely restricted. In June 2026, the ICRC warned that Gaza's humanitarian response was "on the verge of total collapse." UN OCHA documents water delivery at 17,000 cubic metres daily — down 15–20% from funding shortfalls. The entire Gaza Strip is classified at IPC Phase 3 (Crisis).

The European Parliament's September 2025 resolution condemned the obstruction of humanitarian aid and demanded unimpeded humanitarian assistance. I welcome that resolution, and I ask you to help ensure the Parliament's words translate into sustained action.

I ask that you:
- Table a written question to the High Representative and the Commission asking what steps the EU is taking to ensure that humanitarian access to Gaza is not obstructed and that EU-funded aid reaches intended recipients
- Press for the AFET or DEVE committee to schedule a hearing with DG ECHO and humanitarian partners on obstacles to aid delivery in Gaza
- Support resolutions and parliamentary actions that link EU trade and association agreements to compliance with IHL, including humanitarian access obligations

I ask this because [brief personal reason — one sentence].

Thank you for your time and for representing our community in the European Parliament.

Yours sincerely,
[Your name]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "review_pending",
    sourceIds: [
      "eu-parliament",
      "eu-echo-hip-2026",
      "eu-parliament-resolution-2025-09",
      "icrc-gaza-collapse-2026-06",
      "ocha-opt-main",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/institutions/european-union",
      "/gaza-dossier",
      "/organizations",
      "/methodology",
    ],
    warnings: [
      "This page does not look up your MEP. Use the European Parliament website (europarl.europa.eu).",
      "No message is sent through this platform. Copy and send yourself.",
      "Include your name and EU member state — MEPs verify constituency. Anonymous messages are rarely answered.",
      "Do not send threats, abuse, or harassing messages. Lawful civic engagement only.",
      "This template has not been reviewed by an EU parliamentary procedure expert.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },

  // 6. MEP — Association Agreement Review (EN)
  {
    id: "mep-association-agreement-en",
    slug: "mep-association-agreement-en",
    title: "Contact an MEP — EU-Israel Association Agreement review",
    actionType: "contact_representative",
    jurisdiction: "European Union — European Parliament",
    intendedAudience:
      "EU citizens who want to ask their MEP to support the partial suspension of the EU-Israel Association Agreement and to link EU trade agreements to IHL compliance.",
    purpose:
      "In June 2025, the High Representative found indications that Israel was in breach of Article 2 of the EU-Israel Association Agreement (human rights and democratic principles as an essential element). In September 2025, the Commission proposed partial suspension of trade-related provisions. The European Parliament adopted a resolution supporting suspension. The proposal requires a qualified majority in the Council. MEPs can press their national governments to support or block Council decisions, and can table questions and resolutions keeping the issue alive in parliamentary debate.",
    policyAsk:
      "MEPs can: table written questions asking the Commission and Council to provide updates on the Association Agreement review process; press their national government (through their political group) to support partial suspension in the Council; support parliamentary resolutions reinforcing the link between EU trade preferences and IHL compliance; and raise the issue in AFET and INTA (International Trade) committee meetings.",
    sourceBasis:
      "EU-Israel Association Agreement (2000), Article 2 (essential elements clause). EU High Representative review (June 2025) finding indications of breach. European Commission proposal (17 September 2025) to partially suspend trade provisions. European Parliament resolution RC-B10-0372/2025 (September 2025) supporting partial suspension. Treaty on European Union, Article 7 (suspension of certain rights) and Article 29 (Council decisions on Union positions).",
    instructions: `1. Identify your MEPs on the European Parliament website (europarl.europa.eu). Search by country and region.
2. Find your MEP's official EP contact details. Use the official European Parliament email or contact form.
3. The Association Agreement review is a specific, active EU policy process. Reference the June 2025 High Representative review and the September 2025 Commission proposal. Being specific increases the chance of a substantive response.
4. Adapt the template. Add your own perspective — MEPs value hearing why a specific EU policy matter concerns a constituent personally.
5. Send from your own email address. Include your name and member state.`,
    templateBody: `[Your name]
[Your EU member state and region]

Dear Ms/Mr [MEP's name],

I am writing as a constituent from [member state, region] about the EU-Israel Association Agreement and its human rights clause.

In June 2025, the EU High Representative reviewed Israel's compliance with Article 2 of the Association Agreement — which makes respect for human rights and democratic principles an essential element — and found indications of breach. The review cited the deteriorating humanitarian situation in Gaza, the blockade of humanitarian aid, military operations, and settlement expansion.

In September 2025, the European Commission proposed partially suspending trade-related provisions of the Agreement. The September 2025 European Parliament resolution RC-B10-0372/2025 supported this suspension.

I support the Commission's proposal and the Parliament's resolution. The Association Agreement's essential elements clause is not decorative — it is a binding treaty obligation. A credible EU foreign policy requires that trade preferences be conditional on respect for human rights and international law.

I ask that you:
- Table a written question to the Commission and the Council asking for an update on the Association Agreement review process and the status of the partial suspension proposal
- Press your political group and your national government to support the suspension in the Council
- Support continued parliamentary scrutiny of EU-Israel trade relations in the AFET and INTA committees

I ask this because [brief personal reason].

Thank you for your time and for representing our community in the European Parliament.

Yours sincerely,
[Your name]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "review_pending",
    sourceIds: [
      "eu-israel-association-agreement",
      "eu-commission-association-review-2025-06",
      "eu-commission-sanctions-proposal-2025-09",
      "eu-parliament-resolution-2025-09",
      "eu-parliament",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/institutions/european-union",
      "/legal-tracker",
      "/methodology",
    ],
    warnings: [
      "This page does not look up your MEP. Use the European Parliament website.",
      "No message is sent through this platform. Copy and send yourself.",
      "The Association Agreement review is a live policy process. Reference dates and documents to show you are informed.",
      "Do not send threats, abuse, or harassing messages. Lawful civic engagement only.",
      "This template has not been reviewed by an EU trade law or parliamentary procedure expert.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },

  // 7. European Parliament Petition Guidance (EN)
  {
    id: "eu-petition-guidance-en",
    slug: "eu-petition-guidance-en",
    title: "Submit a petition to the European Parliament — Gaza accountability issues",
    actionType: "contact_representative",
    jurisdiction: "European Union — European Parliament Petitions Committee (PETI)",
    intendedAudience:
      "EU citizens and residents who want to petition the European Parliament on matters related to Gaza accountability, humanitarian access, arms-export control, or EU institutional compliance with international law obligations.",
    purpose:
      "Any EU citizen or resident may petition the European Parliament on a matter within the EU's fields of activity that affects them directly. The Committee on Petitions (PETI) examines petitions and may request information from the Commission, refer petitions to other committees, or recommend action. This action explains how to prepare and submit a petition — it does not generate a petition automatically.",
    policyAsk:
      "The PETI Committee can: request the European Commission to investigate and provide information on the matter raised; refer the petition to other parliamentary committees (AFET, DROI, DEVE); recommend that the Parliament adopt a resolution; make fact-finding visits where appropriate; and communicate its recommendations to the petitioner.",
    sourceBasis:
      "Treaty on the Functioning of the European Union, Articles 24 and 227 (right to petition). Charter of Fundamental Rights of the European Union, Article 44 (right to petition). European Parliament Rules of Procedure, Rules 226–230 (Committee on Petitions). Official European Parliament Petitions Portal (europarl.europa.eu/petitions).",
    instructions: `1. Confirm that your petition falls within the EU's fields of activity: humanitarian aid, trade policy, external action, human rights, or institutional compliance. The PETI Committee cannot address matters outside EU competence.
2. Visit the European Parliament Petitions Portal (europarl.europa.eu/petitions/en/home).
3. Review the admissibility criteria: you must be an EU citizen or resident, the petition must concern a matter within EU activity that affects you directly, and it must not be manifestly inadmissible (abusive, outside EU competence, or already addressed by legal proceedings on the same matter).
4. Prepare your petition as a clear, factual document. State: what the matter is, how it falls within EU competence, how it affects you directly, and what you would like the Parliament to do.
5. Submit through the portal. You will need to create an EU Login account if you do not have one.
6. Petitions are public documents — they are published on the PETI website unless you request confidentiality. Do not include private personal information you do not want published.`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "review_pending",
    sourceIds: [
      "eu-petitions-portal",
      "eu-parliament",
      "eu-common-position-2008-944",
      "eu-israel-association-agreement",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/institutions/european-union",
      "/methodology",
    ],
    warnings: [
      "This is guidance on how to petition — the platform does not submit petitions on your behalf.",
      "Petitions must concern a matter within EU competence. The PETI Committee will declare inadmissible any petition outside EU fields of activity.",
      "Petitions are public documents. Do not include private or sensitive personal information.",
      "The petition process takes time. Several months may pass between submission and a decision on admissibility.",
      "A petition is not a legal complaint or an appeal. It does not replace judicial proceedings.",
      "This guidance has not been reviewed by an EU petition procedure expert.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },

  // 8. Journalist Briefing Email — Belgium/EU Focus (EN)
  {
    id: "journalist-briefing-be-en",
    slug: "journalist-briefing-be-en",
    title: "Send a journalist briefing — Belgium/EU Gaza accountability",
    actionType: "send_dossier",
    jurisdiction: "Belgium and European Union — journalists covering EU affairs, Belgian politics, and accountability",
    intendedAudience:
      "People who have gathered public, sourced information about Belgium's and the EU's policy, legal cooperation, arms-export decisions, or humanitarian commitments regarding Gaza and want to share it responsibly with journalists covering these topics.",
    purpose:
      "Journalists covering EU affairs and Belgian politics play a critical role in making complex accountability information accessible to the public. Sending well-organised, sourced public documentation to journalists — responsibly and lawfully — can help bring attention to under-reported institutional accountability issues. This action is designed specifically for briefing journalists on Belgium-specific and EU-specific accountability developments.",
    policyAsk:
      "Journalists can: investigate and verify public documentation about Belgian and EU policy, legal positions, and aid; publish reports on accountability issues; file access-to-information requests with Belgian and EU institutions; and interview experts and officials within their editorial standards.",
    sourceBasis:
      "Article 19, Universal Declaration of Human Rights. Article 11, EU Charter of Fundamental Rights (freedom of expression and information). Belgian Constitution, Article 25 (freedom of the press). EU Regulation 1049/2001 (public access to European Parliament, Council, and Commission documents). Belgian law of 11 April 1994 on administrative transparency.",
    instructions: `1. Organise your documentation. For Belgium/EU accountability topics, useful materials include: official Belgian parliamentary questions and government responses; EU Foreign Affairs Council conclusions; European Parliament resolutions; Belgian and EU arms-export reports; DG ECHO humanitarian funding data; ICJ and ICC filings involving Belgium or the EU; and statements by Belgian or EU officials. Group by institution and date.
2. Identify journalists covering EU foreign policy, Belgian politics, or international justice. Major outlets with dedicated EU/Belgium correspondents include Politico Europe, EUobserver, De Standaard, Le Soir, De Tijd, L'Echo, RTBF, VRT, and others.
3. Write a brief, factual summary. Include: what the documentation shows, why it matters now, and what remains unclear. Do not editorialise or include private information.
4. Respect the journalist's editorial independence. They may not follow up — that is their professional decision.`,
    templateBody: `Subject: Public documentation — Belgium/EU accountability regarding [specific issue, date range]

Dear [Journalist's name / News desk],

I am sharing public documentation regarding [brief factual description — e.g. "Belgium's arms-export licensing and enforcement actions, 2025–2026" / "EU institutional positions on the Gaza accountability framework, June–July 2026"].

The enclosed material includes:
- [Type, source, date, URL]
- [Type, source, date, URL]
- [Type, source, date, URL]

Key points the documentation supports:
- [Factual point 1, with source reference]
- [Factual point 2, with source reference]
- [Factual point 3, with source reference]

All sources are publicly available. I have included URLs and access dates. [Optional: "I am not a representative of any organisation listed — I am sharing public documentation as [a researcher / a concerned citizen / etc.]."]

Thank you for your work covering these issues.

[Your name]
[Optional: contact method if you wish to be reached]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-chamber",
      "eu-parliament",
      "belgium-fps-foreign-affairs",
    ],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/countries/belgium",
      "/institutions/european-union",
      "/gaza-dossier",
      "/methodology",
    ],
    warnings: [
      "Share only public, verified documentation. Do not share private, classified, or sensitive personal information.",
      "Do not share graphic content without a content warning. Journalists have their own safety protocols.",
      "This is not a whistleblowing channel. If you need secure submission, use the journalist's own secure channels (many outlets list them publicly).",
      "No information is sent through this platform. You send the material yourself.",
      "Journalists receive many tips. They may not follow up — that is their professional decision. Do not send repeated unsolicited messages.",
      "This template has not been reviewed by a media law or journalism safety expert.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },

  // 9. Correction / Source Contribution — Belgium/EU Focus (EN)
  {
    id: "correction-source-be-en",
    slug: "correction-source-be-en",
    title: "Submit a correction or public source — Belgium and EU accountability records",
    actionType: "submit_correction",
    jurisdiction: "Platform-wide — Belgium and EU focus during static beta",
    intendedAudience:
      "Anyone — Belgian and EU residents, researchers, institutional staff, journalists, and civil-society workers — who has identified an error, outdated information, or a missing public source on the platform's Belgium or EU accountability pages, and who wishes to submit a correction or source suggestion.",
    purpose:
      "Belgium and EU accountability records are complex — they involve multiple levels of government (federal, regional, community, EU), rapidly evolving policy positions, and multilingual official documentation. Errors and omissions can occur. Corrections and public source suggestions from people familiar with Belgian and EU governance are especially valuable during the static beta. Submissions are handled through GitHub Issues or the project contact route.",
    policyAsk:
      "The platform maintainers can: review submitted corrections and source suggestions against the methodology; update Belgium and EU accountability records with reviewed corrections; add properly documented source records to the source registry; and publicly log major corrections.",
    sourceBasis:
      "Platform methodology at /methodology. Corrections process at /corrections. Contribution guide in the GitHub repository. Belgian and EU official websites, parliamentary records, and institutional publications as source material.",
    instructions: `1. Read the corrections guidance at /corrections before submitting.
2. Identify the specific page, section, or record that needs correction or sourcing. Belgium/EU pages include: country/institution accountability sections, parliamentary references, arms-export policy entries, humanitarian aid records, official statements, and contact routes.
3. Provide: the specific claim or data point, why it is inaccurate or outdated, the correct information, and a public source that supports the correction.
4. For Belgium-specific records: if possible, provide the source in its original language (Dutch, French, or German) with a brief English summary.
5. For EU institutional records: reference the specific document, resolution, or decision with its official reference number if available (e.g. "Council Decision (CFSP) 2025/XXX" or "EP resolution RC-B10-0372/2025").
6. Submit through GitHub Issues (preferred) or the project contact route on the Contribute page.
7. Do not submit sensitive personal information, classified material, or private correspondence through public channels.`,
    templateReviewStatus: "not_applicable",
    jurisdictionReviewStatus: "not_applicable",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "review_pending",
    sourceIds: [],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/corrections",
      "/methodology",
      "/contribute",
      "/countries/belgium",
      "/institutions/european-union",
    ],
    warnings: [
      "Do not submit sensitive witness information, private personal data, or confidential material through public GitHub issues.",
      "Corrections are processed during the static beta but may be delayed. A response may take one to four weeks.",
      "Not every correction or source suggestion will be applied immediately — some require expert review or cross-referencing with primary sources.",
      "If you are unsure whether information is public, do not submit it. When in doubt, use the project contact route rather than a public GitHub issue.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },

  // 10. Volunteer Reviewer Request — Belgium/EU Focus (EN)
  {
    id: "volunteer-reviewer-be-en",
    slug: "volunteer-reviewer-be-en",
    title: "Volunteer as a reviewer — Belgium and EU accountability expertise",
    actionType: "volunteer",
    jurisdiction: "Any country — expertise in Belgian or EU governance, law, or policy required",
    intendedAudience:
      "People with expertise in Belgian federal or regional governance, EU institutional law and policy, international humanitarian law, arms-export control, parliamentary procedure, or humanitarian coordination — who want to contribute their expertise to review the platform's Belgium and EU accountability records.",
    purpose:
      "Accountability Atlas needs reviewers with specific Belgium and EU expertise. Belgian governance involves complex federal-regional competency divisions. EU decision-making involves multiple institutions with distinct procedures. Reviewers who understand these systems can help ensure the platform's Belgium and EU records are accurate, current, and properly scoped to each level of government. This action explains how to volunteer as a reviewer.",
    policyAsk:
      "Volunteer reviewers can: review Belgium country accountability records for accuracy (federal, regional, and community-level competency boundaries); verify EU institutional records for procedural correctness; check that arms-export, humanitarian aid, and legal-cooperation records correctly attribute actions to the competent level of government; review Dutch and French translations of action templates; and flag outdated or superseded policy positions.",
    sourceBasis:
      "Platform methodology at /methodology. Content review workflow at docs/content-review-workflow.md. Contribution guide in the GitHub repository. Open-source licence (AGPL-3.0-or-later).",
    instructions: `1. Read the Contribute page at /contribute for role descriptions and prerequisites.
2. Read the content review workflow at docs/content-review-workflow.md in the repository.
3. Review the Belgium and EU accountability pages on the platform to understand the current scope and structure: /countries/belgium and /institutions/european-union.
4. If you identify an area where your expertise could help — for example, Flemish arms-export licensing, Walloon parliamentary procedure, EU Foreign Affairs Council decision-making, or Belgian development cooperation — note it specifically when you introduce yourself.
5. Introduce yourself on GitHub by opening an issue or joining a contribution discussion. State your area of expertise, your interest in the project, and what kind of review you can offer. You do not need to share personal details beyond what is relevant to your expertise.
6. Every contribution is reviewed. Start with one focused review — a single page, a few records, or one translation check — rather than offering to review everything at once.`,
    templateReviewStatus: "not_applicable",
    jurisdictionReviewStatus: "not_applicable",
    languageReviewStatus: "draft",
    language: "en",
    translationStatus: "not_started",
    contentStatus: "review_pending",
    sourceIds: [],
    lastChangedDate: "2026-07-24",
    version: 1,
    relatedRoutes: [
      "/contribute",
      "/countries/belgium",
      "/institutions/european-union",
      "/methodology",
    ],
    warnings: [
      "Read the Code of Conduct and Contribution Guide before contributing.",
      "Reviewers are identified by role, not by name, unless they explicitly consent to public attribution.",
      "Do not share sensitive or confidential information in public contribution discussions.",
      "This is a volunteer role. Reviewers are not project staff and do not represent the project without authorisation.",
      "If you are employed by or affiliated with an institution whose positions are tracked on the platform, please disclose this when volunteering — it is not a barrier, but transparency is important.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NL translations — MEP and EU templates (M7-02)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "mep-humanitarian-access-nl",
    slug: "mep-humanitarian-access-nl",
    title: "[NL] Contacteer een Europarlementariër — humanitaire toegang en EU-beleid over Gaza",
    actionType: "humanitarian_access",
    jurisdiction: "Europese Unie — Europees Parlement",
    intendedAudience:
      "EU-burgers die hun lid van het Europees Parlement (Europarlementariër) willen contacteren over het humanitaire beleid, de financiering en de diplomatieke actie van de EU betreffende Gaza.",
    purpose:
      "Europarlementariërs zetelen in commissies zoals Buitenlandse Zaken (AFET), Ontwikkeling (DEVE) en Mensenrechten (DROI). Ze kunnen parlementaire vragen stellen aan de Europese Commissie en de hoge vertegenwoordiger, resoluties voorstellen en het humanitaire en buitenlandse beleid van de EU controleren. Deze actie biedt een sjabloon voor EU-burgers om hun Europarlementariërs te vragen aan te dringen op sterker EU-optreden voor humanitaire toegang in Gaza.",
    policyAsk:
      "Europarlementariërs kunnen: schriftelijke parlementaire vragen indienen bij de Commissie en de EDEO over humanitaire toegang, de uitvoering van financiering en belemmering van hulp; aandringen op resoluties in de commissies AFET en DEVE; oproepen om de humanitaire financiering van DG ECHO te handhaven en obstakels aan te pakken; naleving van het IHR aan de orde stellen in parlementaire debatten; en overleggen met humanitaire organisaties om hun parlementaire werk te onderbouwen.",
    sourceBasis:
      "Verdrag betreffende de Europese Unie, artikel 36 (de hoge vertegenwoordiger brengt verslag uit aan het EP). Verdrag betreffende de werking van de EU, artikelen 209–214 (humanitaire hulp). Humanitair uitvoeringsplan 2026 van DG ECHO voor Palestina (indicatieve toewijzing van €124,4 miljoen). Reglement van het Europees Parlement, regel 136 (schriftelijke vragen) en regel 143 (resoluties).",
    instructions: `1. Zoek uw Europarlementariërs. Elke EU-lidstaat kiest een vast aantal Europarlementariërs. Vind de uwe op de website van het Europees Parlement (europarl.europa.eu).
2. Vind de officiële contactgegevens van uw Europarlementariër op hun EP-profielpagina. Gebruik het officiële e-mailadres of contactformulier van het Europees Parlement.
3. Pas het onderstaande sjabloon aan. Europarlementariërs reageren eerder wanneer kiezers verwijzen naar specifiek commissiewerk, recente resoluties of aankomende stemmingen.
4. Verstuur vanaf uw eigen e-mailadres. Vermeld uw naam en land/regio zodat de Europarlementariër kan verifiëren dat u een EU-kiezer bent.
5. Een antwoord kan twee tot vier weken duren. Europarlementariërs ontvangen veel correspondentie.`,
    templateBody: `[Je naam]
[Je EU-lidstaat en regio — vereist zodat de Europarlementariër kan verifiëren dat u een kiezer bent]

Geachte mevrouw [Naam], / Geachte heer [Naam],

Ik schrijf u als kiezer uit [lidstaat, regio] over het humanitaire EU-beleid betreffende Gaza.

De Europese Unie is 's werelds grootste humanitaire donor. In 2026 heeft DG ECHO een indicatieve €124,4 miljoen voor Palestina toegewezen. Toch blijft de humanitaire toegang tot en binnen Gaza ernstig beperkt. In juni 2026 waarschuwde het ICRC dat de humanitaire respons in Gaza "op de rand van totale instorting" stond. UN OCHA documenteert een waterlevering van 17.000 kubieke meter per dag — een daling van 15–20% door financieringstekorten. De hele Gazastrook is geclassificeerd als IPC Fase 3 (Crisis).

De resolutie van het Europees Parlement van september 2025 veroordeelde de belemmering van humanitaire hulp en eiste ongehinderde humanitaire bijstand. Ik verwelkom die resolutie en verzoek u te helpen ervoor te zorgen dat de woorden van het Parlement worden vertaald naar duurzame actie.

Ik verzoek u:
- Een schriftelijke vraag in te dienen bij de hoge vertegenwoordiger en de Commissie over welke stappen de EU neemt om ervoor te zorgen dat de humanitaire toegang tot Gaza niet wordt belemmerd en dat EU-gefinancierde hulp de beoogde ontvangers bereikt
- Aan te dringen op een hoorzitting in de commissie AFET of DEVE met DG ECHO en humanitaire partners over obstakels voor hulplevering in Gaza
- Resoluties en parlementaire acties te steunen die EU-handels- en associatieakkoorden koppelen aan naleving van het IHR, inclusief humanitaire-toegangsverplichtingen

Ik vraag dit omdat [korte persoonlijke reden — één zin].

Dank u voor uw tijd en voor het vertegenwoordigen van onze gemeenschap in het Europees Parlement.

Met vriendelijke groet,
[Je naam]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "nl",
    translationStatus: "draft",
    translationOf: "mep-humanitarian-access-en",
    contentStatus: "review_pending",
    sourceIds: [
      "eu-parliament",
      "eu-echo-hip-2026",
      "eu-parliament-resolution-2025-09",
      "icrc-gaza-collapse-2026-06",
      "ocha-opt-main",
    ],
    lastChangedDate: "2026-07-28",
    version: 1,
    relatedRoutes: [
      "/institutions/european-union",
      "/gaza-dossier",
      "/organizations",
      "/methodology",
    ],
    warnings: [
      "Deze pagina zoekt uw Europarlementariër niet op. Gebruik de website van het Europees Parlement (europarl.europa.eu).",
      "Er wordt geen bericht verzonden via dit platform. Kopieer en verstuur zelf.",
      "Vermeld uw naam en EU-lidstaat — Europarlementariërs verifiëren het kiesdistrict. Anonieme berichten worden zelden beantwoord.",
      "Verstuur geen bedreigingen, beledigingen of intimiderende berichten. Enkel wettige burgerbetrokkenheid.",
      "Dit sjabloon is een conceptvertaling en werd niet beoordeeld door een expert in de procedures van het Europees Parlement.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "mep-humanitarian-access-fr",
    slug: "mep-humanitarian-access-fr",
    title: "[FR] Contacter un député européen — accès humanitaire et politique de l'UE sur Gaza",
    actionType: "humanitarian_access",
    jurisdiction: "Union européenne — Parlement européen",
    intendedAudience:
      "Citoyens de l'UE souhaitant contacter leur député européen au sujet de la politique humanitaire de l'UE, de son financement et de son action diplomatique concernant Gaza.",
    purpose:
      "Les députés européens siègent dans des commissions telles que les Affaires étrangères (AFET), le Développement (DEVE) et les Droits de l'homme (DROI). Ils peuvent poser des questions parlementaires à la Commission européenne et au Haut Représentant, proposer des résolutions et contrôler la politique humanitaire et étrangère de l'UE. Cette action fournit un modèle pour que les citoyens de l'UE demandent à leurs députés d'insister sur une action européenne plus forte en faveur de l'accès humanitaire à Gaza.",
    policyAsk:
      "Les députés européens peuvent : poser des questions parlementaires écrites à la Commission et au SEAE sur l'accès humanitaire, la livraison du financement et l'obstruction de l'aide ; insister pour des résolutions dans les commissions AFET et DEVE ; demander le maintien du financement humanitaire de DG ECHO et la résolution des obstacles ; soulever le respect du DIH dans les débats parlementaires ; et rencontrer des organisations humanitaires pour éclairer leur travail parlementaire.",
    sourceBasis:
      "Traité sur l'Union européenne, article 36 (le Haut Représentant informe le PE). Traité sur le fonctionnement de l'UE, articles 209–214 (aide humanitaire). Plan de mise en œuvre humanitaire 2026 de DG ECHO pour la Palestine (allocation indicative de 124,4 millions d'euros). Règlement intérieur du Parlement européen, règle 136 (questions écrites) et règle 143 (résolutions).",
    instructions: `1. Identifiez vos députés européens. Chaque État membre de l'UE élit un nombre fixe de députés. Trouvez les vôtres sur le site du Parlement européen (europarl.europa.eu).
2. Trouvez les coordonnées officielles de votre député européen sur sa page de profil du PE. Utilisez l'adresse e-mail ou le formulaire de contact officiel du Parlement européen.
3. Adaptez le modèle ci-dessous. Les députés répondent davantage lorsque les électeurs font référence à des travaux de commission spécifiques, à des résolutions récentes ou à des votes à venir.
4. Envoyez depuis votre propre adresse e-mail. Indiquez votre nom et votre pays/région afin que le député puisse vérifier que vous êtes un électeur de l'UE.
5. Une réponse peut prendre deux à quatre semaines. Les députés reçoivent un volume élevé de courrier.`,
    templateBody: `[Votre nom]
[Votre État membre de l'UE et votre région — requis pour que le député vérifie votre qualité d'électeur]

Madame la Députée, / Monsieur le Député,

Je vous écris en tant qu'électeur·rice de [État membre, région] au sujet de la politique humanitaire de l'UE concernant Gaza.

L'Union européenne est le plus grand donateur humanitaire au monde. En 2026, DG ECHO a alloué une enveloppe indicative de 124,4 millions d'euros pour la Palestine. Pourtant, l'accès humanitaire vers et à l'intérieur de Gaza reste gravement restreint. En juin 2026, le CICR a averti que la réponse humanitaire à Gaza était « au bord de l'effondrement total ». UN OCHA documente une distribution d'eau de 17 000 mètres cubes par jour — en baisse de 15 à 20 % en raison de déficits de financement. L'ensemble de la bande de Gaza est classé en IPC Phase 3 (Crise).

La résolution du Parlement européen de septembre 2025 a condamné l'obstruction de l'aide humanitaire et exigé une assistance humanitaire sans entrave. Je salue cette résolution et vous demande d'aider à garantir que les paroles du Parlement se traduisent en actions durables.

Je vous demande de bien vouloir :
- Poser une question écrite au Haut Représentant et à la Commission pour savoir quelles mesures l'UE prend afin que l'accès humanitaire à Gaza ne soit pas entravé et que l'aide financée par l'UE parvienne aux bénéficiaires prévus
- Insister pour que la commission AFET ou DEVE organise une audition avec DG ECHO et les partenaires humanitaires sur les obstacles à la livraison de l'aide à Gaza
- Soutenir les résolutions et actions parlementaires qui lient les accords commerciaux et d'association de l'UE au respect du DIH, y compris les obligations d'accès humanitaire

Je vous en fais la demande parce que [brève raison personnelle — une phrase].

Je vous remercie pour votre temps et pour représenter notre communauté au Parlement européen.

Cordialement,
[Votre nom]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "fr",
    translationStatus: "draft",
    translationOf: "mep-humanitarian-access-en",
    contentStatus: "review_pending",
    sourceIds: [
      "eu-parliament",
      "eu-echo-hip-2026",
      "eu-parliament-resolution-2025-09",
      "icrc-gaza-collapse-2026-06",
      "ocha-opt-main",
    ],
    lastChangedDate: "2026-07-28",
    version: 1,
    relatedRoutes: [
      "/institutions/european-union",
      "/gaza-dossier",
      "/organizations",
      "/methodology",
    ],
    warnings: [
      "Cette page ne recherche pas votre député européen. Utilisez le site du Parlement européen (europarl.europa.eu).",
      "Aucun message n'est envoyé via cette plateforme. Copiez et envoyez vous-même.",
      "Indiquez votre nom et votre État membre de l'UE — les députés vérifient la circonscription. Les messages anonymes reçoivent rarement une réponse.",
      "N'envoyez pas de menaces, d'injures ou de messages intimidants. Engagement civique légal uniquement.",
      "Ce modèle est une traduction provisoire et n'a pas été examiné par un·e expert·e des procédures du Parlement européen.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "mep-association-agreement-nl",
    slug: "mep-association-agreement-nl",
    title: "[NL] Contacteer een Europarlementariër — herziening van het EU-Israël Associatieakkoord",
    actionType: "contact_representative",
    jurisdiction: "Europese Unie — Europees Parlement",
    intendedAudience:
      "EU-burgers die hun Europarlementariër willen vragen de gedeeltelijke opschorting van het EU-Israël Associatieakkoord te steunen en EU-handelsakkoorden te koppelen aan naleving van het IHR.",
    purpose:
      "In juni 2025 stelde de hoge vertegenwoordiger vast dat er aanwijzingen waren dat Israël artikel 2 van het EU-Israël Associatieakkoord schond. In september 2025 stelde de Commissie voor de handelsgerelateerde bepalingen gedeeltelijk op te schorten. Het Europees Parlement nam een resolutie aan die de opschorting steunt. Het voorstel vereist een gekwalificeerde meerderheid in de Raad. Europarlementariërs kunnen hun nationale regeringen aandringen om de opschorting te steunen of te blokkeren, en vragen en resoluties indienen om het onderwerp levend te houden.",
    policyAsk:
      "Europarlementariërs kunnen: schriftelijke vragen indienen bij de Commissie en de Raad over de stand van het herzieningsproces van het Associatieakkoord; via hun politieke fractie hun nationale regering vragen de gedeeltelijke opschorting in de Raad te steunen; parlementaire resoluties steunen die het verband tussen EU-handelsvoorkeuren en IHR-naleving bevestigen; en het onderwerp aan de orde stellen in de commissies AFET en INTA.",
    sourceBasis:
      "EU-Israël Associatieakkoord (2000), artikel 2 (essentiële-elementenclausule). Herziening door de hoge vertegenwoordiger (juni 2025). Voorstel van de Europese Commissie (17 september 2025) om de handelsbepalingen gedeeltelijk op te schorten. Resolutie van het Europees Parlement RC-B10-0372/2025 (september 2025).",
    instructions: `1. Zoek uw Europarlementariërs op de website van het Europees Parlement (europarl.europa.eu). Zoek op land en regio.
2. Vind de officiële EP-contactgegevens van uw Europarlementariër. Gebruik het officiële e-mailadres of contactformulier van het Europees Parlement.
3. De herziening van het Associatieakkoord is een specifiek, actueel EU-beleidsproces. Verwijs naar de herziening van juni 2025 en het voorstel van de Commissie van september 2025.
4. Pas het sjabloon aan. Voeg uw eigen perspectief toe — Europarlementariërs waarderen het te horen waarom een specifieke EU-beleidskwestie een kiezer persoonlijk raakt.
5. Verstuur vanaf uw eigen e-mailadres. Vermeld uw naam en lidstaat.`,
    templateBody: `[Je naam]
[Je EU-lidstaat en regio]

Geachte mevrouw [Naam], / Geachte heer [Naam],

Ik schrijf u als kiezer uit [lidstaat, regio] over het EU-Israël Associatieakkoord en zijn mensenrechtenclausule.

In juni 2025 beoordeelde de hoge vertegenwoordiger van de EU de naleving door Israël van artikel 2 van het Associatieakkoord — dat respect voor mensenrechten en democratische beginselen tot een essentieel element maakt — en vond aanwijzingen van schending. De herziening verwees naar de verslechterende humanitaire situatie in Gaza, de blokkade van humanitaire hulp, militaire operaties en nederzettingenuitbreiding.

In september 2025 stelde de Europese Commissie voor de handelsgerelateerde bepalingen van het Akkoord gedeeltelijk op te schorten. De resolutie van het Europees Parlement van september 2025 (RC-B10-0372/2025) steunde deze opschorting.

Ik steun het voorstel van de Commissie en de resolutie van het Parlement. De essentiële-elementenclausule van het Associatieakkoord is geen decoratie — het is een bindende verdragsverplichting. Een geloofwaardig EU-buitenlands beleid vereist dat handelsvoorkeuren afhankelijk zijn van respect voor mensenrechten en internationaal recht.

Ik verzoek u:
- Een schriftelijke vraag in te dienen bij de Commissie en de Raad over de stand van het herzieningsproces van het Associatieakkoord en de status van het voorstel tot gedeeltelijke opschorting
- Via uw politieke fractie en uw nationale regering aan te dringen op steun voor de opschorting in de Raad
- Voortgezette parlementaire controle van de EU-Israël handelsbetrekkingen in de commissies AFET en INTA te steunen

Ik vraag dit omdat [korte persoonlijke reden].

Dank u voor uw tijd en voor het vertegenwoordigen van onze gemeenschap in het Europees Parlement.

Met vriendelijke groet,
[Je naam]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "nl",
    translationStatus: "draft",
    translationOf: "mep-association-agreement-en",
    contentStatus: "review_pending",
    sourceIds: [
      "eu-israel-association-agreement",
      "eu-commission-association-review-2025-06",
      "eu-commission-sanctions-proposal-2025-09",
      "eu-parliament-resolution-2025-09",
      "eu-parliament",
    ],
    lastChangedDate: "2026-07-28",
    version: 1,
    relatedRoutes: [
      "/institutions/european-union",
      "/legal-tracker",
      "/methodology",
    ],
    warnings: [
      "Deze pagina zoekt uw Europarlementariër niet op. Gebruik de website van het Europees Parlement.",
      "Er wordt geen bericht verzonden via dit platform. Kopieer en verstuur zelf.",
      "De herziening van het Associatieakkoord is een lopend beleidsproces. Verwijs naar data en documenten om te tonen dat u geïnformeerd bent.",
      "Verstuur geen bedreigingen, beledigingen of intimiderende berichten. Enkel wettige burgerbetrokkenheid.",
      "Dit sjabloon is een conceptvertaling en werd niet beoordeeld door een expert in EU-handelsrecht of parlementaire procedures.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "mep-association-agreement-fr",
    slug: "mep-association-agreement-fr",
    title: "[FR] Contacter un député européen — révision de l'accord d'association UE-Israël",
    actionType: "contact_representative",
    jurisdiction: "Union européenne — Parlement européen",
    intendedAudience:
      "Citoyens de l'UE souhaitant demander à leur député européen de soutenir la suspension partielle de l'accord d'association UE-Israël et de lier les accords commerciaux de l'UE au respect du DIH.",
    purpose:
      "En juin 2025, le Haut Représentant a constaté des indices de violation de l'article 2 de l'accord d'association UE-Israël. En septembre 2025, la Commission a proposé la suspension partielle des dispositions commerciales. Le Parlement européen a adopté une résolution soutenant la suspension. La proposition exige une majorité qualifiée au Conseil. Les députés européens peuvent presser leurs gouvernements nationaux de soutenir ou de bloquer les décisions du Conseil, et poser des questions et adopter des résolutions pour maintenir le sujet dans le débat parlementaire.",
    policyAsk:
      "Les députés européens peuvent : poser des questions écrites demandant à la Commission et au Conseil des mises à jour sur le processus de révision de l'accord d'association ; presser leur gouvernement national (via leur groupe politique) de soutenir la suspension partielle au Conseil ; soutenir les résolutions parlementaires renforçant le lien entre les préférences commerciales de l'UE et le respect du DIH ; et soulever la question dans les commissions AFET et INTA.",
    sourceBasis:
      "Accord d'association UE-Israël (2000), article 2 (clause des éléments essentiels). Révision du Haut Représentant (juin 2025) constatant des indices de violation. Proposition de la Commission européenne (17 septembre 2025) de suspendre partiellement les dispositions commerciales. Résolution du Parlement européen RC-B10-0372/2025 (septembre 2025).",
    instructions: `1. Identifiez vos députés européens sur le site du Parlement européen (europarl.europa.eu). Recherchez par pays et région.
2. Trouvez les coordonnées officielles de votre député européen. Utilisez l'adresse e-mail ou le formulaire de contact officiel du Parlement européen.
3. La révision de l'accord d'association est un processus de politique européenne spécifique et actif. Référencez la révision de juin 2025 et la proposition de la Commission de septembre 2025.
4. Adaptez le modèle. Ajoutez votre propre perspective — les députés apprécient d'entendre pourquoi une question de politique européenne spécifique touche personnellement un électeur.
5. Envoyez depuis votre propre adresse e-mail. Indiquez votre nom et votre État membre.`,
    templateBody: `[Votre nom]
[Votre État membre de l'UE et votre région]

Madame la Députée, / Monsieur le Député,

Je vous écris en tant qu'électeur·rice de [État membre, région] au sujet de l'accord d'association UE-Israël et de sa clause sur les droits humains.

En juin 2025, le Haut Représentant de l'UE a examiné le respect par Israël de l'article 2 de l'accord d'association — qui fait du respect des droits de l'homme et des principes démocratiques un élément essentiel — et a constaté des indices de violation. La révision a cité la détérioration de la situation humanitaire à Gaza, le blocus de l'aide humanitaire, les opérations militaires et l'expansion des colonies.

En septembre 2025, la Commission européenne a proposé de suspendre partiellement les dispositions commerciales de l'accord. La résolution du Parlement européen de septembre 2025 (RC-B10-0372/2025) a soutenu cette suspension.

Je soutiens la proposition de la Commission et la résolution du Parlement. La clause des éléments essentiels de l'accord d'association n'est pas décorative — c'est une obligation conventionnelle contraignante. Une politique étrangère européenne crédible exige que les préférences commerciales soient conditionnées au respect des droits humains et du droit international.

Je vous demande de bien vouloir :
- Poser une question écrite à la Commission et au Conseil pour obtenir une mise à jour sur le processus de révision de l'accord d'association et le statut de la proposition de suspension partielle
- Presser votre groupe politique et votre gouvernement national de soutenir la suspension au Conseil
- Soutenir le contrôle parlementaire continu des relations commerciales UE-Israël dans les commissions AFET et INTA

Je vous en fais la demande parce que [brève raison personnelle].

Je vous remercie pour votre temps et pour représenter notre communauté au Parlement européen.

Cordialement,
[Votre nom]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "fr",
    translationStatus: "draft",
    translationOf: "mep-association-agreement-en",
    contentStatus: "review_pending",
    sourceIds: [
      "eu-israel-association-agreement",
      "eu-commission-association-review-2025-06",
      "eu-commission-sanctions-proposal-2025-09",
      "eu-parliament-resolution-2025-09",
      "eu-parliament",
    ],
    lastChangedDate: "2026-07-28",
    version: 1,
    relatedRoutes: [
      "/institutions/european-union",
      "/legal-tracker",
      "/methodology",
    ],
    warnings: [
      "Cette page ne recherche pas votre député européen. Utilisez le site du Parlement européen.",
      "Aucun message n'est envoyé via cette plateforme. Copiez et envoyez vous-même.",
      "La révision de l'accord d'association est un processus politique en cours. Référencez les dates et les documents pour montrer que vous êtes informé·e.",
      "N'envoyez pas de menaces, d'injures ou de messages intimidants. Engagement civique légal uniquement.",
      "Ce modèle est une traduction provisoire et n'a pas été examiné par un·e expert·e du droit commercial de l'UE ou des procédures parlementaires.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-petition-guidance-nl",
    slug: "eu-petition-guidance-nl",
    title: "[NL] Een petitie indienen bij het Europees Parlement — Gaza-verantwoordingskwesties",
    actionType: "contact_representative",
    jurisdiction: "Europese Unie — Petitiescommissie van het Europees Parlement (PETI)",
    intendedAudience:
      "EU-burgers en -ingezetenen die het Europees Parlement willen verzoeken over kwesties die verband houden met Gaza-verantwoording, humanitaire toegang, wapenuitvoercontrole of naleving van internationale rechtsverplichtingen door de EU-instellingen.",
    purpose:
      "Elke EU-burger of -ingezetene kan het Europees Parlement verzoeken over een aangelegenheid binnen de werkterreinen van de EU die hem of haar rechtstreeks raakt. De Commissie verzoekschriften (PETI) onderzoekt petities en kan de Commissie om informatie vragen, petities doorverwijzen naar andere commissies of actie aanbevelen. Deze actie legt uit hoe u een petitie voorbereidt en indient — zij genereert geen petitie automatisch.",
    policyAsk:
      "De PETI-commissie kan: de Europese Commissie verzoeken het aangekaarte onderwerp te onderzoeken en informatie te verstrekken; de petitie doorverwijzen naar andere parlementaire commissies (AFET, DROI, DEVE); aanbevelen dat het Parlement een resolutie aanneemt; waar passend onderzoeksbezoeken afleggen; en haar aanbevelingen aan de indiener meedelen.",
    sourceBasis:
      "Verdrag betreffende de werking van de Europese Unie, artikelen 24 en 227 (petitierecht). Handvest van de grondrechten van de Europese Unie, artikel 44 (petitierecht). Reglement van het Europees Parlement, regels 226–230 (Commissie verzoekschriften).",
    instructions: `1. Bevestig dat uw petitie binnen de werkterreinen van de EU valt: humanitaire hulp, handelsbeleid, extern optreden, mensenrechten of institutionele naleving.
2. Bezoek het portaal voor petities van het Europees Parlement (europarl.europa.eu/petitions).
3. Bekijk de ontvankelijkheidscriteria: u moet EU-burger of -ingezetene zijn, de petitie moet een aangelegenheid binnen de EU-werkterreinen betreffen die u rechtstreeks raakt, en zij mag niet kennelijk niet-ontvankelijk zijn (misbruik, buiten de EU-bevoegdheid, of reeds door juridische procedures over dezelfde zaak behandeld).
4. Stel uw petitie op als een duidelijk, feitelijk document: wat de kwestie is, hoe zij binnen de EU-bevoegdheid valt, hoe zij u rechtstreeks raakt, en wat u het Parlement vraagt te doen.
5. Dien in via het portaal. U heeft een EU Login-account nodig indien u er geen heeft.
6. Petities zijn openbare documenten — zij worden op de PETI-website gepubliceerd tenzij u vertrouwelijkheid vraagt. Vermeld geen persoonlijke informatie die u niet openbaar wilt maken.`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "nl",
    translationStatus: "draft",
    translationOf: "eu-petition-guidance-en",
    contentStatus: "review_pending",
    sourceIds: [
      "eu-petitions-portal",
      "eu-parliament",
      "eu-common-position-2008-944",
      "eu-israel-association-agreement",
    ],
    lastChangedDate: "2026-07-28",
    version: 1,
    relatedRoutes: [
      "/institutions/european-union",
      "/methodology",
    ],
    warnings: [
      "Dit is een handleiding over hoe u een petitie indient — het platform dient geen petities in uw naam in.",
      "Petities moeten een aangelegenheid binnen de EU-bevoegdheid betreffen. De PETI-commissie verklaart elke petitie buiten de werkterreinen van de EU niet-ontvankelijk.",
      "Petities zijn openbare documenten. Vermeld geen persoonlijke of gevoelige informatie.",
      "Het petitieproces kost tijd. Tussen indiening en een beslissing over ontvankelijkheid kunnen enkele maanden verstrijken.",
      "Een petitie is geen rechtsklacht of beroep. Zij vervangt gerechtelijke procedures niet.",
      "Deze handleiding is een conceptvertaling en werd niet beoordeeld door een expert in de petitieprocedure van de EU.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "eu-petition-guidance-fr",
    slug: "eu-petition-guidance-fr",
    title: "[FR] Soumettre une pétition au Parlement européen — questions de responsabilité concernant Gaza",
    actionType: "contact_representative",
    jurisdiction: "Union européenne — Commission des pétitions du Parlement européen (PETI)",
    intendedAudience:
      "Citoyens et résidents de l'UE souhaitant présenter une pétition au Parlement européen sur des questions liées à la responsabilité à Gaza, à l'accès humanitaire, au contrôle des exportations d'armes ou au respect par les institutions de l'UE de leurs obligations de droit international.",
    purpose:
      "Tout citoyen ou résident de l'UE peut présenter une pétition au Parlement européen sur un sujet relevant des domaines d'activité de l'UE qui l'affecte directement. La commission des pétitions (PETI) examine les pétitions et peut demander des informations à la Commission, renvoyer les pétitions à d'autres commissions ou recommander une action. Cette action explique comment préparer et soumettre une pétition — elle ne génère pas automatiquement une pétition.",
    policyAsk:
      "La commission PETI peut : demander à la Commission européenne d'enquêter et de fournir des informations sur la question soulevée ; renvoyer la pétition à d'autres commissions parlementaires (AFET, DROI, DEVE) ; recommander que le Parlement adopte une résolution ; effectuer des visites de constatation le cas échéant ; et communiquer ses recommandations au pétitionnaire.",
    sourceBasis:
      "Traité sur le fonctionnement de l'Union européenne, articles 24 et 227 (droit de pétition). Charte des droits fondamentaux de l'Union européenne, article 44 (droit de pétition). Règlement intérieur du Parlement européen, règles 226 à 230 (commission des pétitions).",
    instructions: `1. Confirmez que votre pétition relève des domaines d'activité de l'UE : aide humanitaire, politique commerciale, action extérieure, droits de l'homme ou conformité institutionnelle.
2. Visitez le portail des pétitions du Parlement européen (europarl.europa.eu/petitions).
3. Examinez les critères de recevabilité : vous devez être citoyen ou résident de l'UE, la pétition doit concerner un sujet relevant de l'activité de l'UE qui vous affecte directement, et elle ne doit pas être manifestement irrecevable (abusive, hors de la compétence de l'UE, ou déjà traitée par une procédure judiciaire sur la même question).
4. Rédigez votre pétition comme un document clair et factuel : quel est le problème, comment relève-t-il de la compétence de l'UE, comment vous affecte-t-il directement, et que demandez-vous au Parlement de faire.
5. Soumettez via le portail. Vous devrez créer un compte EU Login si vous n'en avez pas.
6. Les pétitions sont des documents publics — elles sont publiées sur le site de la PETI sauf si vous demandez la confidentialité. N'incluez pas d'informations personnelles que vous ne souhaitez pas voir publiées.`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "fr",
    translationStatus: "draft",
    translationOf: "eu-petition-guidance-en",
    contentStatus: "review_pending",
    sourceIds: [
      "eu-petitions-portal",
      "eu-parliament",
      "eu-common-position-2008-944",
      "eu-israel-association-agreement",
    ],
    lastChangedDate: "2026-07-28",
    version: 1,
    relatedRoutes: [
      "/institutions/european-union",
      "/methodology",
    ],
    warnings: [
      "Ceci est un guide sur la façon de pétitionner — la plateforme ne soumet pas de pétitions en votre nom.",
      "Les pétitions doivent concerner un sujet relevant de la compétence de l'UE. La commission PETI déclarera irrecevable toute pétition hors des domaines d'activité de l'UE.",
      "Les pétitions sont des documents publics. N'incluez pas d'informations personnelles ou sensibles.",
      "Le processus de pétition prend du temps. Plusieurs mois peuvent s'écouler entre la soumission et une décision sur la recevabilité.",
      "Une pétition n'est pas une plainte juridique ou un recours. Elle ne remplace pas les procédures judiciaires.",
      "Ce guide est une traduction provisoire et n'a pas été examiné par un·e expert·e de la procédure de pétition de l'UE.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "journalist-briefing-be-nl",
    slug: "journalist-briefing-be-nl",
    title: "[NL] Een journalistenbriefing sturen — België/EU Gaza-verantwoording",
    actionType: "send_dossier",
    jurisdiction: "België en Europese Unie — journalisten die EU-zaken, Belgische politiek en verantwoording volgen",
    intendedAudience:
      "Mensen die openbare, gebronde informatie hebben verzameld over het Belgische en EU-beleid, juridische samenwerking, wapenuitvoerbeslissingen of humanitaire verbintenissen betreffende Gaza en deze verantwoordelijk willen delen met journalisten die deze onderwerpen volgen.",
    purpose:
      "Journalisten die EU-zaken en Belgische politiek volgen, spelen een cruciale rol bij het toegankelijk maken van complexe verantwoordingsinformatie voor het publiek. Het op verantwoorde en wettige wijze sturen van goed georganiseerde, gebronde openbare documentatie aan journalisten kan helpen om onderbelichte institutionele verantwoordingskwesties onder de aandacht te brengen.",
    policyAsk:
      "Journalisten kunnen: openbare documentatie over het Belgische en EU-beleid, juridische standpunten en hulp onderzoeken en verifiëren; rapporten over verantwoordingskwesties publiceren; verzoeken om toegang tot informatie indienen bij Belgische en EU-instellingen; en experts en functionarissen interviewen binnen hun redactionele normen.",
    sourceBasis:
      "Artikel 19, Universele Verklaring van de Rechten van de Mens. Artikel 11, Handvest van de grondrechten van de EU (vrijheid van meningsuiting en informatie). Belgische Grondwet, artikel 25 (persvrijheid). Verordening (EG) nr. 1049/2001 van de EU (openbare toegang tot documenten).",
    instructions: `1. Organiseer uw documentatie. Nuttig materiaal omvat: officiële Belgische parlementaire vragen en regeringsantwoorden; conclusies van de Raad Buitenlandse Zaken van de EU; resoluties van het Europees Parlement; Belgische en EU-wapenuitvoerrapporten; financieringsgegevens van DG ECHO; ICJ- en ICC-documenten met betrekking tot België of de EU; en verklaringen van Belgische of EU-functionarissen. Groepeer per instelling en datum.
2. Identificeer journalisten die EU-buitenlandbeleid, Belgische politiek of internationale justitie volgen.
3. Schrijf een korte, feitelijke samenvatting. Vermeld wat de documentatie aantoont, waarom het nu van belang is en wat onduidelijk blijft. Geen editorialisering of privé-informatie.
4. Respecteer de redactionele onafhankelijkheid van de journalist. Zij mogen al dan niet opvolgen — dat is hun professionele beslissing.`,
    templateBody: `Onderwerp: Openbare documentatie — België/EU-verantwoording betreffende [specifieke kwestie, periode]

Geachte [Naam van de journalist / redactie],

Ik deel openbare documentatie over [korte feitelijke beschrijving — bv. "de Belgische wapenuitvoervergunning en handhavingsmaatregelen, 2025–2026"].

De bijgevoegde documenten omvatten:
- [Type, bron, datum, URL]
- [Type, bron, datum, URL]
- [Type, bron, datum, URL]

Belangrijkste punten die de documentatie ondersteunt:
- [Feitelijk punt 1, met bronverwijzing]
- [Feitelijk punt 2, met bronverwijzing]
- [Feitelijk punt 3, met bronverwijzing]

Alle bronnen zijn openbaar beschikbaar. Ik heb URL's en raadpleegdata toegevoegd. [Optioneel: "Ik ben geen vertegenwoordiger van een genoemde organisatie — ik deel openbare documentatie als [onderzoeker / bezorgde burger / enz.]."]

Dank u voor uw werk over deze kwesties.

[Je naam]
[Optioneel: contactmethode als u wenst te worden bereikt]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "nl",
    translationStatus: "draft",
    translationOf: "journalist-briefing-be-en",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-chamber",
      "eu-parliament",
      "belgium-fps-foreign-affairs",
    ],
    lastChangedDate: "2026-07-28",
    version: 1,
    relatedRoutes: [
      "/countries/belgium",
      "/institutions/european-union",
      "/gaza-dossier",
      "/methodology",
    ],
    warnings: [
      "Deel uitsluitend openbare, geverifieerde documentatie. Deel geen privé-, geclassificeerde of gevoelige persoonlijke informatie.",
      "Deel geen grafische inhoud zonder inhoudswaarschuwing. Journalisten hebben hun eigen veiligheidsprotocollen.",
      "Dit is geen klokkenluiderskanaal. Voor veilige indiening gebruikt u de eigen beveiligde kanalen van de journalist.",
      "Er wordt geen informatie verzonden via dit platform. U verzendt het materiaal zelf.",
      "Journalisten ontvangen veel tips. Zij mogen al dan niet opvolgen. Stuur geen herhaalde ongevraagde berichten.",
      "Dit sjabloon is een conceptvertaling en werd niet beoordeeld door een expert in mediarecht of journalistieke veiligheid.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "journalist-briefing-be-fr",
    slug: "journalist-briefing-be-fr",
    title: "[FR] Envoyer un dossier de presse — responsabilité à Gaza, Belgique/UE",
    actionType: "send_dossier",
    jurisdiction: "Belgique et Union européenne — journalistes couvrant les affaires européennes, la politique belge et la responsabilité",
    intendedAudience:
      "Personnes ayant rassemblé des informations publiques sourcées sur la politique belge et européenne, la coopération juridique, les décisions d'exportation d'armes ou les engagements humanitaires concernant Gaza et souhaitant les partager de manière responsable avec des journalistes couvrant ces sujets.",
    purpose:
      "Les journalistes couvrant les affaires européennes et la politique belge jouent un rôle essentiel pour rendre accessibles au public des informations complexes sur la responsabilité. Envoyer de manière responsable et licite une documentation publique bien organisée et sourcée à des journalistes peut contribuer à attirer l'attention sur des questions de responsabilité institutionnelle sous-couvertes.",
    policyAsk:
      "Les journalistes peuvent : enquêter et vérifier la documentation publique sur la politique, les positions juridiques et l'aide belges et européennes ; publier des rapports sur les questions de responsabilité ; déposer des demandes d'accès à l'information auprès des institutions belges et européennes ; et interviewer des experts et des responsables dans le cadre de leurs normes éditoriales.",
    sourceBasis:
      "Article 19 de la Déclaration universelle des droits de l'homme. Article 11 de la Charte des droits fondamentaux de l'UE (liberté d'expression et d'information). Article 25 de la Constitution belge (liberté de la presse). Règlement (CE) n° 1049/2001 de l'UE (accès du public aux documents).",
    instructions: `1. Organisez votre documentation. Pour les sujets de responsabilité Belgique/UE, les documents utiles comprennent : les questions parlementaires belges officielles et les réponses du gouvernement ; les conclusions du Conseil des Affaires étrangères de l'UE ; les résolutions du Parlement européen ; les rapports belges et européens sur les exportations d'armes ; les données de financement humanitaire de DG ECHO ; les documents de la CIJ et de la CPI impliquant la Belgique ou l'UE ; et les déclarations de responsables belges ou européens. Classez par institution et par date.
2. Identifiez les journalistes couvrant la politique étrangère européenne, la politique belge ou la justice internationale.
3. Rédigez un résumé bref et factuel. Indiquez ce que montre la documentation, pourquoi elle importe maintenant et ce qui reste flou. Pas de prise de position ni d'informations privées.
4. Respectez l'indépendance éditoriale du journaliste. Il ou elle peut ne pas donner suite — c'est une décision professionnelle.`,
    templateBody: `Objet : Documentation publique — responsabilité Belgique/UE concernant [sujet spécifique, période]

Chère [Nom du/de la journaliste / rédaction], / Cher [Nom du/de la journaliste / rédaction],

Je partage une documentation publique concernant [brève description factuelle — ex. "les licences d'exportation d'armes et les mesures d'exécution de la Belgique, 2025–2026"].

Les documents joints comprennent :
- [Type, source, date, URL]
- [Type, source, date, URL]
- [Type, source, date, URL]

Principaux points que la documentation étaye :
- [Point factuel 1, avec référence de source]
- [Point factuel 2, avec référence de source]
- [Point factuel 3, avec référence de source]

Toutes les sources sont publiquement disponibles. J'ai inclus les URL et les dates de consultation. [Facultatif : « Je ne suis pas un représentant d'une organisation citée — je partage une documentation publique en tant que [chercheur·se / citoyen·ne concerné·e / etc.]. »]

Merci pour votre travail sur ces questions.

[Votre nom]
[Facultatif : moyen de contact si vous souhaitez être joint·e]`,
    templateReviewStatus: "draft",
    jurisdictionReviewStatus: "draft",
    languageReviewStatus: "draft",
    language: "fr",
    translationStatus: "draft",
    translationOf: "journalist-briefing-be-en",
    contentStatus: "review_pending",
    sourceIds: [
      "belgium-chamber",
      "eu-parliament",
      "belgium-fps-foreign-affairs",
    ],
    lastChangedDate: "2026-07-28",
    version: 1,
    relatedRoutes: [
      "/countries/belgium",
      "/institutions/european-union",
      "/gaza-dossier",
      "/methodology",
    ],
    warnings: [
      "Ne partagez que de la documentation publique et vérifiée. Ne partagez pas d'informations privées, classifiées ou sensibles.",
      "Ne partagez pas de contenu graphique sans avertissement. Les journalistes ont leurs propres protocoles de sécurité.",
      "Ce n'est pas un canal de lancement d'alerte. Pour une soumission sécurisée, utilisez les canaux sécurisés du journaliste.",
      "Aucune information n'est envoyée via cette plateforme. Vous envoyez le matériel vous-même.",
      "Les journalistes reçoivent de nombreuses informations. Ils peuvent ne pas donner suite. N'envoyez pas de messages non sollicités répétés.",
      "Ce modèle est une traduction provisoire et n'a pas été examiné par un·e expert·e du droit des médias ou de la sécurité journalistique.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "correction-source-be-nl",
    slug: "correction-source-be-nl",
    title: "[NL] Een correctie of publieke bron indienen — België- en EU-verantwoordingsarchieven",
    actionType: "submit_correction",
    jurisdiction: "Platformbreed — België- en EU-focus tijdens de statische bèta",
    intendedAudience:
      "Iedereen — inwoners van België en de EU, onderzoekers, institutioneel personeel, journalisten en maatschappelijk werkers — die een fout, verouderde informatie of een ontbrekende publieke bron heeft vastgesteld op de België- of EU-verantwoordingspagina's van het platform, en die een correctie of bronvoorstel wenst in te dienen.",
    purpose:
      "België- en EU-verantwoordingsarchieven zijn complex: zij omvatten meerdere bestuursniveaus (federale, regionale, gemeenschaps-, EU-), snel evoluerende beleidsstandpunten en meertalige officiële documentatie. Fouten en omissies kunnen voorkomen. Correcties en bronvoorstellen van mensen die vertrouwd zijn met het Belgische en EU-bestuur zijn bijzonder waardevol tijdens de statische bèta.",
    policyAsk:
      "De platformbeheerders kunnen: ingediende correcties en bronvoorstellen toetsen aan de methodologie; België- en EU-verantwoordingsarchieven bijwerken met beoordeelde correcties; correct gedocumenteerde bronnen toevoegen aan het bronregister; en grote correcties openbaar loggen.",
    sourceBasis:
      "Platformmethodologie op /methodology. Correctieproces op /corrections. Bijdragegids in de GitHub-repository. Belgische en EU-officiële websites, parlementaire archieven en institutionele publicaties als bronmateriaal.",
    instructions: `1. Lees de correctierichtlijnen op /corrections vóór indiening.
2. Identificeer de specifieke pagina, sectie of het record dat correctie of bronvermelding nodig heeft.
3. Verstrek: de specifieke bewering of het datapunt, waarom het onjuist of verouderd is, de juiste informatie en een publieke bron die de correctie ondersteunt.
4. Voor België-specifieke records: verstrek indien mogelijk de bron in de oorspronkelijke taal (Nederlands, Frans of Duits) met een korte Engelse samenvatting.
5. Voor EU-institutionele records: verwijs naar het specifieke document, de resolutie of het besluit met het officiële referentienummer indien beschikbaar.
6. Dien in via GitHub Issues (voorkeur) of via de projectcontactroute op de Bijdragen-pagina.
7. Verstuur geen gevoelige persoonlijke informatie, geclassificeerd materiaal of privécorrespondentie via openbare kanalen.`,
    templateReviewStatus: "not_applicable",
    jurisdictionReviewStatus: "not_applicable",
    languageReviewStatus: "draft",
    language: "nl",
    translationStatus: "draft",
    translationOf: "correction-source-be-en",
    contentStatus: "review_pending",
    sourceIds: [],
    lastChangedDate: "2026-07-28",
    version: 1,
    relatedRoutes: [
      "/corrections",
      "/methodology",
      "/contribute",
      "/countries/belgium",
      "/institutions/european-union",
    ],
    warnings: [
      "Verstuur geen gevoelige getuigeninformatie, privégegevens of vertrouwelijk materiaal via openbare GitHub-issues.",
      "Correcties worden verwerkt tijdens de statische bèta, maar kunnen vertraging oplopen. Een antwoord kan één tot vier weken duren.",
      "Niet elke correctie of bronvoorstel wordt onmiddellijk toegepast — sommige vereisen deskundige toetsing of kruisverwijzing naar primaire bronnen.",
      "Als u niet zeker weet of informatie openbaar is, verstuur deze dan niet. Gebruik bij twijfel de projectcontactroute in plaats van een openbaar GitHub-issue.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "correction-source-be-fr",
    slug: "correction-source-be-fr",
    title: "[FR] Soumettre une correction ou une source publique — archives de responsabilité Belgique/UE",
    actionType: "submit_correction",
    jurisdiction: "Plateforme entière — focus Belgique/UE pendant la bêta statique",
    intendedAudience:
      "Toute personne — résidents belges et européens, chercheurs, personnel institutionnel, journalistes et travailleurs de la société civile — ayant identifié une erreur, une information obsolète ou une source publique manquante sur les pages de responsabilité Belgique/UE de la plateforme et souhaitant soumettre une correction ou une suggestion de source.",
    purpose:
      "Les archives de responsabilité Belgique/UE sont complexes : elles impliquent plusieurs niveaux de gouvernement (fédéral, régional, communautaire, UE), des positions politiques en évolution rapide et une documentation officielle multilingue. Des erreurs et des omissions peuvent survenir. Les corrections et suggestions de sources de personnes familières avec la gouvernance belge et européenne sont particulièrement précieuses pendant la bêta statique.",
    policyAsk:
      "Les responsables de la plateforme peuvent : examiner les corrections et suggestions de sources soumises par rapport à la méthodologie ; mettre à jour les archives de responsabilité Belgique/UE avec des corrections examinées ; ajouter des sources correctement documentées au registre des sources ; et consigner publiquement les corrections majeures.",
    sourceBasis:
      "Méthodologie de la plateforme sur /methodology. Processus de correction sur /corrections. Guide de contribution dans le dépôt GitHub. Sites officiels belges et européens, archives parlementaires et publications institutionnelles comme matériel source.",
    instructions: `1. Lisez les directives de correction sur /corrections avant de soumettre.
2. Identifiez la page, la section ou le dossier spécifique nécessitant une correction ou une source.
3. Fournissez : l'affirmation ou la donnée spécifique, pourquoi elle est inexacte ou obsolète, l'information correcte et une source publique qui étaye la correction.
4. Pour les dossiers spécifiques à la Belgique : fournissez si possible la source dans sa langue d'origine (néerlandais, français ou allemand) avec un bref résumé en anglais.
5. Pour les dossiers institutionnels de l'UE : référencez le document, la résolution ou la décision spécifique avec son numéro de référence officiel si disponible.
6. Soumettez via GitHub Issues (préféré) ou la route de contact du projet sur la page Contribuer.
7. Ne soumettez pas d'informations personnelles sensibles, de matériel classifié ou de correspondance privée via des canaux publics.`,
    templateReviewStatus: "not_applicable",
    jurisdictionReviewStatus: "not_applicable",
    languageReviewStatus: "draft",
    language: "fr",
    translationStatus: "draft",
    translationOf: "correction-source-be-en",
    contentStatus: "review_pending",
    sourceIds: [],
    lastChangedDate: "2026-07-28",
    version: 1,
    relatedRoutes: [
      "/corrections",
      "/methodology",
      "/contribute",
      "/countries/belgium",
      "/institutions/european-union",
    ],
    warnings: [
      "Ne soumettez pas d'informations sensibles de témoins, de données personnelles privées ou de matériel confidentiel via des issues GitHub publiques.",
      "Les corrections sont traitées pendant la bêta statique mais peuvent être retardées. Une réponse peut prendre une à quatre semaines.",
      "Toutes les corrections ou suggestions ne seront pas appliquées immédiatement — certaines exigent un examen expert ou une recoupement avec les sources primaires.",
      "Si vous n'êtes pas certain·e que l'information est publique, ne la soumettez pas. En cas de doute, utilisez la route de contact du projet plutôt qu'une issue GitHub publique.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "volunteer-reviewer-be-nl",
    slug: "volunteer-reviewer-be-nl",
    title: "[NL] Vrijwilliger worden als reviewer — België- en EU-verantwoordingsexpertise",
    actionType: "volunteer",
    jurisdiction: "Elk land — expertise in Belgisch of EU-bestuur, recht of beleid vereist",
    intendedAudience:
      "Mensen met expertise in het Belgische federale of regionale bestuur, EU-institutioneel recht en beleid, internationaal humanitair recht, wapenuitvoercontrole, parlementaire procedure of humanitaire coördinatie — die hun expertise willen inzetten om de België- en EU-verantwoordingsarchieven van het platform te beoordelen.",
    purpose:
      "Accountability Atlas heeft reviewers nodig met specifieke België- en EU-expertise. Het Belgische bestuur omvat complexe federale-regionale bevoegdheidsverdelingen. De EU-besluitvorming omvat meerdere instellingen met verschillende procedures. Reviewers die deze systemen begrijpen, kunnen helpen ervoor te zorgen dat de België- en EU-archieven accuraat, actueel en correct afgestemd zijn op elk bestuursniveau.",
    policyAsk:
      "Vrijwillige reviewers kunnen: Belgische landverantwoordingsarchieven beoordelen op juistheid (federale, regionale en gemeenschapsniveau); EU-institutionele archieven verifiëren op procedurele correctheid; controleren dat wapenuitvoer-, humanitaire hulp- en juridische samenwerkingsrecords acties correct toeschrijven aan het bevoegde bestuursniveau; Nederlandse en Franse vertalingen van actiesjablonen beoordelen; en verouderde of achterhaalde beleidsstandpunten signaleren.",
    sourceBasis:
      "Platformmethodologie op /methodology. Contentreviewworkflow op docs/content-review-workflow.md. Bijdragegids in de GitHub-repository. Opensourcelicentie (AGPL-3.0-or-later).",
    instructions: `1. Lees de Bijdragen-pagina op /contribute voor rolomschrijvingen en voorwaarden.
2. Lees de contentreviewworkflow op docs/content-review-workflow.md in de repository.
3. Bekijk de België- en EU-verantwoordingspagina's op het platform om de huidige reikwijdte en structuur te begrijpen: /countries/belgium en /institutions/european-union.
4. Als u een domein identificeert waar uw expertise kan helpen — bijvoorbeeld Vlaamse wapenuitvoervergunning, Waalse parlementaire procedure, besluitvorming van de Raad Buitenlandse Zaken van de EU of Belgische ontwikkelingssamenwerking — vermeld dit specifiek wanneer u zich voorstelt.
5. Stel u voor op GitHub door een issue te openen of deel te nemen aan een bijdragediscussie. Vermeld uw expertisegebied, uw interesse in het project en wat voor review u kunt bieden.
6. Elke bijdrage wordt beoordeeld. Begin met één gerichte review — een enkele pagina, enkele records of één vertaalcontrole — in plaats van alles tegelijk te willen beoordelen.`,
    templateReviewStatus: "not_applicable",
    jurisdictionReviewStatus: "not_applicable",
    languageReviewStatus: "draft",
    language: "nl",
    translationStatus: "draft",
    translationOf: "volunteer-reviewer-be-en",
    contentStatus: "review_pending",
    sourceIds: [],
    lastChangedDate: "2026-07-28",
    version: 1,
    relatedRoutes: [
      "/contribute",
      "/countries/belgium",
      "/institutions/european-union",
      "/methodology",
    ],
    warnings: [
      "Lees de Gedragscode en de Bijdragegids vóór u bijdraagt.",
      "Reviewers worden geïdentificeerd per rol, niet per naam, tenzij zij uitdrukkelijk instemmen met publieke naamsvermelding.",
      "Deel geen gevoelige of vertrouwelijke informatie in openbare bijdragediscussies.",
      "Dit is een vrijwilligersrol. Reviewers zijn geen projectmedewerkers en vertegenwoordigen het project niet zonder toestemming.",
      "Als u werkzaam bent bij of verbonden aan een instelling waarvan de standpunten op het platform worden gevolgd, vermeld dit dan wanneer u zich aanmeldt — het is geen belemmering, maar transparantie is belangrijk.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
  {
    id: "volunteer-reviewer-be-fr",
    slug: "volunteer-reviewer-be-fr",
    title: "[FR] Devenir bénévole comme relecteur·rice — expertise Belgique/UE en matière de responsabilité",
    actionType: "volunteer",
    jurisdiction: "Tout pays — expertise requise en gouvernance, droit ou politique belge ou européenne",
    intendedAudience:
      "Personnes ayant une expertise en gouvernance fédérale ou régionale belge, en droit et politique institutionnels de l'UE, en droit international humanitaire, en contrôle des exportations d'armes, en procédure parlementaire ou en coordination humanitaire — souhaitant mettre leur expertise au service de l'examen des archives de responsabilité Belgique/UE de la plateforme.",
    purpose:
      "Accountability Atlas a besoin de relecteurs·rices possédant une expertise spécifique Belgique/UE. La gouvernance belge implique des répartitions de compétences fédérales-régionales complexes. La prise de décision de l'UE implique plusieurs institutions aux procédures distinctes. Les relecteurs·rices qui comprennent ces systèmes peuvent aider à garantir que les archives Belgique/UE sont exactes, actuelles et correctement rattachées à chaque niveau de gouvernement.",
    policyAsk:
      "Les relecteurs·rices bénévoles peuvent : examiner l'exactitude des archives de responsabilité du pays belge (niveaux fédéral, régional et communautaire) ; vérifier l'exactitude procédurale des archives institutionnelles de l'UE ; vérifier que les archives sur les exportations d'armes, l'aide humanitaire et la coopération juridique attribuent correctement les actions au niveau de gouvernement compétent ; examiner les traductions néerlandaises et françaises des modèles d'action ; et signaler les positions politiques obsolètes.",
    sourceBasis:
      "Méthodologie de la plateforme sur /methodology. Workflow de relecture de contenu sur docs/content-review-workflow.md. Guide de contribution dans le dépôt GitHub. Licence open source (AGPL-3.0-or-later).",
    instructions: `1. Lisez la page Contribuer sur /contribute pour les descriptions de rôles et les conditions préalables.
2. Lisez le workflow de relecture de contenu sur docs/content-review-workflow.md dans le dépôt.
3. Examinez les pages de responsabilité Belgique/UE de la plateforme pour comprendre la portée et la structure actuelles : /countries/belgium et /institutions/european-union.
4. Si vous identifiez un domaine où votre expertise peut aider — par exemple les licences d'exportation d'armes flamandes, la procédure parlementaire wallonne, la prise de décision du Conseil des Affaires étrangères de l'UE ou la coopération au développement belge — mentionnez-le spécifiquement lorsque vous vous présentez.
5. Présentez-vous sur GitHub en ouvrant une issue ou en rejoignant une discussion de contribution. Indiquez votre domaine d'expertise, votre intérêt pour le projet et le type de relecture que vous pouvez offrir.
6. Chaque contribution est examinée. Commencez par une relecture ciblée — une seule page, quelques dossiers ou une vérification de traduction — plutôt que de proposer de tout examiner à la fois.`,
    templateReviewStatus: "not_applicable",
    jurisdictionReviewStatus: "not_applicable",
    languageReviewStatus: "draft",
    language: "fr",
    translationStatus: "draft",
    translationOf: "volunteer-reviewer-be-en",
    contentStatus: "review_pending",
    sourceIds: [],
    lastChangedDate: "2026-07-28",
    version: 1,
    relatedRoutes: [
      "/contribute",
      "/countries/belgium",
      "/institutions/european-union",
      "/methodology",
    ],
    warnings: [
      "Lisez le Code de conduite et le Guide de contribution avant de contribuer.",
      "Les relecteurs·rices sont identifié·e·s par leur rôle, pas par leur nom, sauf consentement explicite à l'attribution publique.",
      "Ne partagez pas d'informations sensibles ou confidentielles dans les discussions publiques de contribution.",
      "C'est un rôle bénévole. Les relecteurs·rices ne sont pas membres du personnel du projet et ne représentent pas le projet sans autorisation.",
      "Si vous êtes employé·e ou affilié·e à une institution dont les positions sont suivies sur la plateforme, veuillez le signaler en vous portant volontaire — ce n'est pas un obstacle, mais la transparence est importante.",
    ],
    active: true,
    correctionUrl: "/corrections",
  },
];

/** Convenience: active templates only. */
export function getActiveTemplates(): ActionTemplate[] {
  return actionTemplates.filter((t) => t.active);
}

/** Convenience: template lookup by slug. */
export function getTemplateBySlug(
  slug: string,
): ActionTemplate | undefined {
  return actionTemplates.find((t) => t.slug === slug);
}
