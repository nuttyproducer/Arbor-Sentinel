/**
 * Structured data for the Gaza Dossier page.
 *
 * Extracted from the page component to keep the component focused
 * on layout and rendering, with data testable independently.
 *
 * All claims are source-linked where possible. Editorial status is
 * review_pending until authorized human review. Legal wording remains
 * review_pending until a legal reviewer signs off.
 */

export const harmCategories = [
  {
    title: "Civilian Harm",
    description:
      "Documented patterns of civilian casualties, injuries, and harm to protected persons under international humanitarian law. The UN COI's June 2026 report found that between October 2023 and October 2025, at least 20,179 Palestinian children were killed in Gaza. Since the October 2025 ceasefire, over 1,100 Palestinians have been killed according to OCHA reporting.",
    accent: "clay" as const,
    sourceIds: ["un-coi-2026-children", "ocha-opt-sitrep-2026-07-10"],
  },
  {
    title: "Displacement",
    description:
      "Forced displacement, evacuation orders, and conditions preventing safe return, assessed against IHL prohibitions on forced transfer. New displacements continue along the 'Yellow Line' in northern Rafah as of July 2026. In the West Bank, over 3,200 Palestinians have been displaced in 2026 — an average of 17 per day, double the rate of the preceding three years.",
    accent: "amber" as const,
    sourceIds: ["ocha-opt-sitrep-2026-07-10", "ocha-opt-main"],
  },
  {
    title: "Healthcare Access",
    description:
      "Attacks on healthcare facilities, medical personnel, and impediments to medical access — tracked against IHL special protections for medical services. The ICRC reported in June 2026 that health care in northern Gaza had been 'obliterated,' with Kamal Adwan and Indonesian hospitals rendered 'completely inoperable.' The UN COI documented attacks on neonatal and maternity care and found Gaza now has the highest concentration of child amputees in the world.",
    accent: "clay" as const,
    sourceIds: ["icrc-gaza-collapse-2026-06", "un-coi-2026-children"],
  },
  {
    title: "Food & Water Access",
    description:
      "Access to food, clean water, and sanitation infrastructure. The IPC July 2026 Special Snapshot classifies the entire Gaza Strip in IPC Phase 3 (Crisis), with 1.4 million people facing high levels of acute food insecurity through December 2026. Water delivery is down 15–20% due to funding shortfalls. The use of starvation as a method of warfare is prohibited under IHL and is the subject of an active ICC arrest warrant.",
    accent: "amber" as const,
    sourceIds: ["ipc-gaza-snapshot-2026-07", "ocha-opt-sitrep-2026-07-10", "icc-arrest-warrants-2024-11"],
  },
  {
    title: "Infrastructure Damage",
    description:
      "Damage to civilian infrastructure including housing, schools, places of worship, and cultural property — assessed for proportionality and distinction. The UN COI's June 2026 report found 97% of schools in Gaza destroyed or damaged, 22 of 38 universities completely destroyed, and critical water and sanitation infrastructure severely compromised.",
    accent: "blue" as const,
    sourceIds: ["un-coi-2026-children"],
  },
  {
    title: "Humanitarian Access",
    description:
      "Obstruction of humanitarian relief operations, attacks on aid workers, and denial of access to civilian populations in need. The UN Humanitarian Coordinator condemned an 'increasingly dangerous pattern of intimidation, violence and obstruction' by de facto authorities in July 2026. The ICRC warned Gaza's humanitarian response was on the 'verge of total collapse' after Israel blocked aid deliveries starting 2 March 2026 following the ceasefire collapse.",
    accent: "clay" as const,
    sourceIds: ["ocha-opt-2026-07-12", "icrc-gaza-collapse-2026-06"],
  },
];

