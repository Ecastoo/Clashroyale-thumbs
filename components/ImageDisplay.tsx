import React from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  aspectRatio: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading, aspectRatio }) => {
  
  // Calculate height class based on aspect ratio
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '9:16': return 'aspect-[9/16]';
      case '16:9': return 'aspect-[16/9]';
      case '1:1': return 'aspect-square';
      default: return 'aspect-[9/16]';
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `clash-royale-thumbnail-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`relative w-full ${getAspectRatioClass()} bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-700 shadow-2xl transition-all duration-500`}>
      
      {imageUrl ? (
        <>
          <img 
            src={imageUrl} 
            alt="Generated Thumbnail" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
             <button 
                onClick={handleDownload}
                className="bg-white text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-lg transform hover:scale-105"
             >
                <Download size={20} />
                Save to Photos
             </button>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center relative overflow-hidden">
           {/* Abstract Background Patterns */}
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
           </div>

           {isLoading ? (
             <div className="flex flex-col items-center z-10 animate-pulse">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-yellow-400 uppercase tracking-widest">Opening Chest...</p>
             </div>
           ) : (
             <div className="z-10 flex flex-col items-center">
                <div className="bg-slate-800 p-6 rounded-full mb-4 border-2 border-slate-700">
                    <ImageIcon size={48} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ready for Battle</h3>
                <p className="text-sm">Configure your settings and hit generate to create a masterpiece.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
};
