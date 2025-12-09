import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, JiscDigitalAudit, SoftSkillsAudit, SwotAnalysis, PDPResult, CustomSkill, SwotSuggestion, SmartGoal, GoalFeedback } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to validate API Key
const checkApiKey = () => {
    if (!apiKey) throw new Error("API Key not found");
};

export const generateCareerSkills = async (careerGoal: string): Promise<Omit<CustomSkill, 'score'>[]> => {
  checkApiKey();
  const prompt = `
    Career Goal: "${careerGoal}".
    Generate a list of exactly 4 critical skills:
    1. 2 DIGITAL skills (Specific software, platforms, or technical analytics tools).
    2. 2 SOFT skills (Exclude: Organisation, Decision Making, Planning, Delegation, Motivation, Coaching).
    
    Keep descriptions concise (max 1 sentence).
    
    Return a JSON array: [{ id: "snake_case", label: "Title", desc: "Short reason", category: "Digital" | "Soft Skill" }]
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        label: { type: Type.STRING },
                        desc: { type: Type.STRING },
                        category: { type: Type.STRING, enum: ['Digital', 'Soft Skill'] }
                    }
                }
            }
        }
    });
    const text = response.text;
    if (!text) return [];
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error generating skills:", error);
    return [];
  }
};

export const generateSwotSuggestions = async (
    profile: UserProfile,
    digital: JiscDigitalAudit,
    soft: SoftSkillsAudit
): Promise<SwotSuggestion[]> => {
    checkApiKey();
    const prompt = `
    Generate SWOT analysis suggestions based on the user's profile and audit results.
    
    Profile: ${profile.mbti}, ${profile.leadershipStyle} Leader. Goal: ${profile.careerGoal}.
    
    Digital Audit Gaps (if any):
    - Identity: ${digital.digitalIdentity}
    - Wellbeing: ${digital.digitalWellbeing}
    - Proficiency: ${digital.digitalProficiency}
    
    Soft Skills (Low scores):
    ${Object.entries(soft).filter(([k, v]) => typeof v === 'number' && v < 3).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
    
    Soft Skills (High scores):
    ${Object.entries(soft).filter(([k, v]) => typeof v === 'number' && v > 3).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

    Generate 2 suggestions for EACH quadrant (Strengths, Weaknesses, Opportunities, Threats).
    'Opportunities' and 'Threats' should relate to the hospitality industry trends relevant to their goal.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            category: { type: Type.STRING, enum: ['strengths', 'weaknesses', 'opportunities', 'threats'] },
                            text: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const text = response.text;
        if (!text) return [];
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Error generating SWOT suggestions:", error);
        return [];
    }
};

export const evaluateGoal = async (goal: SmartGoal): Promise<GoalFeedback> => {
    checkApiKey();
    const prompt = `
    Evaluate the following Personal Development Objective against SMART criteria (Specific, Measurable, Achievable, Realistic, Time-bound).
    
    Goal Details:
    - Skill to Improve: ${goal.skill}
    - Planned Activity: ${goal.activity}
    - Resources Needed: ${goal.resources}
    - Success Criteria: ${goal.successCriteria}
    - Target Date: ${goal.targetDate}
    
    Provide constructive feedback.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "Quality score 0-100" },
                        isSmart: { type: Type.BOOLEAN },
                        critique: { type: Type.STRING, description: "What is good or bad about this goal?" },
                        suggestions: { type: Type.STRING, description: "Specific improvements to make it SMARTer." }
                    }
                }
            }
        });
        const text = response.text;
        if (!text) throw new Error("No feedback generated");
        return JSON.parse(text);
    } catch (error) {
        console.error("Error evaluating goal:", error);
        return {
            score: 0,
            isSmart: false,
            critique: "Error connecting to AI consultant.",
            suggestions: "Please try again."
        };
    }
};

export const evaluateActionPlan = async (goals: SmartGoal[]): Promise<string> => {
    checkApiKey();
    
    // Create a concise text summary of the goals
    const goalsSummary = goals.map((g, i) => `${i + 1}. ${g.skill}: ${g.activity} (Due: ${g.targetDate})`).join('\n');

    const prompt = `
    Act as a supportive Career Coach. Review the following Personal Development Objectives:
    ${goalsSummary}

    Provide a single, concise paragraph (approx 50 words) of feedback.
    1. Acknowledge the effort.
    2. Comment on the overall quality (are they SMART?).
    3. Suggest one general improvement tip to help the user achieve these goals.
    
    Keep the tone encouraging and professional. Do not return JSON. Return plain text only.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            // No schema needed for plain text
        });

        const text = response.text;
        if (!text) return "Great start on your objectives! Ensure they are specific and time-bound to stay on track.";
        
        return text;
    } catch (error) {
        console.error("Error evaluating action plan:", error);
        return "Unable to generate feedback at this time. Focus on making your goals Specific and Measurable.";
    }
};