export const keyInstitutions = [
  {
    label: "United Nations bodies",
    title: "UN Agencies & Mechanisms",
    description:
      "OHCHR, OCHA, UNRWA, WFP, WHO, Human Rights Council, and Commissions of Inquiry — each with specific mandates relevant to documentation and humanitarian response. Listing does not imply partnership.",
  },
  {
    label: "Courts and tribunals",
    title: "International Courts",
    description:
      "International Court of Justice (ICJ) and International Criminal Court (ICC) — the principal judicial bodies addressing legal accountability for alleged international crimes. The ICJ has issued three binding provisional measures orders in South Africa v. Israel. The ICC has issued active arrest warrants in the Situation in the State of Palestine.",
  },
  {
    label: "Humanitarian organizations",
    title: "Humanitarian Actors",
    description:
      "ICRC, IFRC, and national Red Cross/Red Crescent societies; major medical and relief organizations operating under humanitarian principles. The ICRC has facilitated the return of 195 hostages, 3,472 detainees, and 360 deceased Palestinians since October 2023. Listing does not imply partnership or endorsement.",
  },
  {
    label: "Documentation groups",
    title: "Documentation & Research",
    description:
      "Human-rights organizations, investigative journalism groups, academic research centres, and OSINT collectives whose public reports may be referenced as sources after verification review. Organisational findings are distinct from judicial determinations.",
  },
];

export const policyPriorities = [
  {
    title: "Humanitarian Access",
    description:
      "Support unimpeded humanitarian access, protection of aid workers, and respect for humanitarian notification systems. Humanitarian access is a legal obligation under IHL, not a discretionary policy choice. The ICRC and UN OCHA have repeatedly called for sustained, unimpeded access to civilian populations in need.",
    accent: "amber" as const,
    sourceIds: ["icrc-gaza-collapse-2026-06", "ocha-opt-2026-07-12"],
  },
  {
    title: "Arms-Transfer Review",
    description:
      "Support lawful review of arms transfers where there is a clear risk of IHL violations, in line with the Arms Trade Treaty (Article 6 and 7) and EU Common Position 2008/944/CFSP. States Parties to the ATT must deny transfers where they would be used in the commission of genocide, crimes against humanity, or war crimes.",
    accent: "clay" as const,
    sourceIds: ["arms-trade-treaty", "eu-common-position-2008-944"],
  },
  {
    title: "Diplomatic Pressure",
    description:
      "Support diplomatic engagement, restrictive measures, and multilateral accountability mechanisms through lawful, public channels. Over twenty states have filed interventions in the ICJ Genocide Convention case, demonstrating the range of lawful diplomatic action available to states.",
    accent: "blue" as const,
    sourceIds: ["icj-interventions-2025-2026"],
  },
  {
    title: "Legal Accountability",
    description:
      "Support ICC cooperation, universal jurisdiction cases, and domestic legal processes that advance accountability for international crimes. ICC arrest warrants are binding on all 125 States Parties. States Parties have a legal duty to cooperate with the Court and execute arrest warrants on their territory.",
    accent: "clay" as const,
    sourceIds: ["icc-arrest-warrants-2024-11", "icc-palestine-2024"],
  },
];

export const sourceCategories = [
  {
    title: "Court & Legal Records",
    description:
      "ICJ orders and judgments, ICC filings and warrants, national court decisions, and tribunal records. These carry the highest evidentiary weight in the source hierarchy. Currently includes ICJ provisional measures orders, ICC arrest warrant records, and Belgium's ICJ intervention declaration.",
  },
  {
    title: "UN & International Body Documents",
    description:
      "Security Council resolutions, General Assembly records, Human Rights Council reports, Commission of Inquiry findings, and OCHA humanitarian updates. The UN COI's June 2026 children report and OCHA's July 2026 situation reports are among the most current sources referenced.",
  },
  {
    title: "Humanitarian Organization Reports",
    description:
      "Public reporting from ICRC, UNRWA, WHO, WFP, MSF, and other established humanitarian organizations operating under international mandates. ICRC operational updates from January and June 2026 document ceasefire operations and the subsequent aid collapse.",
  },
  {
    title: "Human-Rights Organization Findings",
    description:
      "Published reports and legal analyses from established human-rights organizations. Reviewed for methodology, sourcing, and consistency before platform use. Organisational findings are distinct from judicial determinations.",
  },
  {
    title: "Investigative Journalism",
    description:
      "Open-source investigations, forensic reporting, and verified journalistic accounts from recognized media and investigative outlets.",
  },
  {
    title: "Academic Research",
    description:
      "Peer-reviewed studies, legal scholarship, and research centre publications relevant to international law, conflict studies, and accountability mechanisms.",
  },
];

