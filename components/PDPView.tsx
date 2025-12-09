import React, { useState } from 'react';
import { PDPResult, JiscDigitalAudit, SoftSkillsAudit, UserProfile, SmartGoal, SwotAnalysis } from '../types';
import { evaluateActionPlan } from '../services/geminiService';
import { Plus, Trash2, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Sparkles, Share2, Star, TrendingUp, Heart, Target, Briefcase, Award, Save, ArrowRight, Circle, BadgePlus } from 'lucide-react';

interface Props {
  result: PDPResult;
  profile: UserProfile;
  digital: JiscDigitalAudit;
  soft: SoftSkillsAudit;
  swot: SwotAnalysis;
  onReset: () => void;
  onSave: (goals: SmartGoal[]) => void;
  onFinish: (goals: SmartGoal[]) => void;
}

export const PDPView: React.FC<Props> = ({ result, profile, digital, soft, swot, onReset, onSave, onFinish }) => {
  const [goals, setGoals] = useState<SmartGoal[]>(result.goals || []);
  const [expandedId, setExpandedId] = useState<string | null>(goals[0]?.id || null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [expertFeedback, setExpertFeedback] = useState<string | null>(null);

  // Derive Strengths and Improvements for the Dashboard
  const strengthList: string[] = [];
  const improvementList: string[] = [];

  // 1. Profile Assets (Requested: Leadership, MBTI)
  strengthList.push(`${profile.mbti}`);
  strengthList.push(`${profile.leadershipStyle} Leader`);
  
  // 2. Soft Skills Logic (High scores)
  Object.entries(soft).forEach(([key, value]) => {
    if (key === 'custom') return;
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    if (typeof value === 'number' && value >= 4) strengthList.push(label);
    if (typeof value === 'number' && value <= 2) improvementList.push(label);
  });
  // Custom Skills
  soft.custom.forEach(s => {
    if (s.score >= 4) strengthList.push(s.label);
    if (s.score <= 3) improvementList.push(s.label);
  });

  // 3. Digital Logic
  Object.entries(digital).forEach(([key, value]) => {
    const label = key.replace('digital', '').replace(/([A-Z])/g, ' $1').trim();
    if (value === 'Proficient') strengthList.push(`Digital ${label}`);
    if (value === 'Developing') improvementList.push(`Digital ${label}`);
  });

  // 4. SWOT Snippets (Extract meaningful keywords/short phrases)
  const extractSwotPoints = (text: string): string[] => {
    if (!text) return [];
    return text.split('\n')
      .map(line => line.replace(/^[-*•]\s*/, '').trim()) // Remove bullets
      .filter(line => line.length > 0)
      .slice(0, 3) // Take up to 3 points
      .map(line => line.length > 30 ? line.substring(0, 30) + '...' : line); // Truncate
  };

  const strSwot = extractSwotPoints(swot.strengths);
  const weakSwot = extractSwotPoints(swot.weaknesses);
  
  // Add SWOT points if they aren't duplicates of what we already have (simple check)
  strSwot.forEach(s => {
     if (!strengthList.some(exist => exist.includes(s) || s.includes(exist))) {
         strengthList.push(s);
     }
  });
  weakSwot.forEach(s => {
    if (!improvementList.some(exist => exist.includes(s) || s.includes(exist))) {
        improvementList.push(s);
    }
  });

  // Stats
  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const progressPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const updateGoal = (id: string, field: keyof SmartGoal, value: string) => {
    const updatedGoals = goals.map(g => g.id === id ? { ...g, [field]: value } : g);
    setGoals(updatedGoals);
  };

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedGoals = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    setGoals(updatedGoals);
    onSave(updatedGoals); // Auto-save on toggle
  };

  const addNewGoal = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    const newGoal: SmartGoal = {
        id: newId,
        skill: "New Objective",
        type: "Soft Skill",
        activity: "",
        resources: "",
        successCriteria: "",
        targetDate: "1 Month",
        rationale: "Self-identified development need",
        completed: false
    };
    setGoals([...goals, newGoal]);
    setExpandedId(newId);
  };

  const handleSaveAndAdd = () => {
      // Logic: Save is implicit via state, so we just add a new one and switch focus
      onSave(goals);
      addNewGoal();
  };

  const deleteGoal = (id: string) => {
    if (confirm("Are you sure you want to delete this objective?")) {
        setGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleBatchEvaluate = async () => {
    setIsAnalysing(true);
    try {
        const feedback = await evaluateActionPlan(goals);
        setExpertFeedback(feedback);
        
        // Scroll to feedback section
        setTimeout(() => {
            const feedbackSection = document.getElementById('expert-feedback-section');
            if (feedbackSection) feedbackSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } catch (e) {
        console.error(e);
        alert("Unable to generate feedback at this time. Please try again.");
    } finally {
        setIsAnalysing(false);
    }
  };

  const handleManualSave = () => {
      onSave(goals);
      alert("Progress saved!");
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* Visual Planner Dashboard */}
      <div className="bg-[#FFF0E6] p-8 md:p-12 rounded-[2.5rem] mb-16 shadow-xl border border-arden-teal/10 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-arden-yellow/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

        <div className="text-center mb-12 relative z-10">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-arden-navy mb-4 tracking-tight">My Career Vision</h1>
            <p className="text-arden-grey font-medium text-xl">Strategizing for success: <span className="font-serif italic text-arden-teal text-2xl">{profile.name}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            
            {/* Box 1: Dream Career */}
            <div className="bg-white border-4 border-arden-navy rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,51,89,1)] flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="bg-arden-bluegrey p-4 rounded-full mb-6">
                    <Target className="text-arden-navy" size={32} />
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">My Destination</h3>
                <p className="font-serif text-3xl md:text-4xl font-bold text-arden-teal leading-tight">{profile.careerGoal}</p>
            </div>

            {/* Box 2: Motivation */}
             <div className="bg-white border-4 border-arden-navy rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,51,89,1)] flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="bg-red-50 p-4 rounded-full mb-6">
                    <Heart className="text-red-400 fill-current" size={32} />
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">My "Why"</h3>
                <p className="font-serif text-2xl text-arden-navy italic leading-relaxed">
                    "{profile.careerReason || 'To create unforgettable experiences.'}"
                </p>
            </div>

            {/* Box 3: Assets & Strengths */}
            <div className="bg-white border-4 border-arden-navy rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,51,89,1)] group hover:-translate-y-1 transition-transform duration-300 md:col-span-2 lg:col-span-1">
                 <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                    <div className="bg-arden-yellow/20 p-2 rounded-lg">
                        <Award className="text-arden-yellow fill-current" size={24} />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-arden-navy">My Key Assets</h3>
                 </div>
                 
                 <div className="flex flex-wrap gap-2">
                    {strengthList.slice(0, 8).map((item, idx) => (
                        <span key={idx} className="bg-arden-bluegrey text-arden-navy px-4 py-2 rounded-lg font-bold text-sm border border-arden-navy/5 flex items-center gap-2">
                           <CheckCircle size={14} className="text-arden-teal" /> {item}
                        </span>
                    ))}
                    {strengthList.length === 0 && <span className="text-gray-400 italic">No specific strengths identified yet.</span>}
                 </div>
            </div>

            {/* Box 4: Room for Improvement */}
            <div className="bg-white border-4 border-arden-navy rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,51,89,1)] group hover:-translate-y-1 transition-transform duration-300 md:col-span-2 lg:col-span-1">
                 <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                    <div className="bg-orange-50 p-2 rounded-lg">
                        <TrendingUp className="text-orange-500" size={24} />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-arden-navy">Focus Areas</h3>
                 </div>

                 <div className="flex flex-wrap gap-2">
                    {improvementList.slice(0, 8).map((item, idx) => (
                        <span key={idx} className="bg-white text-orange-800 px-4 py-2 rounded-lg font-bold text-sm border-2 border-orange-100 flex items-center gap-2">
                            <AlertCircle size={14} className="text-orange-400" /> {item}
                        </span>
                    ))}
                     {improvementList.length === 0 && <span className="text-gray-400 italic">You're doing great! Keep polishing.</span>}
                 </div>
            </div>

        </div>
      </div>

      {/* Action Plan Header with Progress */}
      <div id="action-plan-list" className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 px-2 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-arden-navy font-serif">Action Plan</h2>
            <p className="text-gray-500 mt-1">Input your objectives below. Get feedback once you are done.</p>
        </div>
        <div className="flex items-center gap-3">
             <button 
                onClick={handleManualSave}
                className="flex items-center gap-2 bg-white text-arden-grey px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition border border-gray-200"
            >
                <Save size={18} /> Save Progress
            </button>
            <button 
                onClick={addNewGoal}
                className="flex items-center gap-2 bg-arden-yellow text-arden-navy px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition shadow-md border border-yellow-500"
            >
                <Plus size={18} /> Add Objective
            </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-4 mb-8 overflow-hidden">
        <div 
            className="bg-arden-teal h-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="text-right text-sm font-bold text-arden-teal mb-8">
        {completedGoals} / {totalGoals} Objectives Finalized
      </div>

      <div className="space-y-6">
        {goals.map((goal) => {
            const isExpanded = expandedId === goal.id;
            
            return (
                <div key={goal.id} className={`bg-white rounded-2xl border-2 transition-all duration-300 ${goal.completed ? 'opacity-75' : ''} ${isExpanded ? 'border-arden-teal shadow-xl scale-[1.01]' : 'border-gray-200 shadow-sm hover:border-arden-teal/50'}`}>
                    
                    {/* Card Header (Summary) */}
                    <div 
                        className="p-6 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleExpand(goal.id)}
                    >
                        <div className="flex items-center gap-5">
                            {/* Complete Toggle */}
                            <button
                                onClick={(e) => toggleComplete(goal.id, e)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${goal.completed ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-300 hover:border-green-400 hover:text-green-400'}`}
                                title={goal.completed ? "Mark as in-progress" : "Mark as finalized"}
                            >
                                {goal.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                            </button>

                            <div className={`w-3 h-16 rounded-full ${
                                goal.type === 'Digital' ? 'bg-blue-400' : 
                                goal.type === 'Soft Skill' ? 'bg-arden-yellow' : 'bg-purple-400'
                            }`} />
                            <div>
                                <h3 className={`font-bold text-xl text-arden-navy font-serif ${goal.completed ? 'line-through text-gray-400' : ''}`}>{goal.skill || "Untitled Objective"}</h3>
                                <div className="flex items-center gap-3 text-base text-gray-500 mt-1">
                                    <span className="bg-arden-bluegrey px-3 py-1 rounded-md text-xs uppercase font-bold tracking-wide text-arden-navy">{goal.type}</span>
                                    <span className="font-medium">• Due: {goal.targetDate}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-arden-grey">
                                {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </div>
                        </div>
                    </div>

                    {/* Card Body (Form) */}
                    {isExpanded && (
                        <div className="p-8 pt-0 border-t border-gray-100 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-8 mt-8">
                                
                                {/* Column 1 */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-arden-navy uppercase tracking-wider mb-2">Skill / Objective</label>
                                        <input 
                                            value={goal.skill}
                                            onChange={(e) => updateGoal(goal.id, 'skill', e.target.value)}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-arden-teal outline-none text-arden-navy font-semibold text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-arden-navy uppercase tracking-wider mb-2">Action Plan (Activities)</label>
                                        <textarea 
                                            value={goal.activity}
                                            onChange={(e) => updateGoal(goal.id, 'activity', e.target.value)}
                                            rows={3}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-arden-teal outline-none text-base text-gray-700"
                                            placeholder="What specific actions will you take?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-arden-navy uppercase tracking-wider mb-2">Resources & Support</label>
                                        <input 
                                            value={goal.resources}
                                            onChange={(e) => updateGoal(goal.id, 'resources', e.target.value)}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-arden-teal outline-none text-base text-gray-700"
                                            placeholder="Who or what can help?"
                                        />
                                    </div>
                                </div>

                                {/* Column 2 */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-arden-navy uppercase tracking-wider mb-2">Justification</label>
                                        <input 
                                            value={goal.rationale}
                                            onChange={(e) => updateGoal(goal.id, 'rationale', e.target.value)}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-arden-teal outline-none text-base text-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-arden-navy uppercase tracking-wider mb-2">Success Criteria</label>
                                        <textarea 
                                            value={goal.successCriteria}
                                            onChange={(e) => updateGoal(goal.id, 'successCriteria', e.target.value)}
                                            rows={3}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-arden-teal outline-none text-base text-gray-700"
                                            placeholder="How will you know you've achieved it?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-arden-navy uppercase tracking-wider mb-2">Target Date</label>
                                        <input 
                                            value={goal.targetDate}
                                            onChange={(e) => updateGoal(goal.id, 'targetDate', e.target.value)}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-arden-teal outline-none text-base text-gray-700"
                                            placeholder="e.g., End of Semester"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions Area */}
                            <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-t-2 border-dashed border-gray-200">
                                <button 
                                    onClick={() => deleteGoal(goal.id)}
                                    className="text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center"
                                >
                                    <Trash2 size={18} className="mr-2" /> Delete
                                </button>

                                <button 
                                    onClick={handleSaveAndAdd}
                                    className="bg-arden-bluegrey text-arden-navy border-2 border-arden-navy/10 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-white hover:border-arden-teal transition shadow-sm"
                                >
                                    <BadgePlus size={18} className="text-arden-teal" />
                                    Save & Add Another Objective
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        })}
      </div>

      <div className="mt-16 text-center border-t border-gray-200 pt-10 pb-10">
            {/* Batch Analysis Section */}
            {!expertFeedback ? (
                <div className="mb-10 p-6 bg-arden-bluegrey rounded-2xl border-2 border-arden-teal/20 inline-block max-w-2xl">
                     <p className="text-arden-navy text-lg mb-4 font-medium">Finished defining your objectives?</p>
                     <button
                        onClick={handleBatchEvaluate}
                        disabled={isAnalysing || goals.length === 0}
                        className="bg-white text-arden-teal border-2 border-arden-teal px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-arden-teal hover:text-white transition flex items-center gap-3 mx-auto"
                     >
                        {isAnalysing ? (
                             <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                                Consulting AI Expert...
                             </>
                        ) : (
                             <>
                                <Sparkles size={22} />
                                Get Expert Feedback on All Objectives
                             </>
                        )}
                     </button>
                </div>
            ) : (
                <div id="expert-feedback-section" className="mb-12 max-w-3xl mx-auto bg-white p-8 rounded-2xl border-l-8 border-arden-yellow shadow-lg animate-fade-in text-left">
                    <div className="flex items-start gap-4">
                        <div className="bg-arden-navy p-3 rounded-full text-white mt-1">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-arden-navy font-serif mb-2">Expert Consultant Feedback</h3>
                            <p className="text-gray-700 leading-relaxed text-lg">{expertFeedback}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setExpertFeedback(null)}
                        className="mt-4 text-sm text-gray-400 hover:text-arden-teal font-bold uppercase tracking-wider"
                    >
                        Refresh Feedback
                    </button>
                </div>
            )}
            
            <div className="flex flex-col items-center">
                <button 
                    onClick={() => onFinish(goals)}
                    className="bg-arden-navy text-white px-10 py-4 rounded-xl font-bold text-xl shadow-xl hover:bg-arden-teal transition-all flex items-center gap-3 mx-auto transform hover:-translate-y-1"
                >
                    Finish & Provide Feedback <ArrowRight size={24} />
                </button>
                <button onClick={onReset} className="mt-6 text-gray-400 hover:text-arden-grey text-sm font-medium flex items-center justify-center gap-1 mx-auto transition">
                    <Share2 size={16} /> Start Over (Clears Data)
                </button>
            </div>
      </div>
    </div>
  );
};