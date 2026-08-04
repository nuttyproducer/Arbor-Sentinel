import type { RawCourtDocument } from "./LegalNormalizer";

// ── ICJ Mock Documents ─────────────────────────────────────────────────────

export const icjOrderDocument: RawCourtDocument = {
  url: "https://www.icj-cij.org/node/203455",
  title:
    "Application of the Convention on the Prevention and Punishment of the Crime of Genocide in the Gaza Strip (South Africa v. Israel) — Order of 26 January 2024",
  court: "ICJ",
  caseName: "South Africa v. Israel",
  caseNumber: "ICJ Case No. 192",
  parties: ["South Africa", "Israel"],
  documentType: "order",
  date: "2024-01-26",
  bodyText: `The International Court of Justice today delivered its Order on the Request for the indication of provisional measures submitted by South Africa in the case concerning Application of the Convention on the Prevention and Punishment of the Crime of Genocide in the Gaza Strip (South Africa v. Israel).

The Court indicated the following provisional measures:

(1) By fifteen votes to two, The State of Israel shall, in accordance with its obligations under the Convention on the Prevention and Punishment of the Crime of Genocide, in relation to Palestinians in Gaza, take all measures within its power to prevent the commission of all acts within the scope of Article II of this Convention, in particular: (a) killing members of the group; (b) causing serious bodily or mental harm to members of the group; (c) deliberately inflicting on the group conditions of life calculated to bring about its physical destruction in whole or in part; and (d) imposing measures intended to prevent births within the group.

(2) By fifteen votes to two, The State of Israel shall ensure with immediate effect that its military does not commit any acts described in point 1 above.

(3) By sixteen votes to one, The State of Israel shall take all measures within its power to prevent and punish the direct and public incitement to commit genocide in relation to members of the Palestinian group in the Gaza Strip.

(4) By sixteen votes to one, The State of Israel shall take immediate and effective measures to enable the provision of urgently needed basic services and humanitarian assistance to address the adverse conditions of life faced by Palestinians in the Gaza Strip.

(5) By fifteen votes to two, The State of Israel shall take effective measures to prevent the destruction and ensure the preservation of evidence related to allegations of acts within the scope of Article II and Article III of the Convention.

(6) By fifteen votes to two, The State of Israel shall submit a report to the Court on all measures taken to give effect to this Order within one month as from the date of this Order.`,
  summaryText:
    "The ICJ issued provisional measures in the case brought by South Africa alleging violations of the Genocide Convention. The Court ordered Israel to take measures to prevent genocide, ensure humanitarian access, and preserve evidence.",
  keyRulings: [
    "The State of Israel shall take all measures within its power to prevent the commission of all acts within the scope of Article II of the Genocide Convention.",
    "The State of Israel shall ensure with immediate effect that its military does not commit any acts described in point 1 above.",
    "The State of Israel shall take immediate and effective measures to enable the provision of urgently needed basic services and humanitarian assistance.",
    "The State of Israel shall submit a report to the Court on all measures taken to give effect to this Order within one month.",
  ],
  legalBasis: [
    "Genocide Convention — Article II",
    "Genocide Convention — Article III",
    "Statute of the International Court of Justice — Article 41",
  ],
  nextSteps: [
    "Israel shall submit a report to the Court on all measures taken within one month.",
    "The case will proceed to the merits phase.",
  ],
  language: "en",
};

