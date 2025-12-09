import React from 'react';
import { UserProfile } from '../types';
import { MBTI_TYPES, LEADERSHIP_STYLES } from '../constants';
import { User, Briefcase, MapPin, Target, Heart } from 'lucide-react';

interface Props {
  data: UserProfile;
  onChange: (data: UserProfile) => void;
  onNext: () => void;
}

export const ProfileForm: React.FC<Props> = ({ data, onChange, onNext }) => {
  const handleChange = (field: keyof UserProfile, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const isValid = data.name && data.careerGoal && data.careerReason;

  return (
    <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-lg border border-arden-teal/20 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-arden-navy font-serif mb-3">Who are you?</h2>
        <p className="text-xl text-arden-grey">Let's build your professional identity profile.</p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-lg font-semibold text-arden-navy mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-4 text-arden-teal w-6 h-6" />
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="pl-12 w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-arden-teal/20 focus:border-arden-teal outline-none transition text-lg"
              placeholder="e.g. Alex Hotelier"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-lg font-semibold text-arden-navy mb-2">MBTI Personality</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-arden-teal w-6 h-6" />
              <select
                value={data.mbti}
                onChange={(e) => handleChange('mbti', e.target.value)}
                className="pl-12 w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-arden-teal/20 focus:border-arden-teal outline-none bg-white text-lg appearance-none cursor-pointer"
              >
                {MBTI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-arden-navy mb-2">Leadership Style</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-4 text-arden-teal w-6 h-6" />
              <select
                value={data.leadershipStyle}
                onChange={(e) => handleChange('leadershipStyle', e.target.value)}
                className="pl-12 w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-arden-teal/20 focus:border-arden-teal outline-none bg-white text-lg appearance-none cursor-pointer"
              >
                {LEADERSHIP_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-arden-navy mb-2">5-Year Career Goal</label>
          <div className="relative">
            <Target className="absolute left-4 top-4 text-arden-teal w-6 h-6" />
            <input
              type="text"
              value={data.careerGoal}
              onChange={(e) => handleChange('careerGoal', e.target.value)}
              className="pl-12 w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-arden-teal/20 focus:border-arden-teal outline-none text-lg"
              placeholder="e.g. General Manager at a Luxury Resort"
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-arden-navy mb-2">Why do you want this career?</label>
          <div className="relative">
            <Heart className="absolute left-4 top-4 text-arden-teal w-6 h-6" />
            <textarea
              value={data.careerReason}
              onChange={(e) => handleChange('careerReason', e.target.value)}
              rows={3}
              className="pl-12 w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-arden-teal/20 focus:border-arden-teal outline-none text-lg"
              placeholder="Describe your motivation, passion, or dream..."
            />
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!isValid}
          className={`w-full py-5 rounded-xl font-bold text-xl shadow-lg transform transition hover:scale-[1.01] active:scale-95
            ${isValid ? 'bg-arden-teal text-white hover:bg-teal-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          Begin Skills Audit
        </button>
      </div>
    </div>
  );
};