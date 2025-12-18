// Analytics Service for ATS Maker
// Tracks visits, page views, and user actions with country detection

import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';

// Collection names
const COLLECTIONS = {
  VISITS: 'atsmaker_visits',
  DAILY_STATS: 'atsmaker_daily_stats',
  PAGE_VIEWS: 'atsmaker_page_views',
  ACTIONS: 'atsmaker_actions',
  COUNTRIES: 'atsmaker_countries'
};

// Get visitor's country from IP using free API
async function getVisitorCountry() {
  try {
    // Using ip-api.com (free, no API key needed, 45 requests/minute limit)
    const response = await fetch('http://ip-api.com/json/?fields=status,country,countryCode,city,region');
    
    if (!response.ok) {
      // Fallback to ipapi.co if ip-api.com fails
      const fallbackResponse = await fetch('https://ipapi.co/json/');
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        return {
          country: data.country_name || 'Unknown',
          countryCode: data.country_code || 'XX',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown'
        };
      }
      throw new Error('IP lookup failed');
    }
    
    const data = await response.json();
    if (data.status === 'success') {
      return {
        country: data.country || 'Unknown',
        countryCode: data.countryCode || 'XX',
        city: data.city || 'Unknown',
        region: data.region || 'Unknown'
      };
    }
    
    return { country: 'Unknown', countryCode: 'XX', city: 'Unknown', region: 'Unknown' };
  } catch (error) {
    console.warn('Could not get visitor location:', error.message);
    return { country: 'Unknown', countryCode: 'XX', city: 'Unknown', region: 'Unknown' };
  }
}

// Generate unique visitor ID (stored in localStorage)
function getVisitorId() {
  if (typeof window === 'undefined') return null;
  
  let visitorId = localStorage.getItem('atsmaker_visitor_id');
  if (!visitorId) {
    visitorId = 'v_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('atsmaker_visitor_id', visitorId);
  }
  return visitorId;
}

// Check if this is a new visitor today
function isNewVisitorToday() {
  if (typeof window === 'undefined') return false;
  
  const today = new Date().toISOString().split('T')[0];
  const lastVisit = localStorage.getItem('atsmaker_last_visit');
  
  if (lastVisit !== today) {
    localStorage.setItem('atsmaker_last_visit', today);
    return true;
  }
  return false;
}

// Get device info
function getDeviceInfo() {
  if (typeof window === 'undefined') return {};
  
  const ua = navigator.userAgent;
  let device = 'desktop';
  let os = 'Unknown';
  let browser = 'Unknown';
  
  // Detect device type
  if (/Mobi|Android/i.test(ua)) device = 'mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'tablet';
  
  // Detect OS
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';
  
  // Detect browser
  if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Edge/i.test(ua)) browser = 'Edge';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';
  
  return { device, os, browser };
}

// Track page visit
export async function trackPageVisit(page = '/') {
  try {
    if (typeof window === 'undefined') return;
    
    const visitorId = getVisitorId();
    const isNewToday = isNewVisitorToday();
    const deviceInfo = getDeviceInfo();
    const locationInfo = await getVisitorCountry();
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    // Record the visit
    await addDoc(collection(db, COLLECTIONS.VISITS), {
      visitorId,
      page,
      timestamp: serverTimestamp(),
      date: today,
      hour: now.getHours(),
      ...deviceInfo,
      ...locationInfo,
      referrer: document.referrer || 'direct',
      isNewVisitor: !localStorage.getItem('atsmaker_returning')
    });
    
    // Mark as returning visitor
    if (!localStorage.getItem('atsmaker_returning')) {
      localStorage.setItem('atsmaker_returning', 'true');
    }
    
    // Update daily stats
    const dailyDocRef = doc(db, COLLECTIONS.DAILY_STATS, today);
    const dailyDoc = await getDoc(dailyDocRef);
    
    if (dailyDoc.exists()) {
      await updateDoc(dailyDocRef, {
        pageViews: increment(1),
        uniqueVisitors: isNewToday ? increment(1) : increment(0)
      });
    } else {
      await setDoc(dailyDocRef, {
        date: today,
        pageViews: 1,
        uniqueVisitors: 1,
        pdfExports: 0,
        docxExports: 0,
        resumesCreated: 0,
        coverLettersCreated: 0
      });
    }
    
    // Update country stats
    if (locationInfo.country !== 'Unknown') {
      const countryDocRef = doc(db, COLLECTIONS.COUNTRIES, locationInfo.countryCode);
      const countryDoc = await getDoc(countryDocRef);
      
      if (countryDoc.exists()) {
        await updateDoc(countryDocRef, {
          visits: increment(1),
          lastVisit: serverTimestamp()
        });
      } else {
        await setDoc(countryDocRef, {
          country: locationInfo.country,
          countryCode: locationInfo.countryCode,
          visits: 1,
          firstVisit: serverTimestamp(),
          lastVisit: serverTimestamp()
        });
      }
    }
    
    console.log('📊 Analytics: Visit tracked');
  } catch (error) {
    console.warn('Analytics tracking failed:', error.message);
  }
}

