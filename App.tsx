import React, { useState, useEffect } from 'react';
import { UserProfile, JiscDigitalAudit, SoftSkillsAudit, SwotAnalysis, AppStep, PDPResult, SwotSuggestion, SurveyData, SmartGoal } from './types';
import { StepIndicator } from './components/StepIndicator';
import { ProfileForm } from './components/ProfileForm';
import { AssessmentDigital } from './components/AssessmentDigital';
import { AssessmentSoftSkills } from './components/AssessmentSoftSkills';
import { AssessmentSwot } from './components/AssessmentSwot';
import { PDPView } from './components/PDPView';
import { SurveyForm } from './components/SurveyForm';
import { generatePDP, generateCareerSkills, generateSwotSuggestions } from './services/geminiService';
import { Briefcase } from 'lucide-react';

const STORAGE_KEY = 'hospitour_app_state_v1';

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('profile');
  const [completedSteps, setCompletedSteps] = useState<AppStep[]>(['profile']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    mbti: 'ENFP-T (Campaigner)',
    leadershipStyle: 'Democratic',
    careerGoal: 'Hotel General Manager',
    careerReason: ''
  });

  const [digitalAudit, setDigitalAudit] = useState<JiscDigitalAudit>({
    digitalProficiency: 'Capable',
    informationLiteracy: 'Capable',
    digitalIdentity: 'Developing',
    digitalProductivity: 'Proficient',
    digitalCollaboration: 'Capable',
    digitalWellbeing: 'Developing'
  });

  const [softSkills, setSoftSkills] = useState<SoftSkillsAudit>({
    organisation: 3,
    decisionMaking: 3,
    planning: 3,
    delegation: 2,
    motivation: 3,
    coaching: 2,
    custom: [] // Dynamic skills
  });

  const [swot, setSwot] = useState<SwotAnalysis>({
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: ''
  });

  const [pdpResult, setPdpResult] = useState<PDPResult | null>(null);
  const [surveyResult, setSurveyResult] = useState<SurveyData | null>(null);

  // Load state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.digitalAudit) setDigitalAudit(parsed.digitalAudit);
        if (parsed.softSkills) setSoftSkills(parsed.softSkills);
        if (parsed.swot) setSwot(parsed.swot);
        if (parsed.pdpResult) setPdpResult(parsed.pdpResult);
        if (parsed.completedSteps) setCompletedSteps(parsed.completedSteps);
        // Note: We generally don't restore currentStep to 'results' or 'survey' blindly to avoid confusion, 
        // but restoring progress is key.
        if (parsed.completedSteps.includes('results') && parsed.pdpResult) {
            setCurrentStep('results');
        }
      } catch (e) {
        console.error("Failed to load save state", e);
      }
    }
  }, []);

  // Save state to local storage on change
  useEffect(() => {
    const stateToSave = {
      profile,
      digitalAudit,
      softSkills,
      swot,
      pdpResult,
      completedSteps
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [profile, digitalAudit, softSkills, swot, pdpResult, completedSteps]);

  const advanceStep = (next: AppStep) => {
    if (!completedSteps.includes(next)) {
      setCompletedSteps([...completedSteps, next]);
    }
    setCurrentStep(next);
    window.scrollTo(0, 0);
  };

  const handleProfileNext = async () => {
    // Start generating skills in background when user moves from Profile -> Digital
    if (profile.careerGoal && softSkills.custom.length === 0) {
        generateCareerSkills(profile.careerGoal).then(skills => {
            setSoftSkills(prev => ({
                ...prev,
                custom: skills.map(s => ({ ...s, score: 3 })) // Default score 3
            }));
        }).catch(err => console.error("Failed to fetch skills", err));
    }
    advanceStep('digital');
  };

  const handleSwotSuggestion = async (): Promise<SwotSuggestion[]> => {
    return await generateSwotSuggestions(profile, digitalAudit, softSkills);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generatePDP(profile, digitalAudit, softSkills, swot);
      
      // Assign IDs to goals for the interactive list
      const goalsWithIds = (result.goals || []).map(g => ({
        ...g,
        id: Math.random().toString(36).substring(2, 9),
        completed: false
      }));

      setPdpResult({ ...result, goals: goalsWithIds });
      advanceStep('results');
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Failed to generate plan.";
      setError(`${errorMessage} Please ensure you have a valid API Key setup in Vercel settings.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePDPSave = (updatedGoals: SmartGoal[]) => {
      if (pdpResult) {
          setPdpResult({ ...pdpResult, goals: updatedGoals });
      }
  };

  const handlePDPFinish = (finalGoals: SmartGoal[]) => {
      if (pdpResult) {
        setPdpResult({ ...pdpResult, goals: finalGoals });
      }
      advanceStep('survey');
  };

  const exportToWord = (surveyData: SurveyData) => {
    if (!pdpResult) return;
    
    const formatText = (text: string) => text ? text.replace(/\n/g, '<br/>') : '<em>Not provided</em>';

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>PDP Report</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.5; color: #333; }
          h1 { color: #003359; font-size: 24pt; border-bottom: 2px solid #4ABfac; padding-bottom: 10px; }
          h2 { color: #003359; font-size: 18pt; margin-top: 20px; background-color: #EAF2F5; padding: 5px; }
          h3 { color: #4ABfac; font-size: 14pt; margin-top: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .highlight { color: #FDB714; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Personal Development Plan</h1>
        <p><strong>Generated for:</strong> ${profile.name}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h2>1. Professional Profile</h2>
        <p><strong>Career Goal:</strong> ${profile.careerGoal}</p>
        <p><strong>Motivation:</strong> ${profile.careerReason}</p>
        <p><strong>MBTI Type:</strong> ${profile.mbti}</p>
        <p><strong>Leadership Style:</strong> ${profile.leadershipStyle}</p>

        <h2>2. Digital Capability Audit (JISC)</h2>
        <ul>
          <li>Digital Proficiency: ${digitalAudit.digitalProficiency}</li>
          <li>Information Literacy: ${digitalAudit.informationLiteracy}</li>
          <li>Digital Identity: ${digitalAudit.digitalIdentity}</li>
          <li>Digital Productivity: ${digitalAudit.digitalProductivity}</li>
          <li>Digital Collaboration: ${digitalAudit.digitalCollaboration}</li>
          <li>Digital Wellbeing: ${digitalAudit.digitalWellbeing}</li>
        </ul>

        <h2>3. Soft Skills Audit (1-5 Scale)</h2>
        <ul>
          <li>Organisation: ${softSkills.organisation}</li>
          <li>Decision Making: ${softSkills.decisionMaking}</li>
          <li>Planning: ${softSkills.planning}</li>
          <li>Delegation: ${softSkills.delegation}</li>
          <li>Motivation: ${softSkills.motivation}</li>
          <li>Coaching: ${softSkills.coaching}</li>
        </ul>
        <h3>Recommended Specialized Skills</h3>
        <ul>
          ${softSkills.custom.map(s => `<li><strong>${s.label}</strong> (${s.category || 'Skill'}): ${s.score}/5 <br/><em>Why: ${s.desc}</em></li>`).join('')}
        </ul>

        <h2>4. SWOT Analysis</h2>
        <h3>Strengths (Internal)</h3>
        <p>${formatText(swot.strengths)}</p>
        <h3>Weaknesses (Internal)</h3>
        <p>${formatText(swot.weaknesses)}</p>
        <h3>Opportunities (External)</h3>
        <p>${formatText(swot.opportunities)}</p>
        <h3>Threats (External)</h3>
        <p>${formatText(swot.threats)}</p>

        <h2>5. SMART Action Plan</h2>
        ${pdpResult.goals.map(g => `
          <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 15px; border-radius: 5px;">
            <h3>${g.skill} (${g.type})</h3>
            <p><strong>Status:</strong> ${g.completed ? 'Complete' : 'Pending'}</p>
            <p><strong>Activity:</strong> ${g.activity}</p>
            <p><strong>Rationale:</strong> ${g.rationale}</p>
            <p><strong>Resources:</strong> ${g.resources}</p>
            <p><strong>Success Criteria:</strong> ${g.successCriteria}</p>
            <p><strong>Target Date:</strong> ${g.targetDate}</p>
            ${g.feedback ? `<p style="font-style:italic; color:#666;">AI Coach Feedback: ${g.feedback.critique} (Score: ${g.feedback.score})</p>` : ''}
          </div>
        `).join('')}

        <h2>6. Feedback Survey Responses</h2>
        <table>
          <tr><th>Question</th><th>Response</th></tr>
          <tr><td>Easy to Start</td><td>${surveyData.q1_easyStart}/5</td></tr>
          <tr><td>Clear Explanation</td><td>${surveyData.q2_clearExplanation}</td></tr>
          <tr><td>Personalized</td><td>${surveyData.q3_personalized}</td></tr>
          <tr><td>Useful Skills</td><td>${surveyData.q4_usefulSkills}/5</td></tr>
          <tr><td>Helpful SWOT</td><td>${surveyData.q5_helpfulSwot}</td></tr>
          <tr><td>Clear Goals</td><td>${surveyData.q6_clearGoals}</td></tr>
          <tr><td>Easy Progress</td><td>${surveyData.q7_easyProgress}/5</td></tr>
          <tr><td>Motivated</td><td>${surveyData.q8_motivated}</td></tr>
          <tr><td>AI Feedback Helpful</td><td>${surveyData.q9_aiFeedbackHelpful}</td></tr>
          <tr><td>Device Easy</td><td>${surveyData.q10_deviceEasy}</td></tr>
          <tr><td>Design Helpful</td><td>${surveyData.q11_designHelpful}/5</td></tr>
          <tr><td>Recommend</td><td>${surveyData.q12_recommend}</td></tr>
          <tr><td>Comments</td><td>${surveyData.q13_feedback}</td></tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Hospitour_PDP_${profile.name.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSurveySubmit = (data: SurveyData) => {
    setSurveyResult(data);
    exportToWord(data);
  };

  const resetApp = () => {
    if(confirm("Are you sure? This will erase all current progress.")) {
        localStorage.removeItem(STORAGE_KEY);
        setCurrentStep('profile');
        setCompletedSteps(['profile']);
        setPdpResult(null);
        setSwot({ strengths: '', weaknesses: '', opportunities: '', threats: '' });
        setSoftSkills(prev => ({ ...prev, custom: [] }));
        setProfile({
            name: '',
            mbti: 'ENFP-T (Campaigner)',
            leadershipStyle: 'Democratic',
            careerGoal: 'Hotel General Manager',
            careerReason: ''
        });
        setDigitalAudit({
            digitalProficiency: 'Capable',
            informationLiteracy: 'Capable',
            digitalIdentity: 'Developing',
            digitalProductivity: 'Proficient',
            digitalCollaboration: 'Capable',
            digitalWellbeing: 'Developing'
        });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-arden-grey">
      
      {/* Header */}
      <header className="bg-arden-navy border-b border-arden-teal/30 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-arden-teal p-2.5 rounded-xl text-arden-navy shadow-lg">
                <Briefcase size={28} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white font-serif">
              Hospitour <span className="text-arden-teal">Career Consultant</span>
            </span>
          </div>
          <div className="text-base text-arden-bluegrey hidden md:block opacity-90 font-medium">
            {profile.name ? `Session: ${profile.name}` : 'PDP Generator'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-arden-bluegrey">
        <div className="max-w-6xl mx-auto px-6 pb-16">
          
          <StepIndicator 
            currentStep={currentStep} 
            setStep={setCurrentStep} 
            completedSteps={completedSteps} 
          />

          {error && (
            <div className="max-w-2xl mx-auto mb-8 bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 text-center text-lg">
              {error}
            </div>
          )}

          <div className="animate-fade-in">
            {currentStep === 'profile' && (
              <ProfileForm 
                data={profile} 
                onChange={setProfile} 
                onNext={handleProfileNext} 
              />
            )}

            {currentStep === 'digital' && (
              <AssessmentDigital 
                data={digitalAudit} 
                onChange={setDigitalAudit} 
                onNext={() => advanceStep('softskills')}
                onBack={() => setCurrentStep('profile')}
              />
            )}

            {currentStep === 'softskills' && (
              <AssessmentSoftSkills 
                data={softSkills} 
                onChange={setSoftSkills} 
                onNext={() => advanceStep('swot')}
                onBack={() => setCurrentStep('digital')}
              />
            )}

            {currentStep === 'swot' && (
              <AssessmentSwot 
                data={swot} 
                onChange={setSwot} 
                onGenerate={handleGenerate}
                onBack={() => setCurrentStep('softskills')}
                isGenerating={isGenerating}
                onGenerateSuggestions={handleSwotSuggestion}
              />
            )}

            {currentStep === 'results' && pdpResult && (
              <PDPView 
                result={pdpResult} 
                profile={profile}
                digital={digitalAudit}
                soft={softSkills}
                swot={swot}
                onReset={resetApp}
                onSave={handlePDPSave}
                onFinish={handlePDPFinish}
              />
            )}

            {currentStep === 'survey' && (
                <SurveyForm onSubmit={handleSurveySubmit} />
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-arden-teal/20 py-10 text-center text-arden-grey/60">
        <p>© {new Date().getFullYear()} Hospitour Career Consultant. Powered by Gemini AI.</p>
      </footer>
    </div>
  );
}