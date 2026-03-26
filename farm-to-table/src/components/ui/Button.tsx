import * as React from "react"
import { cn } from "../../utils/cn"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
      outline: "border border-gray-300 bg-white hover:bg-gray-100 text-gray-900 shadow-sm",
      ghost: "hover:bg-gray-100 hover:text-gray-900 text-gray-700",
    };
    
    const sizes = {
      default: "h-10 py-2 px-4 text-sm",
      sm: "h-9 px-3 rounded-md text-xs",
      md: "h-10 py-2 px-4 text-sm",
      lg: "h-11 px-8 rounded-md text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
