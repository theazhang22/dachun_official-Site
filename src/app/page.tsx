import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { Knowledge } from '@/components/sections/knowledge';
import { Activities } from '@/components/sections/activities';
import { Services } from '@/components/sections/services';
import { About } from '@/components/sections/about';
import { Contact } from '@/components/sections/contact';

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Features />
      <Knowledge />
      <Activities />
      <Services />
      <About />
      <Contact />
    </main>
  );
}
