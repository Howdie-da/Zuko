import React from 'react'

function Dialog({ 
  isOpen, 
  onClose, 
  message, 
  animeName = "", 
  option1, 
  option2, 
  onConfirm,
  onCross
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center w-full min-h-screen p-4 overflow-hidden animate-fade-in z-90">
      
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#200800]/60 backdrop-blur-md transition-opacity duration-300 cursor-pointer" 
      />

      <div className="relative z-10 w-full max-w-md bg-[#200800]/90 backdrop-blur-md border border-[#A46A44]/30 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] transform scale-100 transition-all duration-300 animate-scale-up">
        
        <button 
          onClick={onCross || onClose}
          className="absolute top-4 right-4 text-[#A46A44] hover:text-[#E6BD9E] font-mono text-sm transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div className='text-center space-y-2 mt-2'>
          <h3 className="text-xs font-mono tracking-widest text-[#A46A44] uppercase font-black">
            {message}
          </h3>
          
          {animeName && (
            <p className='text-sm font-bold text-[#E6BD9E] font-sans leading-tight'>
              "{animeName}"
            </p>
          )}
        </div>

        <div className='flex justify-center mt-6 gap-6 w-full'>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-rose-950/20 hover:bg-rose-900/40 active:scale-95 border border-rose-900/30 rounded-xl text-xs font-black tracking-widest text-rose-400 transition-all duration-300 cursor-pointer shadow-lg shadow-rose-950/10"
            >
            {option1 || "Confirm"}
          </button>
          
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-neutral-900/40 hover:bg-neutral-800/60 active:scale-95 border border-[#A46A44]/10 rounded-xl text-xs font-black tracking-widest text-gray-400 hover:text-white transition-all duration-300 cursor-pointer"
          >
            {option2 || "Close"}
          </button>
        </div>

      </div>
    </div>
  )
}



export default Dialog