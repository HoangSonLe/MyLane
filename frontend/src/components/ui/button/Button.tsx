import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        outline:
          'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
        // ── App variants — match Memory Arena's real --ma-* tokens, not the shadcn defaults above.
        // Deliberately no active:scale here — the app uses both scale-95 and scale-[0.97]
        // inconsistently per screen, so press-scale stays part of each call site's own
        // className (passed through and merged), not baked into the variant.
        brand: 'border-transparent bg-[var(--ma-brand)] text-[var(--ma-brand-fg)]',
        surface: 'border-[var(--ma-border)] bg-[var(--ma-surface-raised)] text-[var(--ma-fg)]',
        'surface-muted': 'border-[var(--ma-border)] bg-[var(--ma-surface-raised)] text-[var(--ma-fg-muted)]',
        'app-danger': 'border-[oklch(0.62_0.19_22/0.25)] bg-[oklch(0.62_0.19_22/0.10)] text-[var(--ma-danger)]',
      },
      size: {
        default:
          'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-8',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',
        'icon-lg': 'size-9',
        // ── App sizes — the real heights used across Memory Arena screens (h-9 to h-14).
        // No forced icon sizing here (unlike the shadcn sizes above): icons already set
        // their own width/height, and those vary per call site — let them keep it.
        'app-9': 'h-9 rounded-[var(--radius-xl)] gap-1.5 px-3 text-[13px] font-semibold',
        'app-10': 'h-10 rounded-[var(--radius-xl)] gap-2 px-4 text-[13px] font-semibold',
        'app-11': 'h-11 rounded-[var(--radius-2xl)] gap-2 px-4 text-[14px] font-semibold',
        'app-12': 'h-12 rounded-[var(--radius-2xl)] gap-2 px-5 text-[15px] font-semibold',
        'app-14': 'h-14 rounded-[var(--radius-2xl)] gap-2.5 px-5 text-[15px] font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
