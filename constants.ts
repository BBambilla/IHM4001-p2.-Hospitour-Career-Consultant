import { JiscLevel } from "./types";

export const MBTI_TYPES = [
  // Analysts
  "INTJ-A (Architect)", "INTJ-T (Architect)",
  "INTP-A (Logician)", "INTP-T (Logician)",
  "ENTJ-A (Commander)", "ENTJ-T (Commander)",
  "ENTP-A (Debater)", "ENTP-T (Debater)",
  // Diplomats
  "INFJ-A (Advocate)", "INFJ-T (Advocate)",
  "INFP-A (Mediator)", "INFP-T (Mediator)",
  "ENFJ-A (Protagonist)", "ENFJ-T (Protagonist)",
  "ENFP-A (Campaigner)", "ENFP-T (Campaigner)",
  // Sentinels
  "ISTJ-A (Logistician)", "ISTJ-T (Logistician)",
  "ISFJ-A (Defender)", "ISFJ-T (Defender)",
  "ESTJ-A (Executive)", "ESTJ-T (Executive)",
  "ESFJ-A (Consul)", "ESFJ-T (Consul)",
  // Explorers
  "ISTP-A (Virtuoso)", "ISTP-T (Virtuoso)",
  "ISFP-A (Adventurer)", "ISFP-T (Adventurer)",
  "ESTP-A (Entrepreneur)", "ESTP-T (Entrepreneur)",
  "ESFP-A (Entertainer)", "ESFP-T (Entertainer)"
];

export const LEADERSHIP_STYLES = [
  "Democratic",
  "Authoritative",
  "Coaching",
  "Pacesetting",
  "Affiliative",
  "Coercive"
];

export const JISC_LEVELS: JiscLevel[] = ["Developing", "Capable", "Proficient"];

export const JISC_LEVEL_VALUES: Record<JiscLevel, number> = {
  "Developing": 1,
  "Capable": 2,
  "Proficient": 3
};

export const MOCK_PDP_RESULT = {
  introduction: "Based on your MBTI type of ENFP-T (Campaigner) and your goal to become a Hotel General Manager, we need to focus on structure and delegation.",
  goals: [
    {
      skill: "Delegation",
      type: "Soft Skill",
      activity: "Delegate 2 tasks per week using a tracking sheet.",
      resources: "Mindtools Delegation Guide",
      successCriteria: "Team completes project early.",
      targetDate: "3 Months",
      rationale: "You scored low on delegation but it is critical for GMs."
    }
  ]
};