export const icjPressRelease: RawCourtDocument = {
  url: "https://www.icj-cij.org/node/203465",
  title:
    "Application of the Convention on the Prevention and Punishment of the Crime of Genocide in the Gaza Strip (South Africa v. Israel) — The Court orders Israel to ensure humanitarian assistance to Palestinians in Gaza",
  court: "ICJ",
  caseName: "South Africa v. Israel",
  caseNumber: "ICJ Case No. 192",
  parties: ["South Africa", "Israel"],
  documentType: "press_release",
  date: "2024-03-28",
  bodyText: `The International Court of Justice today delivered its Order on the request for additional provisional measures submitted by South Africa.

The Court reaffirmed the provisional measures indicated in its Order of 26 January 2024 and indicated new measures. It ordered Israel, by fifteen votes to one, to take all necessary and effective measures to ensure, without delay, in full cooperation with the United Nations, the unhindered provision at scale by all concerned of urgently needed basic services and humanitarian assistance.

The Court observed that the catastrophic living conditions of the Palestinians in the Gaza Strip have deteriorated further, in particular in view of the prolonged and widespread deprivation of food and other basic necessities to which the Palestinians in the Gaza Strip have been subjected.

The Court further reaffirmed that the State of Israel remains bound to fully comply with its obligations under the Genocide Convention and with the Order of 26 January 2024.`,
  summaryText:
    "The ICJ issued modified provisional measures reaffirming earlier measures and adding specific obligations regarding humanitarian assistance. The order followed a further request from South Africa citing worsening conditions and famine.",
  keyRulings: [
    "The Court reaffirmed the provisional measures indicated in its Order of 26 January 2024.",
    "Israel shall take all necessary and effective measures to ensure the unhindered provision of urgently needed basic services and humanitarian assistance.",
    "The State of Israel remains bound to fully comply with its obligations under the Genocide Convention.",
  ],
  legalBasis: [
    "Genocide Convention",
    "Statute of the International Court of Justice — Article 41",
  ],
  nextSteps: [
    "Israel shall submit a report on compliance with the additional measures.",
    "Continued monitoring of the humanitarian situation in Gaza.",
  ],
  language: "en",
};

// ── ICC Mock Documents ─────────────────────────────────────────────────────

export const iccWarrantDocument: RawCourtDocument = {
  url: "https://www.icc-cpi.int/news/situation-palestine-icc-pre-trial-chamber-i-issues-warrant-arrest",
  title:
    "Situation in the State of Palestine: ICC Pre-Trial Chamber I issues warrant of arrest for Benjamin Netanyahu and Yoav Gallant",
  court: "ICC",
  caseName: "The Prosecutor v. Benjamin Netanyahu and Yoav Gallant",
  caseNumber: "ICC-01/18",
  parties: ["The Prosecutor", "Benjamin Netanyahu", "Yoav Gallant"],
  documentType: "warrant",
  date: "2024-11-21",
  bodyText: `Today, on 21 November 2024, Pre-Trial Chamber I of the International Criminal Court issued warrants of arrest for two individuals, Mr Benjamin Netanyahu and Mr Yoav Gallant, for crimes against humanity and war crimes committed from at least 8 October 2023 until at least 20 May 2024.

The Chamber issued the warrants of arrest in relation to the situation in the State of Palestine.

The warrants are classified as "secret" in order to protect witnesses and safeguard the conduct of investigations. However, the Chamber considers that the disclosure of the existence of the warrants is in the interest of victims and their families.

The Chamber found reasonable grounds to believe that Mr Netanyahu and Mr Gallant each bear criminal responsibility as co-perpetrators for committing the acts jointly with others: the war crime of starvation as a method of warfare; and the crimes against humanity of murder, persecution, and other inhumane acts.

The Chamber also found reasonable grounds to believe that Mr Netanyahu and Mr Gallant each bear criminal responsibility as civilian superiors for the war crime of intentionally directing an attack against the civilian population.`,
  summaryText:
    "The ICC Pre-Trial Chamber I issued warrants of arrest for Benjamin Netanyahu and Yoav Gallant for crimes against humanity and war crimes committed in the context of the situation in the State of Palestine.",
  keyRulings: [
    "Warrants of arrest issued for Benjamin Netanyahu and Yoav Gallant.",
    "Reasonable grounds to believe both bear criminal responsibility as co-perpetrators for the war crime of starvation as a method of warfare.",
    "Reasonable grounds to believe both bear criminal responsibility for crimes against humanity of murder, persecution, and other inhumane acts.",
    "Warrants classified as secret to protect witnesses and safeguard investigations.",
  ],
  legalBasis: [
    "Rome Statute — Article 7 (Crimes against humanity)",
    "Rome Statute — Article 8 (War crimes)",
    "Rome Statute — Article 25 (Individual criminal responsibility)",
    "Rome Statute — Article 28 (Responsibility of commanders and other superiors)",
  ],
  nextSteps: [
    "States Parties to the Rome Statute are obligated to cooperate in the arrest and surrender of the individuals.",
    "Continued investigation by the Office of the Prosecutor.",
  ],
  language: "en",
};

