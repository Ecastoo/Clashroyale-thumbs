import React, { useState, useRef, useEffect } from 'react';
import { Controls } from './components/Controls';
import { ImageDisplay } from './components/ImageDisplay';
import { Button } from './components/Button';
import { ThumbnailConfig } from './types';
import { generateThumbnailImage, generateGamerAudio } from './services/gemini';
import { Crown, AlertTriangle, Play, Pause, Download } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<ThumbnailConfig>({
    text: "LOST THE BATTLE...",
    subText: "RIP IPAD 💀📱",
    chaosLevel: 85,
    theme: 'defeat',
    aspectRatio: '9:16',
    includeAudio: false,
  });

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setAudioUrl(null); // Reset audio when generating new
    setIsPlaying(false);

    try {
      // Execute in parallel if audio is enabled
      const promises: Promise<any>[] = [generateThumbnailImage(config)];
      if (config.includeAudio) {
        promises.push(generateGamerAudio(config));
      }

      const results = await Promise.all(promises);
      setImageUrl(results[0]);
      
      if (config.includeAudio && results[1]) {
        setAudioUrl(results[1]);
      }

    } catch (err: any) {
      console.error(err);
      // Use the actual error message if available
      setError(err.message || "Failed to generate content. The API might be busy or the chaos level is too high!");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[20%] w-[10%] h-[10%] bg-yellow-500/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col items-center justify-center mb-12 text-center">
           <div className="flex items-center gap-3 mb-2 animate-[bounce_2s_infinite]">
              <Crown className="text-yellow-400 fill-yellow-400 drop-shadow-lg" size={48} />
           </div>
           <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] leading-tight">
             ClashGen
           </h1>
           <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm md:text-base mt-2">
             Broken iPad Edition 📱💥
           </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-6">
            <Controls config={config} onChange={setConfig} />
            
            <Button 
              onClick={handleGenerate} 
              isLoading={isLoading} 
              className="w-full text-lg shadow-[0_6px_0_0_rgba(180,83,9,1)] hover:shadow-[0_3px_0_0_rgba(180,83,9,1)] active:translate-y-[3px] active:shadow-none transition-all"
            >
              {config.includeAudio ? "Generate Thumbnail + Audio" : "Generate Thumbnail"}
            </Button>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                 <AlertTriangle size={18} className="shrink-0" />
                 <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-7 flex flex-col items-center gap-6">
            <div className="w-full max-w-md lg:max-w-full relative group">
               <ImageDisplay 
                  imageUrl={imageUrl} 
                  isLoading={isLoading} 
                  aspectRatio={config.aspectRatio}
               />
               
               {/* Audio Player Card (Floating or Below) */}
               {audioUrl && (
                  <div className="mt-4 bg-slate-800/90 backdrop-blur border border-slate-600 p-4 rounded-2xl flex items-center justify-between shadow-lg w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={toggleAudio}
                        className="w-12 h-12 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center hover:bg-yellow-300 transition-colors shadow-lg"
                      >
                        {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                      </button>
                      <div>
                        <p className="font-bold text-white text-sm uppercase">Gamer Reaction</p>
                        <p className="text-xs text-slate-400">AI Generated Voice</p>
                      </div>
                    </div>
                    
                    <a 
                      href={audioUrl} 
                      download="gamer-reaction.wav"
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <Download size={20} />
                    </a>
                    
                    <audio 
                      ref={audioRef} 
                      src={audioUrl} 
                      onEnded={() => setIsPlaying(false)}
                      className="hidden" 
                    />
                  </div>
               )}
            </div>
            
            {imageUrl && (
                <p className="text-slate-500 text-xs font-mono uppercase tracking-widest opacity-50">
                  Model: gemini-2.5-flash-image • {config.chaosLevel}% CHAOS
                </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;