/**
 * Key Gaza timeline events — source-linked preview for the dossier.
 * These are a curated subset. The full legal timeline is on the Legal Tracker.
 */
export const gazaTimelinePreview = [
  {
    date: "2023-12-29",
    title: "South Africa files ICJ application alleging Genocide Convention violations",
    sourceIds: ["icj-2024-01-26"],
  },
  {
    date: "2024-01-26",
    title: "ICJ issues first provisional measures order",
    sourceIds: ["icj-2024-01-26"],
  },
  {
    date: "2024-03-28",
    title: "ICJ issues additional provisional measures on humanitarian assistance",
    sourceIds: ["icj-2024-03-28"],
  },
  {
    date: "2024-05-20",
    title: "ICC Prosecutor announces applications for arrest warrants",
    sourceIds: ["icc-palestine-2024"],
  },
  {
    date: "2024-05-24",
    title: "ICJ orders Israel to halt Rafah offensive (third provisional measures order)",
    sourceIds: ["icj-2024-05-24"],
  },
  {
    date: "2024-11-21",
    title: "ICC Pre-Trial Chamber I issues arrest warrants for Netanyahu, Gallant, and Deif",
    sourceIds: ["icc-arrest-warrants-2024-11"],
  },
  {
    date: "2025-02",
    title: "ICC terminates proceedings against Mohammed Deif following confirmation of death",
    sourceIds: ["icc-deif-warrant-cancelled-2025"],
  },
  {
    date: "2025-10",
    title: "Ceasefire agreement enters into effect",
    sourceIds: ["icrc-ceasefire-jan-2026"],
  },
  {
    date: "2025-12-23",
    title: "Belgium files declaration of intervention in ICJ Genocide Convention case",
    sourceIds: ["belgium-icj-intervention-2025"],
  },
  {
    date: "2026-01-29",
    title: "ICRC completes ceasefire-related release and transfer operations",
    sourceIds: ["icrc-ceasefire-jan-2026"],
  },
  {
    date: "2026-03-02",
    title: "Ceasefire collapses; Israel blocks aid deliveries into Gaza",
    sourceIds: ["icrc-gaza-collapse-2026-06"],
  },
  {
    date: "2026-03-11",
    title: "Netherlands files declaration of intervention in ICJ Genocide Convention case",
    sourceIds: ["icj-interventions-2025-2026"],
  },
  {
    date: "2026-05-21",
    title: "ICJ fixes time-limits for Reply and Rejoinder — case moves to next written phase",
    sourceIds: ["icj-2026-05-21"],
  },
  {
    date: "2026-06-23",
    title: "UN COI publishes report finding Israel deliberately targeted Palestinian children",
    sourceIds: ["un-coi-2026-children"],
  },
  {
    date: "2026-07-23",
    title: "IPC classifies entire Gaza Strip at IPC Phase 3 (Crisis); 1.4M facing high food insecurity",
    sourceIds: ["ipc-gaza-snapshot-2026-07"],
  },
];

/**
 * Protection categories — groups at heightened risk under IHL.
 * Source-linked where specific documentation exists.
 */
