import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  metadataBase: new URL('https://k6builder.dev'),
  title: {
    default: 'k6 Builder | Instant Grafana k6 Script Generator',
    template: '%s | k6 Builder',
  },
  description:
    'Free web tool to instantly generate Grafana k6 load testing scripts without boilerplate code. Customize VUs, duration, thresholds, and HTTP requests easily.',
  keywords: [
    'k6',
    'grafana k6',
    'load testing',
    'performance testing',
    'k6 script generator',
    'sre tools',
    'devops',
    'k6 script builder',
  ],
  generator: 'v0.app',
  alternates: {
    canonical: 'https://k6builder.dev',
  },
  openGraph: {
    title: 'k6 Builder | Instant Grafana k6 Script Generator',
    description:
      'Free web tool to instantly generate Grafana k6 load testing scripts without boilerplate code. Customize VUs, duration, thresholds, and HTTP requests easily.',
    url: 'https://k6builder.dev',
    siteName: 'k6 Builder',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'k6 Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'k6 Builder | Instant Grafana k6 Script Generator',
    description:
      'Free web tool to instantly generate Grafana k6 load testing scripts without boilerplate code. Customize VUs, duration, thresholds, and HTTP requests easily.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'k6 Builder',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  url: 'https://k6builder.dev',
  description:
    'Free web tool to instantly generate Grafana k6 load testing scripts without boilerplate code.',
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f3f5' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1c22' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`bg-background ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        <meta
          name="google-site-verification"
          content="_74hOs1_QqZ6j_4baUjY8dVNC4i2YtWDxvL8cKZdlUQ"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <Script
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token":"abe9416da75e4d75aac8e6a65ea14f67"}'
        />
      </body>
    </html>
  )
}