export const iccProceedingUpdate: RawCourtDocument = {
  url: "https://www.icc-cpi.int/news/statement-icc-prosecutor-karim-aa-khan-kc-confirms-advance-his-investigation-situation",
  title:
    "Statement of ICC Prosecutor Karim A.A. Khan KC on the Situation in the State of Palestine: receipt of a referral from five States Parties",
  court: "ICC",
  caseName: "Situation in the State of Palestine",
  caseNumber: "ICC-01/18",
  parties: ["The Prosecutor"],
  documentType: "prosecutor_statement",
  date: "2023-11-17",
  bodyText: `On 17 November 2023, my Office received a referral of the Situation in the State of Palestine from the following five States Parties: South Africa, Bangladesh, Bolivia (Plurinational State of), Comoros, and Djibouti.

In accordance with the Rome Statute, a State Party may refer to the Prosecutor a situation in which one or more crimes within the jurisdiction of the Court appear to have been committed, requesting the Prosecutor to investigate the situation.

My Office confirms that it is currently conducting an investigation into the situation in the State of Palestine. This investigation, commenced on 3 March 2021, extends to the escalation of hostilities and violence that followed the attacks of 7 October 2023.

I confirm that my Office has jurisdiction over the Situation in the State of Palestine. This is by virtue of Palestine being a State Party to the Rome Statute since 1 April 2015, and the referrals received.

I call upon all States to respect the independence of my Office. All attempts to impede, intimidate or improperly influence the officials of this Court must cease immediately.`,
  summaryText:
    "ICC Prosecutor Karim Khan confirms that his Office is investigating the situation in Palestine, including the escalation following 7 October 2023. Five States Parties referred the situation.",
  keyRulings: [
    "The Office of the Prosecutor confirms it is conducting an investigation into the situation in the State of Palestine.",
    "The investigation extends to the escalation of hostilities and violence following the attacks of 7 October 2023.",
    "The Office has jurisdiction over the Situation in Palestine by virtue of Palestine's accession to the Rome Statute.",
  ],
  legalBasis: [
    "Rome Statute — Article 12 (Preconditions to the exercise of jurisdiction)",
    "Rome Statute — Article 13 (Exercise of jurisdiction)",
    "Rome Statute — Article 14 (Referral of a situation by a State Party)",
  ],
  nextSteps: [
    "Continued investigation by the Office of the Prosecutor.",
    "Cooperation from States Parties in gathering evidence and testimony.",
  ],
  language: "en",
};

export const iccDocketEntry: RawCourtDocument = {
  url: "https://www.icc-cpi.int/situations/palestine",
  title: "Situation in the State of Palestine",
  court: "ICC",
  caseName: "Situation in the State of Palestine",
  caseNumber: "ICC-01/18",
  parties: [],
  documentType: "docket_update",
  date: "2024-11-21",
  bodyText: `The situation in the State of Palestine was referred to the Office of the Prosecutor by the Government of the State of Palestine on 22 May 2018.

On 3 March 2021, the Prosecutor announced the opening of an investigation into the Situation in the State of Palestine. The investigation covers crimes within the jurisdiction of the Court that are alleged to have been committed in the Situation since 13 June 2014.

On 17 November 2023, the Office of the Prosecutor received a referral from five States Parties: South Africa, Bangladesh, Bolivia, Comoros, and Djibouti.

On 21 November 2024, Pre-Trial Chamber I issued warrants of arrest for Benjamin Netanyahu and Yoav Gallant.

The situation remains under active investigation by the Office of the Prosecutor.`,
  summaryText:
    "Overview of the ICC's investigation into the Situation in the State of Palestine, including referrals, investigation milestones, and arrest warrants issued by Pre-Trial Chamber I.",
  keyRulings: [],
  legalBasis: ["Rome Statute"],
  nextSteps: [
    "Active investigation continues by the Office of the Prosecutor.",
  ],
  language: "en",
};

