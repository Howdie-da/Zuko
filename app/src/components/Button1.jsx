import React from 'react'

function Button1({
    children,
    type = "button",
    bgColor = "bg-[#441100]",
    textColor = "text-[#E6BD9E]",
    className = "",
    ...props
}) {
  return (
    <button 
      type={type} 
      {...props}
      className={`px-5 py-2 rounded-lg font-medium border border-[#6E3208]/60 cursor-pointer focus:outline-hidden transition-all duration-200 hover:bg-[#200800] hover:text-[#C85213] hover:border-[#C85213]/40 focus:ring-2 focus:ring-[#A77510]/50 ${bgColor} ${textColor} ${className}`}
    >
        {children}
    </button>
  )
}

export default Button1