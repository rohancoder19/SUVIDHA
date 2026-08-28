import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    navHome: "Home",
    navFinder: "Explore Schemes",
    navDashboard: "Dashboard",
    navComplaint: "Grievance Redressal",
    navTracker: "Application Tracker",
    navAdmin: "Admin",
    navLogin: "Sign In",
    navRegister: "Create Account",
    navLogout: "Sign Out",
    heroTitle: "Find Government Schemes You May Be Eligible For",
    heroSubtitle: "SUVIDHA 2.0 uses AI-powered hard eligibility filtering and RAG search across 3,400+ Central and State welfare schemes to connect citizens with their rightful benefits.",
    ctaCheckEligibility: "Check My Eligibility",
    ctaExploreSchemes: "Explore Schemes",
    aiSearchPlaceholder: "Ask about a scheme in natural language (e.g. 'Scholarships for college students in West Bengal')...",
    searchBtn: "Search",
    matchScore: "SUVIDHA Match Score",
    whyAmISeeingThis: "Why am I seeing this?",
    saveScheme: "Save Scheme",
    saved: "Saved",
    compare: "Compare",
    viewDetails: "View Eligibility",
    officialSource: "Official Govt Portal",
    requiredDocs: "Required Documents",
    documentAssistant: "Document Checklist Assistant",
    applicationStatus: "Application Status",
    filterState: "State / Union Territory",
    filterCategory: "Welfare Category",
    filterIncome: "Annual Income (₹)",
    filterAge: "Age (Years)",
    filterGender: "Gender",
    filterOccupation: "Occupation",
    clearFilters: "Clear Filters",
    noResultsTitle: "No Matching Welfare Schemes Found",
    noResultsDesc: "Try adjusting your demographic filters or broadening your search query.",
    trustBadgeTitle: "100% Verified Government Datasets",
    trustBadgeDesc: "Direct citations to official MyScheme, DBT, and Ministry portals without hallucinatory claims."
  },
  hi: {
    navHome: "मुख्य पृष्ठ",
    navFinder: "योजनाएं खोजें",
    navDashboard: "डैशबोर्ड",
    navComplaint: "शिकायत निवारण",
    navTracker: "आवेदन ट्रैकर",
    navAdmin: "प्रशासन",
    navLogin: "साइन इन करें",
    navRegister: "खाता बनाएं",
    navLogout: "साइन आउट",
    heroTitle: "उन सरकारी योजनाओं को खोजें जिनके आप पात्र हैं",
    heroSubtitle: "सुविधा 2.0 AI-संचालित पात्रता फ़िल्टरिंग और RAG तकनीक का उपयोग करके नागरिकों को 3,400+ योजनाओं से जोड़ता है।",
    ctaCheckEligibility: "पात्रता की जांच करें",
    ctaExploreSchemes: "योजनाएं देखें",
    aiSearchPlaceholder: "अपनी भाषा में योजना के बारे में पूछें (उदा. 'कॉलेज छात्रों के लिए छात्रवृत्ति')...",
    searchBtn: "खोजें",
    matchScore: "सुविधा मैच स्कोर",
    whyAmISeeingThis: "मुझे यह सिफारिश क्यों दिख रही है?",
    saveScheme: "योजना सहेजें",
    saved: "सहेजा गया",
    compare: "तुलना करें",
    viewDetails: "पात्रता विवरण",
    officialSource: "आधिकारिक सरकारी पोर्टल",
    requiredDocs: "आवश्यक दस्तावेज",
    documentAssistant: "दस्तावेज़ चेकलिस्ट सहायक",
    applicationStatus: "आवेदन की स्थिति",
    filterState: "राज्य / केंद्र शासित प्रदेश",
    filterCategory: "कल्याण श्रेणी",
    filterIncome: "वार्षिक आय (₹)",
    filterAge: "आयु (वर्ष)",
    filterGender: "लिंग",
    filterOccupation: "व्यवसाय",
    clearFilters: "फ़िल्टर हटाएं",
    noResultsTitle: "कोई मेल खाती योजनाएं नहीं मिलीं",
    noResultsDesc: "कृपया अपने विवरण फ़िल्टर बदलें या नया प्रश्न खोजें।",
    trustBadgeTitle: "100% सत्यापित सरकारी डेटासेट",
    trustBadgeDesc: "आधिकारिक सरकारी पोर्टलों के सीधे लिंक के साथ सुरक्षित सेवाएं।"
  },
  bn: {
    navHome: "মূল পাতা",
    navFinder: "প্রকল্প অনুসন্ধান",
    navDashboard: "ড্যাশবোর্ড",
    navComplaint: "অভিযোগ প্রতিকার",
    navTracker: "আবেদন ট্র্যাকার",
    navAdmin: "এডমিন",
    navLogin: "সাইন ইন",
    navRegister: "একাউন্ট তৈরি করুন",
    navLogout: "সাইন আউট",
    heroTitle: "আপনার জন্য যোগ্য সরকারি প্রকল্পগুলি খুঁজুন",
    heroSubtitle: "সুবিধা ২.০ কৃত্রিম বুদ্ধিমত্তা চালিত ফিল্টারিং এবং RAG অনুসন্ধানের মাধ্যমে ৩,৪০০+ সরকারি প্রকল্প নাগরিকদের কাছে পৌঁছে দেয়।",
    ctaCheckEligibility: "যোগ্যতা যাচাই করুন",
    ctaExploreSchemes: "প্রকল্পগুলি দেখুন",
    aiSearchPlaceholder: "সহজ ভাষায় লিখুন (যেমন 'পশ্চিমবঙ্গের ছাত্রছাত্রীদের জন্য স্কলারশিপ')...",
    searchBtn: "অনুসন্ধান",
    matchScore: "সুবিধা ম্যাচ স্কোর",
    whyAmISeeingThis: "কেন এটি সুপারিশ করা হয়েছে?",
    saveScheme: "সংরক্ষণ করুন",
    saved: "সংরক্ষিত",
    compare: "তুলনা করুন",
    viewDetails: "বিস্তারিত যোগ্যতা",
    officialSource: "সরকারি অফিসিয়াল পোর্টাল",
    requiredDocs: "প্রয়োজনীয় নথি",
    documentAssistant: "নথি চেকলিস্ট সহায়ক",
    applicationStatus: "আবেদনের অবস্থা",
    filterState: "রাজ্য",
    filterCategory: "বিভাগ",
    filterIncome: "বার্ষিক আয় (₹)",
    filterAge: "বয়স (বছর)",
    filterGender: "লিঙ্গ",
    filterOccupation: "পেশা",
    clearFilters: "ফিল্টার মুছুন",
    noResultsTitle: "কোন উপযুক্ত সরকারি প্রকল্প পাওয়া যায়নি",
    noResultsDesc: "অনুগ্রহ করে আপনার ফিল্টার পরিবর্তন করুন অথবা নতুন প্রশ্ন লিখুন।",
    trustBadgeTitle: "১০০% যাচাইকৃত সরকারি তথ্য",
    trustBadgeDesc: "সরাসরি অফিসিয়াল পোর্টালের সাথে সংযুক্ত স্বচ্ছ ও নির্ভরযোগ্য সেবা।"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('suvidha_lang') || 'en');

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('suvidha_lang', lang);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
