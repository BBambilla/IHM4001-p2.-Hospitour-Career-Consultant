export type JiscLevel = 'Developing' | 'Capable' | 'Proficient';

export interface UserProfile {
  name: string;
  mbti: string;
  leadershipStyle: string;
  careerGoal: string;
  careerReason: string;
}

export interface JiscDigitalAudit {
  digitalProficiency: JiscLevel;
  informationLiteracy: JiscLevel;
  digitalIdentity: JiscLevel;
  digitalProductivity: JiscLevel;
  digitalCollaboration: JiscLevel;
  digitalWellbeing: JiscLevel;
}

export interface CustomSkill {
  id: string;
  label: string;
  desc: string;
  score: number;
  category?: 'Digital' | 'Soft Skill';
}

export interface SoftSkillsAudit {
  organisation: number; // 1-5
  decisionMaking: number;
  planning: number;
  delegation: number;
  motivation: number;
  coaching: number;
  custom: CustomSkill[];
}

export interface SwotSuggestion {
  category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats';
  text: string;
}

export interface SwotAnalysis {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}

export interface GoalFeedback {
  score: number; // 0-100
  isSmart: boolean;
  critique: string;
  suggestions: string;
}

export interface SmartGoal {
  id: string;
  skill: string;
  type: 'Digital' | 'Soft Skill' | 'Strategic';
  activity: string;
  resources: string;
  successCriteria: string;
  targetDate: string;
  rationale: string;
  feedback?: GoalFeedback;
  completed?: boolean;
}

export interface PDPResult {
  introduction: string;
  goals: SmartGoal[];
}

export interface SurveyData {
  q1_easyStart: number; // 1-5
  q2_clearExplanation: string; // Yes/No
  q3_personalized: string; // Yes/No
  q4_usefulSkills: number; // 1-5
  q5_helpfulSwot: string; // Yes/No
  q6_clearGoals: string; // Yes/No
  q7_easyProgress: number; // 1-5
  q8_motivated: string; // Open
  q9_aiFeedbackHelpful: string; // Yes/No
  q10_deviceEasy: string; // Yes/No
  q11_designHelpful: number; // 1-5
  q12_recommend: string; // Open
  q13_feedback: string; // Open
}

export type AppStep = 'profile' | 'digital' | 'softskills' | 'swot' | 'results' | 'survey';