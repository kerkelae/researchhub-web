import { formatDateStandard } from "~/config/utils/dates";

export type VERIFICATION_STEP =
  | "INTRO_STEP"
  | "DOI_STEP"
  | "AUTHOR_STEP"
  | "EMAIL_SENT_STEP"
  | "ERROR_STEP";

export const ORDERED_VERIFICATION_STEPS: Array<VERIFICATION_STEP> = [
  "INTRO_STEP",
  "DOI_STEP",
  "AUTHOR_STEP",
  "EMAIL_SENT_STEP",
  "ERROR_STEP",
];

export type VerificationPaperResult = {
  id: string;
  title: string;
  publishedDate: string;
  authors: string[];
  doi?: string;
  doiUrl?: string;
  concepts: OpenAlexConcept[];
};

export const parseVerificationPaperResult = (
  raw: any,
  onlyImportantConcepts?: boolean
): VerificationPaperResult => {
  const parsed = {
    title: raw.title,
    id: raw.id,
    publishedDate: formatDateStandard(raw.publication_date, "MMM D, YYYY"),
    authors: raw.authorships.map(
      (authorship) => authorship.author.display_name
    ),
    doiUrl: raw.doi,
    concepts: raw.concepts.map((concept) => parseOpenAlexConcept(concept)),
  };

  if (onlyImportantConcepts) {
    parsed.concepts = parsed.concepts.filter((concept) => concept.level === 1);
    parsed.concepts = parsed.concepts.sort(
      (a, b) => b.relevancyScore - a.relevancyScore
    );
    parsed.concepts = parsed.concepts.slice(0, 3);
  }

  if (parsed.doiUrl) {
    parsed["doi"] = parsed.doiUrl.replace("https://doi.org/", "");
  }

  return parsed;
};

export type OpenAlexProfile = {
  id: string;
  displayName: string;
  institution: OpenAlexInstitution | null;
  summaryStats: OpenAlexSummaryStats;
  works: OpenAlexWork[];
};

export type OpenAlexInstitution = {
  displayName: string;
  id: string;
  countryCode: string;
};

export type OpenAlexConcept = {
  displayName: string;
  level: number;
  relevancyScore: number;
};

export type OpenAlexWork = {
  id: string;
  title: string;
  publishedDate: string;
  authors: string[];
  doi?: string;
  doiUrl?: string;
  concepts: OpenAlexConcept[];
};

export type OpenAlexAuthor = {
  id: string;
  longId: string;
  displayName: string;
  initials: string;
}

export type OpenAlexSummaryStats = {
  hIndex: number;
  i10Index: number;
};

export const parseOpenAlexAuthor = (raw: any): OpenAlexAuthor => {
  // We only want the last part of the ID. e.g. "https://openalex.org/W2561674923"

  const nameParts = raw.display_name.split(" ");
  return {
    id: (raw.id || "").split("/").slice(-1)[0],
    longId: raw.id,
    displayName: raw.display_name,
    initials: (nameParts[0] || "").charAt(0) + (nameParts.length > 0 ? (nameParts[nameParts.length - 1] || "").charAt(0) : ""),
  };
}

export const parseOpenAlexSummaryStats = (raw: any): OpenAlexSummaryStats => {
  return {
    hIndex: raw.h_index,
    i10Index: raw.i10_index,
  };
};

export const parseOpenAlexInstitution = (raw: any): OpenAlexInstitution => {
  return {
    id: raw.id,
    displayName: raw.display_name,
    countryCode: raw.country_code,
  };
};

export const parseOpenAlexConcept = (raw: any): OpenAlexConcept => {
  return {
    displayName: raw.display_name,
    level: raw.level,
    relevancyScore: raw.score,
  };
};

export const parseOpenAlexWork = (
  raw: any,
  onlyImportantConcepts: boolean
): OpenAlexWork => {
  const parsed = {
    title: raw.title,
    id: (raw.id || "").split("/").slice(-1)[0],
    longId: raw.id,
    publishedDate: formatDateStandard(raw.publication_date, "MMM D, YYYY"),
    authors: raw.authorships.map(
      (authorship) => authorship.author.display_name
    ),
    doiUrl: raw.doi,
    concepts: raw.concepts.map((concept) => parseOpenAlexConcept(concept)),
  };

  if (onlyImportantConcepts) {
    parsed.concepts = parsed.concepts.filter((concept) => concept.level === 1);
    parsed.concepts = parsed.concepts.sort(
      (a, b) => b.relevancyScore - a.relevancyScore
    );
    parsed.concepts = parsed.concepts.slice(0, 3);
  }

  if (parsed.doiUrl) {
    parsed["doi"] = parsed.doiUrl.replace("https://doi.org/", "");
  }

  return parsed;
};

export const parseOpenAlexProfile = (raw: any): OpenAlexProfile => {
  return {
    id: raw.id,
    displayName: raw.display_name,
    institution:
      raw.last_known_institution &&
      parseOpenAlexInstitution(raw.last_known_institution),
    summaryStats: parseOpenAlexSummaryStats(raw.summary_stats),
    works: raw.works.map((work) => parseOpenAlexWork(work, true)),
  };
};
