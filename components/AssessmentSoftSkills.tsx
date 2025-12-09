import React from 'react';
import { SoftSkillsAudit } from '../types';
import { ClipboardList, Brain, Calendar, Users, Megaphone, UserPlus, Sparkles, Monitor, Smile } from 'lucide-react';

interface Props {
  data: SoftSkillsAudit;
  onChange: (data: SoftSkillsAudit) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AssessmentSoftSkills: React.FC<Props> = ({ data, onChange, onNext, onBack }) => {
  const handleChange = (field: keyof SoftSkillsAudit, value: number) => {
    onChange({ ...data, [field]: value });
  };

  const handleCustomChange = (index: number, value: number) => {
    if (!data.custom) return;
    const newCustom = [...data.custom];
    if (newCustom[index]) {
      newCustom[index].score = value;
      onChange({ ...data, custom: newCustom });
    }
  };

  const skills = [
    { key: 'organisation', label: 'Organisation', icon: ClipboardList, desc: 'Prioritising tasks and managing time effectively.' },
    { key: 'decisionMaking', label: 'Decision Making', icon: Brain, desc: 'Selecting suitable solutions from options.' },
    { key: 'planning', label: 'Planning', icon: Calendar, desc: 'Objective setting and resource allocation.' },
    { key: 'delegation', label: 'Delegation', icon: UserPlus, desc: 'Matching tasks to staff and empowering them.' },
    { key: 'motivation', label: 'Motivation', icon: Megaphone, desc: 'Encouraging creativity and engendering trust.' },
    { key: 'coaching', label: 'Coaching', icon: Users, desc: 'Listening skills and reinforcing positive behaviour.' },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-arden-navy font-serif mb-3">Soft Skills Audit</h2>
        <p className="text-xl text-arden-grey">Rate your competence from 1 (Low) to 5 (High).</p>
      </div>

      <div className="space-y-6 mb-10">
        {/* Core Skills */}
        <h3 className="font-bold text-arden-grey uppercase tracking-wider text-sm px-2">Core Competencies</h3>
        {skills.map((skill) => (
          <div key={skill.key} className="bg-white p-8 rounded-2xl border-2 border-transparent hover:border-arden-yellow/50 shadow-sm flex flex-col md:flex-row md:items-center gap-6 transition">
            <div className="flex items-center gap-5 md:w-1/3">
              <div className="p-3.5 bg-yellow-50 rounded-full text-arden-yellow">
                <skill.icon size={28} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-arden-navy">{skill.label}</h3>
                <p className="text-sm text-gray-500">{skill.desc}</p>
              </div>
            </div>

            <div className="flex-1 px-4">
               <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={data[skill.key]}
                onChange={(e) => handleChange(skill.key, parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-arden-yellow"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2 font-mono font-bold">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
            
            <div className="text-center min-w-[3rem]">
              <span className={`text-3xl font-bold ${data[skill.key] >= 4 ? 'text-green-500' : data[skill.key] <= 2 ? 'text-red-500' : 'text-arden-yellow'}`}>
                {data[skill.key]}
              </span>
            </div>
          </div>
        ))}

        {/* Custom AI Skills */}
        {data.custom && data.custom.length > 0 && (
            <>
                <div className="flex items-center gap-3 pt-8 pb-3 px-2 border-t border-gray-200 mt-8">
                    <Sparkles size={20} className="text-arden-teal" />
                    <h3 className="font-bold text-arden-grey uppercase tracking-wider text-sm">Skills Recommended for your Career Goal</h3>
                </div>
                {data.custom.map((skill, idx) => (
                <div key={skill.id} className="bg-gradient-to-r from-teal-50 to-white p-8 rounded-2xl border border-teal-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6 animate-fade-in-up">
                    <div className="flex items-center gap-5 md:w-1/3">
                    <div className={`p-3.5 rounded-full text-white shadow-sm flex-shrink-0 ${skill.category === 'Digital' ? 'bg-blue-400' : 'bg-arden-teal'}`}>
                        {skill.category === 'Digital' ? <Monitor size={28} /> : <Smile size={28} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-xl text-arden-navy">{skill.label}</h3>
                            {skill.category && (
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${skill.category === 'Digital' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                                    {skill.category}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 leading-snug">
                            <span className="font-bold text-gray-400 text-xs uppercase mr-1">Why:</span>
                            {skill.desc}
                        </p>
                    </div>
                    </div>

                    <div className="flex-1 px-4">
                    <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={skill.score}
                        onChange={(e) => handleCustomChange(idx, parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-arden-teal"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-2 font-mono font-bold">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                    </div>
                    </div>
                    
                    <div className="text-center min-w-[3rem]">
                    <span className={`text-3xl font-bold ${skill.score >= 4 ? 'text-green-500' : skill.score <= 2 ? 'text-red-500' : 'text-arden-teal'}`}>
                        {skill.score}
                    </span>
                    </div>
                </div>
                ))}
            </>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="px-8 py-4 text-arden-grey font-bold hover:bg-white rounded-xl transition text-lg">
          Back
        </button>
        <button onClick={onNext} className="px-10 py-4 bg-arden-yellow text-arden-navy font-bold rounded-xl shadow-lg hover:bg-yellow-400 transition text-lg transform hover:-translate-y-0.5 border border-yellow-500">
          Next: SWOT Analysis
        </button>
      </div>
    </div>
  );
};