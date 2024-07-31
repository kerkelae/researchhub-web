import {
  AuthorInstitution,
  parseInstitution,
} from "~/components/Institution/lib/types";
import { Hub, parseHub } from "~/config/types/hub";
import {
  AuthorProfile,
  Education,
  ID,
  parseAuthorProfile,
  parseEducation,
} from "~/config/types/root_types";

export type Achievement = "CITED_AUTHOR" | "OPEN_ACCESS" | "EXPERT_PEER_REVIEWER_1" | "EXPERT_PEER_REVIEWER_2" | "EXPERT_PEER_REVIEWER_3" | "EXPERT_PEER_REVIEWER_4" | "EXPERT_PEER_REVIEWER_5" | "HIGHLY_UPVOTED_1" | "HIGHLY_UPVOTED_2" | "HIGHLY_UPVOTED_3" | "HIGHLY_UPVOTED_4" | "HIGHLY_UPVOTED_5";

export type FullAuthorProfile = {
  id: ID;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  hasVerifiedPublications: boolean;
  profileImage?: string;
  headline?: string;
  description?: string;
  openAlexIds: Array<string>;
  institutions: Array<AuthorInstitution>;
  coauthors: Array<AuthorProfile>;
  activityByYear: Array<{
    year: number;
    worksCount: number;
    citationCount: number;
  }>;
  education: Array<Education>;
  achievements: Array<Achievement>;
  openAccessPct: number;
  hIndex: number;
  i10Index: number;
  createdDate: string;
  orcidUrl?: string;
  linkedInUrl?: string;
  googleScholarUrl?: string;
  xUrl?: string;
  userCreatedDate: string;
  summaryStats: {
    worksCount: number;
    citationCount: number;
    twoYearMeanCitedness: number;
    upvotesReceived: number;
  };
  reputation: Reputation | null;
  reputationList: Array<Reputation>;
};

export type Reputation = {
  score: number;
  bins: Array<Array<number>>;
  hub: Hub;
  percentile: number;
};

export const parseReputation = (raw: any): Reputation => {
  const percentile = Math.ceil(raw.percentile * 100);
  return {
    score: raw.score,
    bins: raw.bins,
    hub: parseHub(raw.hub),
    percentile,
  };
};

export const parseReputationList = (raw: any): Array<Reputation> => {
  return raw.map((rep) => parseReputation(rep));
};

export const parseFullAuthorProfile = (raw: any): FullAuthorProfile => {
  const parsed = {
    id: raw.id,
    userCreatedDate: "2024-01-01T00:00:00Z", // FIXME
    hasVerifiedPublications: true, // Temporarily hard-coding this until we decide whether verfication is necessary
    profileImage: raw.profile_image,
    firstName: raw.first_name,
    lastName: raw.last_name,
    url: `/user/${raw.id}/overview`,
    description: raw.description,
    isVerified: raw.is_verified,
    headline: raw?.headline?.title || "",
    isHubEditor: raw.is_hub_editor,
    openAlexIds: raw.openalex_ids || [],
    achievements: raw.achievements || [],
    education: Array.isArray(raw.education)
      ? raw.education.map((edu) => parseEducation(edu))
      : [],
    openAccessPct: Math.round((raw.open_access_pct || 0) * 100),
    hIndex: raw.h_index,
    i10Index: raw.i10_index,
    createdDate: raw.created_date,
    coauthors: raw.coauthors.map((coauthor) => parseAuthorProfile(coauthor)),
    orcidUrl: raw.orcid_id,
    linkedInUrl: raw.linkedin,
    googleScholarUrl: raw.google_scholar,
    xUrl: raw.twitter,    
    summaryStats: {
      worksCount: raw.summary_stats.works_count,
      citationCount: raw.summary_stats.citation_count,
      twoYearMeanCitedness: raw.summary_stats.two_year_mean_citedness,
      upvotesReceived: raw.summary_stats.upvotes_received || 35, // FIXME
    },
    activityByYear: raw.activity_by_year.map((activity) => ({
      year: activity.year,
      worksCount: activity.works_count,
      citationCount: activity.citation_count,
    })),
    institutions: raw.institutions.map((inst) => {
      return {
        id: inst.id,
        institution: parseInstitution(inst.institution),
        years: inst.years,
      };
    }),
    reputation: raw.reputation ? parseReputation(raw.reputation) : null,
    reputationList: parseReputationList(raw.reputation_list),
  };


  // FIXME:  Temporary fix until we have the correct achievements
  if (parsed.achievements.find(a => a.includes("EXPERT_PEER_REVIEWER"))) {
    parsed.achievements = parsed.achievements.filter(a => !a.includes("EXPERT_PEER_REVIEWER"));
    parsed.achievements.push("EXPERT_PEER_REVIEWER_1");
  }

  // FIXME:  Temporary fix until we have the correct achievements
  if (parsed.achievements.find(a => a.includes("HIGHLY_UPVOTED"))) {
    parsed.achievements = parsed.achievements.filter(a => !a.includes("HIGHLY_UPVOTED"));
    parsed.achievements.push("HIGHLY_UPVOTED_1");
  }

  return parsed;
};

// To be used when we do not have any reputation set yet
export const DEMO_BINS: Array<Reputation> = [
  {
    score: 0,
    bins: [
      [0, 1000],
      [1000, 10000],
      [10000, 100000],
      [100000, 1000000],
    ],
    hub: {
      id: null,
      slug: "",
      name: "Biology",
      relevancyScore: 0,
      description: "",
    },
    percentile: 0,
  },
  {
    score: 0,
    bins: [
      [0, 1000],
      [1000, 10000],
      [10000, 100000],
      [100000, 1000000],
    ],
    hub: {
      id: null,
      slug: "",
      name: "Chemistry",
      relevancyScore: 0,
      description: "",
    },
    percentile: 0,
  },
  {
    score: 0,
    bins: [
      [0, 1000],
      [1000, 10000],
      [10000, 100000],
      [100000, 1000000],
    ],
    hub: {
      id: null,
      slug: "",
      name: "Economics",
      relevancyScore: 0,
      description: "",
    },
    percentile: 0,
  },
];
