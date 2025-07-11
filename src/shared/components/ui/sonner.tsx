import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "hsl(var(--background))",
          "--normal-text": "hsl(var(--foreground))",
          "--normal-border": "hsl(var(--border))",
          "--success-bg": "hsl(142 76% 36%)",
          "--success-text": "hsl(355 20% 97%)",
          "--success-border": "hsl(142 76% 36%)",
          "--error-bg": "hsl(0 84% 60%)",
          "--error-text": "hsl(0 0% 98%)",
          "--error-border": "hsl(0 84% 60%)",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          backdropFilter: 'blur(8px)',
        },
        className: 'font-medium',
      }}
      {...props}
    />
  )
}

export { Toaster }
