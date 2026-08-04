# Translation Review Policy

**Status:** Active — governs how content is translated and reviewed.  
**Last reviewed:** 2026-07-12

---

## Purpose

Accountability Atlas publishes in English during the public static beta.
When translations into additional languages are introduced, this policy
defines the standards, workflow, and review requirements.

---

## Current state

During the public static beta:

- **The platform is published in English only.**
- No translations have been produced or published.
- The translation infrastructure (language-selector UI, translated data
  files, translation-review workflow) does not yet exist.
- This policy defines the standards that will apply when translations are
  introduced.

---

## Languages

Translations will be prioritised for languages relevant to the regions
covered by the platform. The initial priority list (subject to contributor
availability):

1. **Arabic** — primary language of several countries covered by the Gaza
   dossier and regional crisis documentation
2. **Hebrew** — relevant to documentation concerning Israel and the occupied
   Palestinian territory
3. **French** — official language of Belgium, relevant to EU institutional
   content, and widely spoken in humanitarian and legal sectors
4. **Dutch** — official language of Belgium and the Netherlands, relevant
   to country and EU content

Additional languages will be added as contributor capacity allows.

---

## Translation standards

### Required quality

- Translations must accurately convey the meaning of the source text.
- Legal terminology must use the correct terms in the target language.
- Institutional names must use the official or widely-accepted translation
  where one exists.
- Cultural context must be considered — a direct word-for-word translation
  that is misleading in the target language is not acceptable.
- The tone must match the platform's editorial standards: careful, calm,
  non-dehumanizing, and institutionally precise.

### Machine translation

- Machine translation (Google Translate, DeepL, etc.) **may be used for
  initial drafts only**.
- A human translation reviewer must review and approve every machine-
  translated text before publication.
- Machine-translated text that has not been human-reviewed must not be
  published.
- The use of machine translation in preparing a draft should be recorded in
  the translation metadata.

### AI translation tools

- AI-assisted translation (LLM-based tools) is treated the same as machine
  translation: useful for drafts, must be human-reviewed.
- AI output is never sufficient for final legal, editorial, or translation
  review.
- The `reviewedByRole` field must reflect the human reviewer, not the AI
  tool.

---

## Translation workflow

```
Source text published in English
  → Translation request created
  → Translator produces draft (human or machine-assisted)
  → Translation reviewer checks accuracy, tone, terminology
  → Editor reviews translated text for consistency
  → Competency reviewer checks domain-specific terms (if applicable)
  → Translation published with language label, date, and credit
```

---

## Required metadata for translations

Every published translation must include:

| Field | Description |
|---|---|
| `language` | ISO 639-1 code (e.g. `ar`, `he`, `fr`, `nl`) |
| `translationDate` | Date the translation was completed |
| `translatorCredit` | Name or role of the translator (if they consent to being credited) |
| `translationReviewer` | Role of the person who reviewed the translation |
| `sourceVersion` | The version number of the source record this translation is based on |
| `machineAssisted` | Whether machine translation was used in the draft |

---

## Review requirements

| Content type | Required reviews for translation |
|---|---|
| Evidence record | Translation reviewer + editor |
| Legal case summary | Translation reviewer + editor + legal reviewer (for terminology) |
| Country/institution content | Translation reviewer + editor + competency reviewer |
| Organization listing | Translation reviewer + editor |
| Action template | Translation reviewer + editor + legal reviewer (if template has legal implications) |
| Trust/policy page | Translation reviewer + editor |
| Methodology | Translation reviewer + editor + legal reviewer |

---

## Corrections to translations

- If the source (English) text is corrected, all published translations
  must be updated to reflect the correction.
- If a translation is found to contain errors independent of the source
  text, it follows the same correction process as English content.
- Corrections to translations are noted in the same way as corrections to
  original content.

---

## Authoritative text

- The **English version** is the authoritative text for all content.
- Where a translation differs from the English source in a substantive way,
  the English version controls until the translation is reviewed and
  aligned.
- This is stated on every translated page.

---

## Right of reply — translations

- An institution's right of reply extends to translations. If an
  institution identifies an error in a translation, the same review and
  correction process applies.
- Translations of an institution's own statements (e.g., a government
  statement originally published in French and translated to English by the
  platform) must be reviewed with particular care. The original-language
  version is the authoritative source.

---

## Reviewer qualifications

A **translation reviewer** must:

- Demonstrate fluency in both the source language (English) and the target
  language
- Have familiarity with the subject matter (legal, humanitarian,
  institutional) sufficient to assess terminology accuracy
- Not be the same person who produced the draft (if the draft was produced
  by a human translator)

---

## Static-beta limitations

- No translations have been produced.
- No translation-review infrastructure exists.
- No language-selector UI exists.
- The priority language list is a planning document, not a commitment.
- Translation will begin when at least one qualified translation reviewer
  is available for the target language and the English source content is
  stable enough to translate.
