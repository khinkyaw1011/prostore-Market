import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import './globals.css'
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants/index";
import {ThemeProvider} from 'next-themes'
const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const inter= Inter({subsets:['latin']})
export const metadata: Metadata = {
  title: {
    template : `%s | Prostore`,
    default: APP_NAME,
  },
  description:'A Modern ecommerce platform built with Next.js',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en" suppressHydrationWarning
      className={cn("antialiased", inter.className, "font-mono", jetbrainsMono.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
        attribute='class'
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
        >   
           {children}
          </ThemeProvider>
       </body>
    </html>
  );
}
