import React from 'react';
import { ThumbnailConfig } from '../types';
import { RefreshCw, Zap, Type, Layout, Volume2 } from 'lucide-react';

interface ControlsProps {
  config: ThumbnailConfig;
  onChange: (newConfig: ThumbnailConfig) => void;
}

export const Controls: React.FC<ControlsProps> = ({ config, onChange }) => {
  
  const handleChange = (key: keyof ThumbnailConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-md border-2 border-slate-600 p-6 rounded-3xl shadow-xl space-y-6 text-white">
      
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-600 pb-4">
        <Zap className="text-yellow-400 fill-yellow-400" />
        <h2 className="text-xl font-bold uppercase tracking-wide">Battle Config</h2>
      </div>

      {/* Text Inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1 flex items-center gap-2">
            <Type size={14} /> Main Headline
          </label>
          <input
            type="text"
            value={config.text}
            onChange={(e) => handleChange('text', e.target.value)}
            className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 font-bold text-lg focus:border-yellow-400 focus:outline-none transition-colors placeholder-slate-600"
            placeholder="e.g. RIP IPAD 💀"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Secondary Text</label>
          <input
            type="text"
            value={config.subText}
            onChange={(e) => handleChange('subText', e.target.value)}
            className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-2 font-medium focus:border-yellow-400 focus:outline-none transition-colors placeholder-slate-600"
            placeholder="e.g. 0 HP LEFT!?"
          />
        </div>
      </div>

      {/* Theme Selection */}
      <div>
        <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {['defeat', 'victory', 'funny', 'glitch'].map((theme) => (
            <button
              key={theme}
              onClick={() => handleChange('theme', theme)}
              className={`py-2 px-3 rounded-lg font-bold uppercase text-sm border-2 transition-all
                ${config.theme === theme 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_2px_0_0_rgba(0,0,0,0.3)]' 
                  : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
                }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="block text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-2">
           <Layout size={14}/> Aspect Ratio
        </label>
        <div className="flex bg-slate-900 p-1 rounded-xl">
          {['9:16', '16:9', '1:1'].map((ratio) => (
            <button
              key={ratio}
              onClick={() => handleChange('aspectRatio', ratio as any)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all
                ${config.aspectRatio === ratio
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Chaos Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold uppercase text-slate-400">Chaos Level</label>
          <span className="text-xs font-mono bg-red-900 text-red-200 px-2 py-0.5 rounded">
            {config.chaosLevel}%
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={config.chaosLevel}
          onChange={(e) => handleChange('chaosLevel', parseInt(e.target.value))}
          className="w-full h-3 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400"
        />
        <p className="text-xs text-slate-500 mt-1 italic">
            {config.chaosLevel < 30 ? "Chill vibes." : config.chaosLevel < 70 ? "Getting spicy..." : "ABSOLUTE DESTRUCTION 🔥"}
        </p>
      </div>

      {/* Audio Toggle */}
      <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700">
        <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 cursor-pointer select-none">
          <Volume2 size={16} /> 
          <div>
            Generate Gamer Audio
            <p className="text-[10px] text-slate-500 font-normal normal-case">Adds dramatic voiceover</p>
          </div>
        </label>
        <button
          onClick={() => handleChange('includeAudio', !config.includeAudio)}
          className={`w-12 h-6 rounded-full transition-colors relative ${config.includeAudio ? 'bg-green-500' : 'bg-slate-700'}`}
        >
          <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${config.includeAudio ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>
      
      {/* Randomize Button */}
      <button 
        onClick={() => {
            const themes: any[] = ['defeat', 'victory', 'funny', 'glitch'];
            const texts = ["HE HE HE HAW", "UNINSTALLING...", "I BROKE IT", "MY MOM IS MAD"];
            onChange({
                ...config,
                text: texts[Math.floor(Math.random() * texts.length)],
                theme: themes[Math.floor(Math.random() * themes.length)],
                chaosLevel: Math.floor(Math.random() * 100)
            })
        }}
        className="w-full py-2 flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase"
      >
        <RefreshCw size={14} /> Randomize Loadout
      </button>

    </div>
  );
};