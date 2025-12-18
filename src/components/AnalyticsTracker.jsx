'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageVisit } from '../lib/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Track page visit when component mounts or pathname changes
    const track = async () => {
      await trackPageVisit(pathname);
    };
    
    track();
  }, [pathname]);
  
  // This component doesn't render anything
  return null;
}
