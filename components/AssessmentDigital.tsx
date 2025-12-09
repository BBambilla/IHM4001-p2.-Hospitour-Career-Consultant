import React from 'react';
import { JiscDigitalAudit, JiscLevel } from '../types';
import { JISC_LEVELS } from '../constants';
import { Laptop, Shield, Search, Zap, Users, Heart } from 'lucide-react';

interface Props {
  data: JiscDigitalAudit;
  onChange: (data: JiscDigitalAudit) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AssessmentDigital: React.FC<Props> = ({ data, onChange, onNext, onBack }) => {
  const updateLevel = (field: keyof JiscDigitalAudit, level: JiscLevel) => {
    onChange({ ...data, [field]: level });
  };

  const categories = [
    { key: 'digitalProficiency', label: 'Digital Proficiency', icon: Laptop, desc: 'Using devices, apps, and adopting new tools.' },
    { key: 'informationLiteracy', label: 'Information Literacy', icon: Search, desc: 'Finding, evaluating, and organising information.' },
    { key: 'digitalProductivity', label: 'Digital Productivity', icon: Zap, desc: 'Using tools to get things done efficiently.' },
    { key: 'digitalCollaboration', label: 'Digital Collaboration', icon: Users, desc: 'Working in digital teams and shared spaces.' },
    { key: 'digitalIdentity', label: 'Digital Identity', icon: Shield, desc: 'Managing your digital reputation and footprint.' },
    { key: 'digitalWellbeing', label: 'Digital Wellbeing', icon: Heart, desc: 'Health, safety, and work-life balance online.' },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto">
       <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-arden-navy font-serif mb-3">JISC Digital Capabilities</h2>
        <p className="text-xl text-arden-grey">Assess your digital readiness for the modern workplace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {categories.map((cat) => (
          <div key={cat.key} className="bg-white p-6 rounded-2xl border-2 border-transparent hover:border-arden-teal/30 shadow-sm hover:shadow-lg transition group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-arden-bluegrey rounded-xl text-arden-navy group-hover:bg-arden-teal group-hover:text-white transition">
                <cat.icon size={26} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-arden-navy">{cat.label}</h3>
                <p className="text-sm text-gray-500">{cat.desc}</p>
              </div>
            </div>
            
            <div className="flex justify-between bg-gray-100 rounded-xl p-1.5">
              {JISC_LEVELS.map((level) => {
                const isSelected = data[cat.key] === level;
                return (
                  <button
                    key={level}
                    onClick={() => updateLevel(cat.key, level)}
                    className={`flex-1 py-2.5 px-3 text-sm font-bold rounded-lg transition-all duration-200
                      ${isSelected ? 'bg-white text-arden-teal shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}
                    `}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="px-8 py-4 text-arden-grey font-bold hover:bg-white rounded-xl transition text-lg">
          Back
        </button>
        <button onClick={onNext} className="px-10 py-4 bg-arden-teal text-white font-bold rounded-xl shadow-lg hover:bg-teal-500 transition text-lg transform hover:-translate-y-0.5">
          Next Section
        </button>
      </div>
    </div>
  );
};