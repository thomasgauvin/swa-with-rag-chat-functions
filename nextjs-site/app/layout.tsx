import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NavBar } from './components/navbar';
import { BlogInfo, PageWithSlugAndTitle } from './lib/types';
import { Chatbot } from './components/chatbot';

const inter = Inter({ subsets: ['latin'] })
const wordpressUrl = process.env.WORDPRESS_URL;

export const metadata: Metadata = {
  title: 'Azure Static Web Apps + WordPress',
  description: 'A custom Next.js starter template for Azure Static Web Apps + WordPress',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const response = await fetch(`${wordpressUrl}/wp-json`);
  const blogInfo : BlogInfo = await response.json();

  const response2 = await fetch(`${wordpressUrl}/wp-json/wp/v2/pages?_fields[]=title&_fields[]=slug`);
  const pages : PageWithSlugAndTitle[] = await response2.json();

  return (
    <html lang="en">
      <body className={inter.className + " min-h-screen flex flex-col"}>
        <NavBar pages={pages} blogInfo={blogInfo} />
        <main className='container mx-auto px-4 pt-24 pb-12 flex-grow'>
          {children}
        </main>
        <footer className="bg-indigo-950 text-white p-4 text-sm min-h-full h-32 flex items-center justify-center">
          {/* Footer content goes here */}
          <div>
            {blogInfo.name} &copy; {new Date().getFullYear()}
          </div>
          <div>
            {blogInfo.description}
          </div>
          <Chatbot />
        </footer>
      </body>
    </html>
  )
}
