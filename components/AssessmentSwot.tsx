import React, { useState } from 'react';
import { SwotAnalysis, SwotSuggestion } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Zap, AlertTriangle, Sparkles, PlusCircle, XCircle } from 'lucide-react';

interface Props {
  data: SwotAnalysis;
  onChange: (data: SwotAnalysis) => void;
  onGenerate: () => void;
  onBack: () => void;
  isGenerating: boolean;
  onGenerateSuggestions: () => Promise<SwotSuggestion[]>;
}

export const AssessmentSwot: React.FC<Props> = ({ data, onChange, onGenerate, onBack, isGenerating, onGenerateSuggestions }) => {
  const [suggestions, setSuggestions] = useState<SwotSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleChange = (field: keyof SwotAnalysis, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleLoadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
        const newSuggestions = await onGenerateSuggestions();
        setSuggestions(newSuggestions);
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingSuggestions(false);
    }
  };

  const acceptSuggestion = (sug: SwotSuggestion) => {
    const currentText = data[sug.category];
    const newText = currentText ? currentText + '\n- ' + sug.text : '- ' + sug.text;
    handleChange(sug.category, newText);
    setSuggestions(prev => prev.filter(p => p !== sug));
  };

  const rejectSuggestion = (sug: SwotSuggestion) => {
    setSuggestions(prev => prev.filter(p => p !== sug));
  };

  // Helper to render suggestion chips
  const renderSuggestions = (category: string) => {
    const relevant = suggestions.filter(s => s.category === category);
    if (relevant.length === 0) return null;
    return (
        <div className="flex flex-col gap-2 mb-3 animate-fade-in">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Suggestions:</span>
            {relevant.map((s, idx) => (
                <div key={idx} className="flex items-start justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-sm">
                    <span className="text-gray-700 leading-relaxed">{s.text}</span>
                    <div className="flex gap-2 ml-3">
                        <button onClick={() => acceptSuggestion(s)} className="text-green-500 hover:text-green-700 hover:bg-green-50 rounded-full p-1" title="Add">
                            <PlusCircle size={20} />
                        </button>
                        <button onClick={() => rejectSuggestion(s)} className="text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-full p-1" title="Reject">
                            <XCircle size={20} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto h-full pb-8">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-arden-navy font-serif mb-3">Strategic SWOT Analysis</h2>
        <p className="text-xl text-arden-grey mb-6">Analyze your internal environment (S/W) and external environment (O/T).</p>
        
        {suggestions.length === 0 && (
            <button 
                onClick={handleLoadSuggestions} 
                disabled={loadingSuggestions}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-arden-teal border-2 border-arden-teal rounded-full font-bold text-base hover:bg-arden-teal hover:text-white transition disabled:opacity-50 shadow-sm"
            >
                {loadingSuggestions ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : <Sparkles size={20} />}
                {loadingSuggestions ? 'Analysing profile...' : 'Auto-populate with AI'}
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        
        {/* Internal */}
        <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 pb-2 border-b-2 border-arden-navy/10">
                <span className="text-lg font-bold text-arden-navy uppercase tracking-widest">Internal Factors</span>
            </div>
            
            <div className="bg-green-50 p-6 rounded-2xl border border-green-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-green-800">
                    <ArrowUpCircle size={24} />
                    <span className="font-bold text-xl">Strengths</span>
                </div>
                {renderSuggestions('strengths')}
                <textarea
                    className="w-full h-40 p-4 bg-white rounded-xl border-transparent focus:ring-2 focus:ring-green-500 focus:border-transparent text-base resize-none shadow-inner"
                    placeholder="What do you do well? What unique resources do you have?"
                    value={data.strengths}
                    onChange={(e) => handleChange('strengths', e.target.value)}
                />
            </div>

            <div className="bg-red-50 p-6 rounded-2xl border border-red-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-red-800">
                    <ArrowDownCircle size={24} />
                    <span className="font-bold text-xl">Weaknesses</span>
                </div>
                {renderSuggestions('weaknesses')}
                <textarea
                    className="w-full h-40 p-4 bg-white rounded-xl border-transparent focus:ring-2 focus:ring-red-500 focus:border-transparent text-base resize-none shadow-inner"
                    placeholder="What could you improve? Where do you lack resources?"
                    value={data.weaknesses}
                    onChange={(e) => handleChange('weaknesses', e.target.value)}
                />
            </div>
        </div>

        {/* External */}
        <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 pb-2 border-b-2 border-arden-navy/10">
                <span className="text-lg font-bold text-arden-navy uppercase tracking-widest">External Factors</span>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-blue-800">
                    <Zap size={24} />
                    <span className="font-bold text-xl">Opportunities</span>
                </div>
                {renderSuggestions('opportunities')}
                <textarea
                    className="w-full h-40 p-4 bg-white rounded-xl border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none shadow-inner"
                    placeholder="What trends could you take advantage of? (e.g. AI in Tourism)"
                    value={data.opportunities}
                    onChange={(e) => handleChange('opportunities', e.target.value)}
                />
            </div>

            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-orange-800">
                    <AlertTriangle size={24} />
                    <span className="font-bold text-xl">Threats</span>
                </div>
                {renderSuggestions('threats')}
                <textarea
                    className="w-full h-40 p-4 bg-white rounded-xl border-transparent focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base resize-none shadow-inner"
                    placeholder="What trends could harm you? What is the competition doing?"
                    value={data.threats}
                    onChange={(e) => handleChange('threats', e.target.value)}
                />
            </div>
        </div>

      </div>

      <div className="flex justify-between items-center">
        <button onClick={onBack} disabled={isGenerating} className="px-8 py-4 text-arden-grey font-bold hover:bg-white rounded-xl transition disabled:opacity-50 text-lg">
          Back
        </button>
        <button 
            onClick={onGenerate} 
            disabled={isGenerating}
            className={`px-12 py-5 bg-arden-navy text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 flex items-center gap-3 text-lg border-2 border-arden-teal/50 ${isGenerating ? 'opacity-90 cursor-wait' : 'hover:bg-arden-teal'}`}
        >
          {isGenerating ? (
            <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Analyzing Profile...
            </>
          ) : (
             <>
                Generate Strategic PDP
                <Zap className="fill-current text-arden-yellow" size={24} />
             </>
          )}
        </button>
      </div>
    </div>
  );
};