export const protectionCategories = [
  {
    title: "Medical Personnel & Facilities",
    description:
      "IHL grants special protection to medical personnel, facilities, and transports. The ICRC reported in June 2026 that health care in northern Gaza had been 'obliterated.' The UN COI documented systematic attacks on neonatal and maternity care. Medical workers face direct targeting, denial of access, and obstruction — all violations of IHL's special protections for medical services.",
    sourceIds: ["icrc-gaza-collapse-2026-06", "un-coi-2026-children"],
  },
  {
    title: "Humanitarian Workers",
    description:
      "Humanitarian relief personnel must be respected and protected under IHL. UNRWA, ICRC, MSF, and other humanitarian organizations have reported attacks on personnel, facilities, and convoys. In July 2026, armed personnel forcibly entered a food distribution point in Jabalia, halting distributions and assaulting truck drivers. Aid obstruction is a serious IHL violation.",
    sourceIds: ["ocha-opt-2026-07-12", "icrc-gaza-collapse-2026-06"],
  },
  {
    title: "Journalists & Media Workers",
    description:
      "Journalists are civilians and must be protected under IHL. The Committee to Protect Journalists (CPJ) has documented journalist casualties and impediments to reporting. Independent reporting is essential for accountability — attacks on journalists undermine international humanitarian law compliance monitoring.",
    sourceIds: [],
  },
  {
    title: "Children",
    description:
      "Children are entitled to special respect and protection under IHL. The UN COI's June 2026 report found that between October 2023 and October 2025, at least 20,179 Palestinian children were killed and 44,143 injured in Gaza. The Commission found that Israeli authorities deliberately targeted Palestinian children and that acts constitute genocide, crimes against humanity, and war crimes. An estimated 58,054 children lost one or both parents. Gaza now has the highest concentration of child amputees in the world.",
    sourceIds: ["un-coi-2026-children"],
  },
];

/**
 * Lawful action pathways — linked to the Action Hub.
 * These are the routes through which accountability can be pursued
 * through lawful, non-harassing civic engagement.
 */
export const lawfulActionPathways = [
  {
    title: "Contact Elected Representatives",
    description:
      "Ask your MP, MEP, or other elected representative to: (1) support enforcement of ICC arrest warrants; (2) request parliamentary review of arms transfers where there is a clear risk of IHL violations; (3) support sustained humanitarian access and funding; (4) advocate for Belgium's ICJ intervention to be accompanied by concrete diplomatic action.",
    jurisdiction: "Belgium / European Union",
  },
  {
    title: "Support ICC Cooperation",
    description:
      "Urge your government to: (1) publicly confirm it will execute ICC arrest warrants on its territory; (2) oppose any political interference with the Court's independence; (3) support adequate funding for the Court's investigations. States Parties to the Rome Statute have a legal duty to cooperate with the ICC.",
    jurisdiction: "International — all ICC States Parties",
  },
  {
    title: "Request Arms-Transfer Review",
    description:
      "Call on your government to: (1) publish end-use risk assessments for arms exports to parties involved in the conflict; (2) suspend transfers where there is a clear risk of serious IHL violations per the Arms Trade Treaty and EU Common Position; (3) support parliamentary scrutiny of export licensing decisions.",
    jurisdiction: "Belgium / European Union / ATT States Parties",
  },
  {
    title: "Support Humanitarian Funding",
    description:
      "Encourage your government to: (1) maintain and increase funding for UNRWA, OCHA, WFP, ICRC, and other humanitarian actors; (2) advocate for unimpeded humanitarian access as a legal obligation, not a political concession; (3) support the humanitarian notification and deconfliction system.",
    jurisdiction: "International",
  },
  {
    title: "Share Verified Information",
    description:
      "Share the Arbor Sentinel source registry, legal tracker entries, and dossier framework with journalists, researchers, and policymakers. Verified, source-linked public information supports informed advocacy, parliamentary questions, and media coverage grounded in documented facts.",
    jurisdiction: "All",
  },
];
