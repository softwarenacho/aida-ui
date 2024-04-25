import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIDA Dreams',
  description: 'Create images based on your dreams',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/icons/apple-touch-icon.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/icons/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/icons/favicon-16x16.png'
        />
        <link rel='prefetch' href='/images/background.webp' as='image' />
        <meta name='msapplication-TileColor' content='#ab81d0' />
        <meta name='theme-color' content='#ab81d0'></meta>
        <meta name='description' content='AIDA Dreams User Interface' />
        <meta
          name='viewport'
          content='initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0'
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
