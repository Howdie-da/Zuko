import React from 'react'

function Button2({
    children,
    type = "button",
    bgColor = "bg-[#C85213]",
    textColor = "text-[#E6BD9E]",
    className = "",
    ...props
}) {
  return (
    <button 
      type={type} 
      {...props}
      className="px-8 py-3 rounded-full bg-[#C85213]/10 border border-[#A77510]/40 text-[#E6BD9E] font-semibold cursor-pointer hover:bg-[#A77510] hover:text-[#200800] transition-all duration-300 shadow-[0_0_15px_rgba(200,82,19,0.1)] hover:shadow-[0_0_25px_rgba(167,117,16,0.35)]"
    >
        {children}
    </button>
  )
}

export default Button2