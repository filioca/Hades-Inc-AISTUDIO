import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-stone-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-serif uppercase tracking-wider";
    
    const variants = {
      default: "bg-amber-800 text-stone-100 hover:bg-amber-700 border border-amber-600/50 shadow-[0_0_10px_rgba(180,83,9,0.3)]",
      destructive: "bg-red-900 text-stone-100 hover:bg-red-800 border border-red-700/50",
      outline: "border-2 border-stone-700 bg-transparent hover:bg-stone-800 hover:text-stone-200 text-stone-400",
      ghost: "hover:bg-stone-800 hover:text-stone-200 text-stone-400",
    };
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3 text-xs",
      lg: "h-12 px-8 text-lg",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