export const generatePDP = async (
  profile: UserProfile,
  digital: JiscDigitalAudit,
  soft: SoftSkillsAudit,
  swot: SwotAnalysis
): Promise<PDPResult> => {
  checkApiKey();

  // Include custom skills in the prompt with category and description context
  const customSkillsText = soft.custom && Array.isArray(soft.custom) 
    ? soft.custom.map(s => `- ${s.label} (${s.category || 'Skill'}): ${s.score}/5. Context: ${s.desc}`).join('\n') 
    : '';

  const prompt = `
    Act as a World-Class Hospitality & Tourism Career Consultant.
    
    User Profile:
    - Name: ${profile.name}
    - Career Goal (5 Years): ${profile.careerGoal}
    - MBTI: ${profile.mbti}
    - Leadership Style: ${profile.leadershipStyle}

    JISC Digital Capability Audit (Developing/Capable/Proficient):
    - Digital Proficiency: ${digital.digitalProficiency}
    - Information Literacy: ${digital.informationLiteracy}
    - Digital Identity: ${digital.digitalIdentity}
    - Digital Productivity: ${digital.digitalProductivity}
    - Digital Collaboration: ${digital.digitalCollaboration}
    - Digital Wellbeing: ${digital.digitalWellbeing}

    Soft Skills Audit (1-5 Scale):
    - Organisation: ${soft.organisation}
    - Decision Making: ${soft.decisionMaking}
    - Planning: ${soft.planning}
    - Delegation: ${soft.delegation}
    - Motivation: ${soft.motivation}
    - Coaching: ${soft.coaching}
    
    Specialized Skills for Goal (and user self-rating):
    ${customSkillsText}

    SWOT Analysis:
    - Strengths: ${swot.strengths}
    - Weaknesses: ${swot.weaknesses}
    - Opportunities: ${swot.opportunities}
    - Threats: ${swot.threats}

    Task:
    Develop a Personal Development Plan (PDP). 
    1. Write a short strategic introduction analyzing the "Strategic Link" between their personality, gaps, and SWOT.
    2. Generate EXACTLY 5 SMART (Specific, Measurable, Achievable, Realistic, Time-bound) objectives.
    
    CRITICAL INSTRUCTION:
    At least 1-2 objectives MUST be based on the Digital Audit. When creating a Digital Objective, you MUST use one of the specific JISC category names provided above (e.g., "Information Literacy", "Digital Identity") as the 'skill' name.
    
    Ensure the goals address the specific weaknesses identified in the audits that pose a risk based on the 'Threats' or block 'Opportunities'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            introduction: { type: Type.STRING },
            goals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["Digital", "Soft Skill", "Strategic"] },
                  activity: { type: Type.STRING, description: "The Action Plan" },
                  resources: { type: Type.STRING },
                  successCriteria: { type: Type.STRING },
                  targetDate: { type: Type.STRING },
                  rationale: { type: Type.STRING, description: "Link to SWOT/Audit" }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as PDPResult;

  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};