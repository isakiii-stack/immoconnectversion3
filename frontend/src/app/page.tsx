import { Suspense } from 'react';
import { Hero } from '@/components/sections/Hero';
import { FeaturedListings } from '@/components/sections/FeaturedListings';
import { FeaturedBuyerRequests } from '@/components/sections/FeaturedBuyerRequests';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Stats } from '@/components/sections/Stats';
import { Testimonials } from '@/components/sections/Testimonials';
import { CTA } from '@/components/sections/CTA';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        <Suspense fallback={<LoadingSpinner />}>
          <Hero />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedListings />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedBuyerRequests />
        </Suspense>
        
        <HowItWorks />
        <Stats />
        <Testimonials />
        <CTA />
      </main>
      
      <Footer />
    </div>
  );
}
