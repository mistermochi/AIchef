import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-2xs font-bold uppercase border transition-all",
  {
    variants: {
      variant: {
        primary: "bg-primary-container dark:bg-primary-container-dark text-primary dark:text-primary-dark border-primary/20",
        neutral: "bg-surface-variant dark:bg-surface-variant-dark text-content-secondary dark:text-content-secondary-dark border-outline dark:border-outline-dark",
        success: "bg-success-container dark:bg-success-container-dark text-success-dark border-success/20",
        warning: "bg-warning-container dark:bg-warning-container-dark text-warning-on-container border-warning/20",
        // shadcn compatibility
        default: "bg-primary-container dark:bg-primary-container-dark text-primary dark:text-primary-dark border-primary/20",
        secondary: "bg-surface-variant dark:bg-surface-variant-dark text-content-secondary dark:text-content-secondary-dark border-outline dark:border-outline-dark",
        destructive: "bg-danger-container dark:bg-danger-container-dark text-danger border-danger/20",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
        icon?: React.ReactNode;
        label?: React.ReactNode;
    }

function Badge({ className, variant, icon, label, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className, props.onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : '')} {...props}>
      {icon && React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, {
        className: cn("w-3.5 h-3.5", (icon as React.ReactElement<any>).props.className)
      })}
      {label || children}
    </div>
  )
}

export { Badge, badgeVariants }