// Track specific actions
export async function trackAction(action, details = {}) {
  try {
    if (typeof window === 'undefined') return;
    
    const visitorId = getVisitorId();
    const today = new Date().toISOString().split('T')[0];
    
    await addDoc(collection(db, COLLECTIONS.ACTIONS), {
      visitorId,
      action,
      details,
      timestamp: serverTimestamp(),
      date: today
    });
    
    // Update daily action counts
    const dailyDocRef = doc(db, COLLECTIONS.DAILY_STATS, today);
    const dailyDoc = await getDoc(dailyDocRef);
    
    const actionCountField = {
      'pdf_export': 'pdfExports',
      'docx_export': 'docxExports',
      'resume_created': 'resumesCreated',
      'cover_letter_created': 'coverLettersCreated',
      'json_export': 'jsonExports',
      'json_import': 'jsonImports'
    }[action];
    
    if (actionCountField && dailyDoc.exists()) {
      await updateDoc(dailyDocRef, {
        [actionCountField]: increment(1)
      });
    }
    
    console.log(`📊 Analytics: Action tracked - ${action}`);
  } catch (error) {
    console.warn('Action tracking failed:', error.message);
  }
}

// Get analytics summary (for admin dashboard)
export async function getAnalyticsSummary() {
  try {
    const summary = {
      totalVisits: 0,
      totalUniqueVisitors: 0,
      totalPdfExports: 0,
      totalDocxExports: 0,
      totalResumesCreated: 0,
      totalCoverLettersCreated: 0,
      countriesData: [],
      last30Days: [],
      topCountries: []
    };
    
    // Get all daily stats
    const dailyStatsQuery = query(
      collection(db, COLLECTIONS.DAILY_STATS),
      orderBy('date', 'desc'),
      limit(30)
    );
    const dailySnapshot = await getDocs(dailyStatsQuery);
    
    dailySnapshot.forEach(doc => {
      const data = doc.data();
      summary.last30Days.push(data);
      summary.totalVisits += data.pageViews || 0;
      summary.totalUniqueVisitors += data.uniqueVisitors || 0;
      summary.totalPdfExports += data.pdfExports || 0;
      summary.totalDocxExports += data.docxExports || 0;
      summary.totalResumesCreated += data.resumesCreated || 0;
      summary.totalCoverLettersCreated += data.coverLettersCreated || 0;
    });
    
    // Get countries data
    const countriesQuery = query(
      collection(db, COLLECTIONS.COUNTRIES),
      orderBy('visits', 'desc'),
      limit(20)
    );
    const countriesSnapshot = await getDocs(countriesQuery);
    
    countriesSnapshot.forEach(doc => {
      summary.topCountries.push(doc.data());
    });
    
    return summary;
  } catch (error) {
    console.error('Failed to get analytics summary:', error);
    return null;
  }
}

// Export action types for easy use
export const ACTIONS = {
  PDF_EXPORT: 'pdf_export',
  DOCX_EXPORT: 'docx_export',
  RESUME_CREATED: 'resume_created',
  COVER_LETTER_CREATED: 'cover_letter_created',
  JSON_EXPORT: 'json_export',
  JSON_IMPORT: 'json_import',
  TEMPLATE_CHANGED: 'template_changed',
  VERSION_CREATED: 'version_created'
};