// ── Collection of all mock documents ───────────────────────────────────────

export const allMockDocuments: RawCourtDocument[] = [
  icjOrderDocument,
  icjPressRelease,
  iccWarrantDocument,
  iccProceedingUpdate,
  iccDocketEntry,
];

/** ICJ document HTML mock (simplified for testing). */
export const icjOrderHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Application of the Convention on the Prevention and Punishment of the Crime of Genocide in the Gaza Strip (South Africa v. Israel) — Order of 26 January 2024 | International Court of Justice</title>
  <meta name="description" content="The ICJ issued provisional measures in the case brought by South Africa alleging violations of the Genocide Convention." />
  <meta property="article:published_time" content="2024-01-26" />
</head>
<body>
  <header><nav>...</nav></header>
  <main>
    <article>
      <h1>Order of 26 January 2024</h1>
      <p>The International Court of Justice today delivered its Order on the Request for the indication of provisional measures submitted by South Africa in the case concerning Application of the Convention on the Prevention and Punishment of the Crime of Genocide in the Gaza Strip (South Africa v. Israel).</p>
      <p>The Court indicated the following provisional measures:</p>
      <p>(1) By fifteen votes to two, The State of Israel shall, in accordance with its obligations under the Convention on the Prevention and Punishment of the Crime of Genocide, in relation to Palestinians in Gaza, take all measures within its power to prevent the commission of all acts within the scope of Article II of this Convention.</p>
      <p>(2) By fifteen votes to two, The State of Israel shall ensure with immediate effect that its military does not commit any acts described in point 1 above.</p>
      <p>The Court finds that there is a real and imminent risk that irreparable prejudice will be caused to the rights of the Applicants. The Court decides that Israel must submit a report within one month.</p>
    </article>
  </main>
  <footer>...</footer>
</body>
</html>`;

/** ICC warrant HTML mock (simplified for testing). */
export const iccWarrantHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Situation in the State of Palestine: ICC Pre-Trial Chamber I issues warrant of arrest | International Criminal Court</title>
  <meta name="description" content="ICC Pre-Trial Chamber I issues warrant of arrest for Benjamin Netanyahu and Yoav Gallant." />
  <meta property="article:published_time" content="2024-11-21" />
</head>
<body>
  <header><nav>...</nav></header>
  <main>
    <article>
      <h1>ICC Pre-Trial Chamber I issues warrant of arrest for Benjamin Netanyahu and Yoav Gallant</h1>
      <p>Today, on 21 November 2024, Pre-Trial Chamber I of the International Criminal Court issued warrants of arrest for two individuals, Mr Benjamin Netanyahu and Mr Yoav Gallant, for crimes against humanity and war crimes committed from at least 8 October 2023 until at least 20 May 2024.</p>
      <p>The Chamber found reasonable grounds to believe that Mr Netanyahu and Mr Gallant each bear criminal responsibility as co-perpetrators for the war crime of starvation as a method of warfare; and the crimes against humanity of murder, persecution, and other inhumane acts.</p>
      <p>The Chamber also found reasonable grounds to believe that both bear criminal responsibility as civilian superiors for the war crime of intentionally directing an attack against the civilian population.</p>
    </article>
  </main>
  <footer>...</footer>
</body>
</html>`;
