/**
 * hospitalLocalization.ts
 * Clinical Multi-Language Data Localization Engine (English, Hindi, Punjabi)
 * Automatically translates hospital names, cities, types, specialties,
 * diseases, accreditations, metrics, and tariffs.
 */

export type SupportedLanguage = 'en' | 'hi' | 'pa';

export const CITIES_MAP: Record<string, { hi: string; pa: string }> = {
  'hoshiarpur': { hi: 'होशियारपुर', pa: 'ਹੁਸ਼ਿਆਰਪੁਰ' },
  'chandigarh': { hi: 'चंडीगढ़', pa: 'ਚੰਡੀਗੜ੍ਹ' },
  'mohali': { hi: 'मोहाली', pa: 'ਮੋਹਾਲੀ' },
  'panchkula': { hi: 'पंचकुला', pa: 'ਪੰਚਕੂਲਾ' },
  'ludhiana': { hi: 'लुधियाना', pa: 'ਲੁਧਿਆਣਾ' },
  'amritsar': { hi: 'अमृतसर', pa: 'ਅੰਮ੍ਰਿਤਸਰ' },
  'jalandhar': { hi: 'जालंधर', pa: 'ਜਲੰਧਰ' },
  'patiala': { hi: 'पटियाला', pa: 'ਪਟਿਆਲਾ' },
  'bathinda': { hi: 'बठिंडा', pa: 'ਬਠਿੰਡਾ' },
  'pathankot': { hi: 'पठानकोट', pa: 'ਪਠਾਨਕੋਟ' },
  'ambala': { hi: 'अंबाला', pa: 'ਅੰਬਾਲਾ' },
  'karnal': { hi: 'करनाल', pa: 'ਕਰਨਾਲ' },
  'rohtak': { hi: 'रोहतक', pa: 'ਰੋਹਤਕ' },
  'delhi': { hi: 'दिल्ली', pa: 'ਦਿੱਲੀ' },
  'new delhi': { hi: 'नई दिल्ली', pa: 'ਨਵੀਂ ਦਿੱਲੀ' },
  'noida': { hi: 'नोएडा', pa: 'ਨੋਇਡਾ' },
  'greater noida': { hi: 'ग्रेटर नोएडा', pa: 'ਗ੍ਰੇਟਰ ਨੋਇਡਾ' },
  'gurugram': { hi: 'गुरुग्राम', pa: 'ਗੁਰੂਗ੍ਰਾਮ' },
  'gurgaon': { hi: 'गुरुग्राम', pa: 'ਗੁਰੂਗ੍ਰਾਮ' },
  'faridabad': { hi: 'फ़रीदाबाद', pa: 'ਫ਼ਰੀਦਾਬਾਦ' },
  'ghaziabad': { hi: 'गाज़ियाबाद', pa: 'ਗਾਜ਼ੀਆਬਾਦ' },
  'jaipur': { hi: 'जयपुर', pa: 'ਜੈਪੁਰ' },
  'jodhpur': { hi: 'जोधपुर', pa: 'ਜੋਧਪੁਰ' },
  'shimla': { hi: 'शिमला', pa: 'ਸ਼ਿਮਲਾ' },
  'dehradun': { hi: 'देहरादून', pa: 'ਦੇਹਰਾਦੂਨ' },
  'jammu': { hi: 'जम्मू', pa: 'ਜੰਮੂ' },
  'srinagar': { hi: 'श्रीनगर', pa: 'ਸ੍ਰੀਨਗਰ' },
  'bengaluru': { hi: 'बेंगलुरु', pa: 'ਬੰਗਲੌਰ' },
  'bangalore': { hi: 'बेंगलुरु', pa: 'ਬੰਗਲੌਰ' },
  'mysuru': { hi: 'मैसूर', pa: 'ਮੈਸੂਰ' },
  'mumbai': { hi: 'मुंबई', pa: 'ਮੁੰਬਈ' },
  'navi mumbai': { hi: 'नवी मुंबई', pa: 'ਨਵੀਂ ਮੁੰਬਈ' },
  'pune': { hi: 'पुणे', pa: 'ਪੁਣੇ' },
  'hyderabad': { hi: 'हैदराबाद', pa: 'ਹੈਦਰਾਬਾਦ' },
  'chennai': { hi: 'चेन्नई', pa: 'ਚੇਨਈ' },
  'kolkata': { hi: 'कोलकाता', pa: 'ਕੋਲਕਾਤਾ' },
  'lucknow': { hi: 'लखनऊ', pa: 'ਲਖਨਊ' },
  'kanpur': { hi: 'कानपुर', pa: 'ਕਾਨਪੁਰ' },
  'varanasi': { hi: 'वाराणसी', pa: 'ਵਾਰਾਣਸੀ' },
  'patna': { hi: 'पटना', pa: 'ਪਟਨਾ' },
  'ahmedabad': { hi: 'अहमदाबाद', pa: 'ਅਹਿਮਦਾਬਾਦ' },
  'surat': { hi: 'सूरत', pa: 'ਸੂਰਤ' },
  'indore': { hi: 'इंदौर', pa: 'ਇੰਦੌਰ' },
  'bhopal': { hi: 'भोपाल', pa: 'ਭੋਪਾਲ' },
  'kochi': { hi: 'कोच्चि', pa: 'ਕੋਚੀ' },
  'thiruvananthapuram': { hi: 'तिरुवनंतपुरम', pa: 'ਤਿਰੂਵਨੰਤਪੁਰਮ' },
  'punjab': { hi: 'पंजाब', pa: 'ਪੰਜਾਬ' },
  'haryana': { hi: 'हरियाणा', pa: 'ਹਰਿਆਣਾ' },
  'karnataka': { hi: 'कर्नाटक', pa: 'ਕਰਨਾਟਕ' },
  'maharashtra': { hi: 'महाराष्ट्र', pa: 'ਮਹਾਰਾਸ਼ਟਰ' },
  'india': { hi: 'भारत', pa: 'ਭਾਰਤ' }
};

export const SPECIALTIES_MAP: Record<string, { hi: string; pa: string }> = {
  'emergency & trauma': { hi: 'आपातकालीन एवं ट्रॉमा', pa: 'ਐਮਰਜੈਂਸੀ ਅਤੇ ਟਰੌਮਾ' },
  'general & laparoscopic surgery': { hi: 'सामान्य एवं लेप्रोस्कोपिक सर्जरी', pa: 'ਜਨਰਲ ਅਤੇ ਲੈਪਰੋਸਕੋਪਿਕ ਸਰਜਰੀ' },
  'maternity & gynecology': { hi: 'मातृत्व एवं स्त्री रोग', pa: 'ਜਣੇਪਾ ਅਤੇ ਇਸਤਰੀ ਰੋਗ' },
  'heart care': { hi: 'हृदय रोग एवं देखभाल', pa: 'ਦਿਲ ਦੇ ਰੋਗ ਅਤੇ ਸੰਭਾਲ' },
  'cardiology': { hi: 'हृदय रोग (कार्डियोलॉजी)', pa: 'ਦਿਲ ਦੇ ਰੋਗ (ਕਾਰਡੀਓਲੋਜੀ)' },
  'pulmonology & chest': { hi: 'श्वसन एवं छाती रोग', pa: 'ਸਾਹ ਅਤੇ ਛਾਤੀ ਦੇ ਰੋਗ' },
  'cancer care': { hi: 'कैंसर रोग एवं देखभाल', pa: 'ਕੈਂਸਰ ਰੋਗ ਅਤੇ ਸੰਭਾਲ' },
  'oncology': { hi: 'कैंसर रोग (ऑन्कोलॉजी)', pa: 'ਕੈਂਸਰ ਰੋਗ (ਓਨਕੋਲੋਜੀ)' },
  'bone & joint': { hi: 'हड्डी एवं जोड़ रोग', pa: 'ਹੱਡੀਆਂ ਅਤੇ ਜੋੜਾਂ ਦੇ ਰੋਗ' },
  'orthopedics': { hi: 'हड्डी रोग (ऑर्थोपेडिक्स)', pa: 'ਹੱਡੀਆਂ ਦੇ ਰੋਗ (ਆਰਥੋਪੈਡਿਕਸ)' },
  'child care': { hi: 'बाल रोग एवं शिशु देखभाल', pa: 'ਬਾਲ ਰੋਗ ਅਤੇ ਬੱਚਿਆਂ ਦੀ ਸੰਭਾਲ' },
  'pediatrics': { hi: 'बाल रोग', pa: 'ਬਾਲ ਰੋਗ' },
  'neurology & brain': { hi: 'न्यूरोलॉजी एवं मस्तिष्क रोग', pa: 'ਨਿਊਰੋਲੋਜੀ ਅਤੇ ਦਿਮਾਗੀ ਰੋਗ' },
  'neurology': { hi: 'न्यूरोलॉजी', pa: 'ਨਿਊਰੋਲੋਜੀ' },
  'eye care': { hi: 'नेत्र रोग एवं दृष्टि देखभाल', pa: 'ਅੱਖਾਂ ਦੇ ਰੋਗ ਅਤੇ ਦੇਖਭਾਲ' },
  'ophthalmology': { hi: 'नेत्र रोग', pa: 'ਅੱਖਾਂ ਦੇ ਰੋਗ' },
  'kidney care': { hi: 'गुर्दा रोग एवं डायलिसिस', pa: 'ਗੁਰਦਾ ਰੋਗ ਅਤੇ ਡਾਇਲਸਿਸ' },
  'nephrology': { hi: 'नेफ्रोलॉजी (गुर्दा रोग)', pa: 'ਨੈਫਰੋਲੋਜੀ (ਗੁਰਦਾ ਰੋਗ)' },
  'gastroenterology': { hi: 'पेट एवं पाचन रोग', pa: 'ਪੇਟ ਅਤੇ ਪਾਚਨ ਰੋਗ' },
  'gastro': { hi: 'गैस्ट्रोएंटरोलॉजी', pa: 'ਗੈਸਟ੍ਰੋਐਂਟਰੋਲੋਜੀ' },
  'general surgery': { hi: 'सामान्य सर्जरी', pa: 'ਜਨਰਲ ਸਰਜਰੀ' },
  'emergency': { hi: 'आपातकालीन देखभाल', pa: 'ਐਮਰਜੈਂਸੀ ਦੇਖਭਾਲ' },
  'gynecology': { hi: 'स्त्री रोग', pa: 'ਇਸਤਰੀ ਰੋਗ' }
};

export const DISEASES_MAP: Record<string, { hi: string; pa: string }> = {
  'high-risk pregnancy / obstructed labor': { hi: 'उच्च जोखिम गर्भावस्था / प्रसव जटिलता', pa: 'ਉੱਚ-ਜ਼ੋਖਮ ਗਰਭ ਅਵਸਥਾ / ਜਣੇਪਾ ਸਮੱਸਿਆ' },
  'senile cataract & vision impairment': { hi: 'मोतियाबिंद एवं दृष्टि दोष', pa: 'ਮੋਤੀਆਬਿੰਦ ਅਤੇ ਨਜ਼ਰ ਦੀ ਕਮਜ਼ੋਰੀ' },
  'cholelithiasis (gallbladder stones)': { hi: 'पित्ताशय की पथरी (पित्त की थैली)', pa: 'ਪਿੱਤੇ ਦੀ ਪੱਥਰੀ' },
  'chronic kidney disease (stage 5 / esrd)': { hi: 'क्रोनिक किडनी रोग (डायलिसिस)', pa: 'ਗੰਭੀਰ ਗੁਰਦਾ ਰੋਗ (ਡਾਇਲਸਿਸ)' },
  'solid tumors (carcinoma breast / lung / colon)': { hi: 'ठोस ट्यूमर (कैंसर उपचार)', pa: 'ਟਿਊਮਰ (ਕੈਂਸਰ ਇਲਾਜ)' },
  'coronary artery disease (cad) / heart attack': { hi: 'हृदय रोग (सीएडी) / हार्ट अटैक', pa: 'ਦਿਲ ਦੀ ਬਿਮਾਰੀ (ਸੀਏਡੀ) / ਦਿਲ ਦਾ ਦੌਰਾ' },
  'kidney & ureteric calculi (stones)': { hi: 'गुर्दे एवं मूत्र पथ की पथरी', pa: 'ਗੁਰਦੇ ਅਤੇ ਪਿਸ਼ਾਬ ਨਾਲੀ ਦੀ ਪੱਥਰੀ' },
  'severe knee osteoarthritis': { hi: 'घुटने का गंभीर गठिया (जोड़ प्रत्यारोपण)', pa: 'ਗੋਡੇ ਦਾ ਗੰਭੀਰ ਗਠੀਆ (ਜੋੜ ਬਦਲਣਾ)' },
  'inguinal / abdominal wall hernia': { hi: 'हर्निया उपचार एवं सर्जरी', pa: 'ਹਰਨੀਆ ਦਾ ਇਲਾਜ ਅਤੇ ਸਰਜਰੀ' },
  'heart attack / cad': { hi: 'हार्ट अटैक / सीएडी', pa: 'ਦਿਲ ਦਾ ਦੌਰਾ / ਸੀਏਡੀ' },
  'knee osteoarthritis': { hi: 'घुटने का गठिया', pa: 'ਗੋਡੇ ਦਾ ਗਠੀਆ' },
  'kidney stones': { hi: 'गुर्दे की पथरी', pa: 'ਗੁਰਦੇ ਦੀ ਪੱਥਰੀ' },
  'dialysis': { hi: 'डायलिसिस', pa: 'ਡਾਇਲਸਿਸ' },
  'gallbladder stones': { hi: 'पित्ताशय की पथरी', pa: 'ਪਿੱਤੇ ਦੀ ਪੱਥਰੀ' },
  'cataract': { hi: 'मोतियाबिंद', pa: 'ਮੋਤੀਆਬਿੰਦ' },
  'hernia': { hi: 'हर्निया', pa: 'ਹਰਨੀਆ' }
};

export const HOSPITAL_NAMES_MAP: Record<string, { hi: string; pa: string }> = {
  'pgimer chandigarh': { hi: 'पीजीआईएमईआर चंडीगढ़', pa: 'ਪੀਜੀਆਈਐਮਈਆਰ ਚੰਡੀਗੜ੍ਹ' },
  'pgimer': { hi: 'पीजीआईएमईआर', pa: 'ਪੀਜੀਆਈਐਮਈਆਰ' },
  'max super speciality hospital': { hi: 'मैक्स सुपर स्पेशलिटी अस्पताल', pa: 'ਮੈਕਸ ਸੁਪਰ ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' },
  'max mohali': { hi: 'मैक्स मोहाली', pa: 'ਮੈਕਸ ਮੋਹਾਲੀ' },
  'fortis hospital mohali': { hi: 'फोर्टिस अस्पताल मोहाली', pa: 'ਫੋਰਟਿਸ ਹਸਪਤਾਲ ਮੋਹਾਲੀ' },
  'fortis mohali': { hi: 'फोर्टिस मोहाली', pa: 'ਫੋਰਟਿਸ ਮੋਹਾਲੀ' },
  'civil hospital hoshiarpur': { hi: 'सिविल अस्पताल होशियारपुर', pa: 'ਸਿਵਲ ਹਸਪਤਾਲ ਹੁਸ਼ਿਆਰਪੁਰ' },
  'civil hosp': { hi: 'सिविल अस्पताल', pa: 'ਸਿਵਲ ਹਸਪਤਾਲ' },
  'ivy hospital hoshiarpur': { hi: 'आईवी अस्पताल होशियारपुर', pa: 'ਆਈਵੀ ਹਸਪਤਾਲ ਹੁਸ਼ਿਆਰਪੁਰ' },
  'ivy hosp': { hi: 'आईवी अस्पताल', pa: 'ਆਈਵੀ ਹਸਪਤਾਲ' },
  'ivy hospital': { hi: 'आईवी अस्पताल', pa: 'ਆਈਵੀ ਹਸਪਤਾਲ' },
  'apollo hospitals, bannerghatta': { hi: 'अपोलो अस्पताल, बन्नेरघट्टा', pa: 'ਅਪੋਲੋ ਹਸਪਤਾਲ, ਬੈਨਰਘੱਟਾ' },
  'sakra world hospital': { hi: 'सक्रा वर्ल्ड अस्पताल', pa: 'ਸਕਰਾ ਵਰਲਡ ਹਸਪਤਾਲ' },
  'manipal hospital': { hi: 'मणिपाल अस्पताल', pa: 'ਮਨੀਪਾਲ ਹਸਪਤਾਲ' },
  'aster cmi hospital': { hi: 'एस्टर सीएमआई अस्पताल', pa: 'ਐਸਟਰ ਸੀਐਮਆਈ ਹਸਪਤਾਲ' },
  'medanta the medicity centre': { hi: 'मेदांता द मेडिसिटी सेंटर', pa: 'ਮੇਦਾਂਤਾ ਦ ਮੈਡੀਸਿਟੀ ਸੈਂਟਰ' },
  'medanta - the medicity': { hi: 'मेदांता - द मेडिसिटी', pa: 'ਮੇਦਾਂਤਾ - ਦ ਮੈਡੀਸਿਟੀ' },
  'aiims delhi': { hi: 'एम्स दिल्ली', pa: 'ਏਮਜ਼ ਦਿੱਲੀ' },
  'aiims new delhi': { hi: 'एम्स नई दिल्ली', pa: 'ਏਮਜ਼ ਨਵੀਂ ਦਿੱਲੀ' }
};

export function localizeCity(city: string, lang: string): string {
  if (!city || lang === 'en') return city;
  const key = city.trim().toLowerCase();
  const found = CITIES_MAP[key];
  if (found) return found[lang as 'hi' | 'pa'] || city;
  return city;
}

export function localizeSpecialty(spec: string, lang: string): string {
  if (!spec || lang === 'en') return spec;
  const key = spec.trim().toLowerCase();
  const found = SPECIALTIES_MAP[key];
  if (found) return found[lang as 'hi' | 'pa'] || spec;
  return spec;
}

export function localizeDisease(disease: string, lang: string): string {
  if (!disease || lang === 'en') return disease;
  const key = disease.trim().toLowerCase();
  const found = DISEASES_MAP[key];
  if (found) return found[lang as 'hi' | 'pa'] || disease;
  return disease;
}

export function localizeHospitalType(type: string, lang: string): string {
  if (!type || lang === 'en') return type;
  const t = type.toLowerCase();
  if (t === 'government') return lang === 'hi' ? 'सरकारी' : 'ਸਰਕਾਰੀ';
  if (t === 'private') return lang === 'hi' ? 'निजी' : 'ਨਿੱਜੀ';
  if (t === 'trust') return lang === 'hi' ? 'ट्रस्ट / धर्मार्थ' : 'ਟਰੱਸਟ / ਚੈਰੀਟੇਬਲ';
  return type;
}

export function localizeAccreditation(accred: string, lang: string): string {
  if (!accred || lang === 'en') return accred;
  const a = accred.toLowerCase();
  if (a.includes('nabh')) return lang === 'hi' ? 'एनएबीएच मान्यता प्राप्त' : 'ਐਨ.ਏ.ਬੀ.ਐਚ. ਪ੍ਰਮਾਣਿਤ';
  if (a.includes('jci')) return lang === 'hi' ? 'जेसीआई अंतर्राष्ट्रीय मान्यता' : 'ਜੇ.ਸੀ.ਆਈ. ਅੰਤਰਰਾਸ਼ਟਰੀ ਪ੍ਰਮਾਣਿਤ';
  if (a.includes('nqas')) return lang === 'hi' ? 'एनक्यूएएस प्रमाणित' : 'ਐਨ.ਕਿਊ.ਏ.ਐਸ. ਪ੍ਰਮਾਣਿਤ';
  if (a.includes('apex')) return lang === 'hi' ? 'शीर्ष स्वायत्त संस्थान' : 'ਸਿਖਰਲੀ ਖ਼ੁਦਮੁਖ਼ਤਿਆਰ ਸੰਸਥਾ';
  if (a.includes('trauma')) return lang === 'hi' ? 'लेवल 1 ट्रॉमा सेंटर 24x7' : 'ਲੈਵਲ 1 ਟਰੌਮਾ ਸੈਂਟਰ 24x7';
  return accred;
}

export function localizeTurnaround(turnaround: string, lang: string): string {
  if (!turnaround || lang === 'en') return turnaround;
  const t = turnaround.toLowerCase();
  if (t.includes('instant') || t.includes('cashless')) return lang === 'hi' ? 'तत्काल (कैशलेस)' : 'ਤੁਰੰਤ (ਕੈਸ਼ਲੈਸ)';
  if (t.includes('20-30')) return lang === 'hi' ? '20-30 मिनट' : '20-30 ਮਿੰਟ';
  if (t.includes('18')) return lang === 'hi' ? '18 मिनट' : '18 ਮਿੰਟ';
  if (t.includes('25')) return lang === 'hi' ? '25 मिनट' : '25 ਮਿੰਟ';
  if (t.includes('28')) return lang === 'hi' ? '28 मिनट' : '28 ਮਿੰਟ';
  if (t.includes('15')) return lang === 'hi' ? '15 मिनट' : '15 ਮਿੰਟ';
  if (t.includes('22')) return lang === 'hi' ? '22 मिनट' : '22 ਮਿੰਟ';
  return turnaround;
}

export function localizeTariff(tariff: string, lang: string): string {
  if (!tariff || lang === 'en') return tariff;
  const t = tariff.toLowerCase();
  if (t.includes('100% free') || t.includes('subsidized')) return lang === 'hi' ? '100% मुफ्त / रियायती' : '100% ਮੁਫ਼ਤ / ਸਬਸਿਡੀ ਵਾਲਾ';
  if (t.includes('free / pmjay')) return lang === 'hi' ? 'मुफ्त / पीएमजेएवाई' : 'ਮੁਫ਼ਤ / ਪੀਐਮਜੇਏਵਾਈ';
  if (t.includes('free ward')) return lang === 'hi' ? 'मुफ्त वार्ड' : 'ਮੁਫ਼ਤ ਵਾਰਡ';
  if (t.includes('subsidized ward')) return lang === 'hi' ? 'रियायती वार्ड' : 'ਸਬਸਿਡੀ ਵਾਲਾ ਵਾਰਡ';
  if (t.includes('deposit') && (t.includes('0') || t.includes('₹0'))) return lang === 'hi' ? '₹0 अग्रिम जमा' : '₹0 ਅਗਾਊਂ ਜਮ੍ਹਾਂ';
  return tariff;
}

export function localizeHospitalName(name: string, lang: string): string {
  if (!name || lang === 'en') return name;
  const key = name.trim().toLowerCase();
  if (HOSPITAL_NAMES_MAP[key]) {
    return HOSPITAL_NAMES_MAP[key][lang as 'hi' | 'pa'];
  }

  let result = name;

  const chains: [string, { hi: string; pa: string }][] = [
    ['Civil District Hospital', { hi: 'सिविल जिला अस्पताल', pa: 'ਸਿਵਲ ਜ਼ਿਲ੍ਹਾ ਹਸਪਤਾਲ' }],
    ['Civil Hospital', { hi: 'सिविल अस्पताल', pa: 'ਸਿਵਲ ਹਸਪਤਾਲ' }],
    ['AIIMS', { hi: 'एम्स', pa: 'ਏਮਜ਼' }],
    ['Apollo Super Speciality Hospital', { hi: 'अपोलो सुपर स्पेशलिटी अस्पताल', pa: 'ਅਪੋਲੋ ਸੁਪਰ ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
    ['Apollo Hospitals', { hi: 'अपोलो अस्पताल', pa: 'ਅਪੋਲੋ ਹਸਪਤਾਲ' }],
    ['Fortis Escorts Healthcare Centre', { hi: 'फोर्टिस एस्कॉर्ट्स हेल्थकेयर सेंटर', pa: 'ਫੋਰਟਿਸ ਐਸਕੌਰਟਸ ਹੈਲਥਕੇਅਰ ਸੈਂਟਰ' }],
    ['Fortis Hospital', { hi: 'फोर्टिस अस्पताल', pa: 'ਫੋਰਟਿਸ ਹਸਪਤਾਲ' }],
    ['Max Super Speciality Hospital', { hi: 'मैक्स सुपर स्पेशलिटी अस्पताल', pa: 'ਮੈਕਸ ਸੁਪਰ ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
    ['Manipal Tertiary Care Hospital', { hi: 'मणिपाल टर्शियरी केयर अस्पताल', pa: 'ਮਨੀਪਾਲ ਟਰਸ਼ਰੀ ਕੇਅਰ ਹਸਪਤਾਲ' }],
    ['Manipal Hospital', { hi: 'मणिपाल अस्पताल', pa: 'ਮਨੀਪਾਲ ਹਸਪਤਾਲ' }],
    ['Narayana Multispeciality Hospital', { hi: 'नारायणा मल्टीस्पेशलिटी अस्पताल', pa: 'ਨਾਰਾਇਣਾ ਮਲਟੀਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
    ['Aster Prime Super Speciality Hospital', { hi: 'एस्टर प्राइम सुपर स्पेशलिटी अस्पताल', pa: 'ਐਸਟਰ ਪ੍ਰਾਈਮ ਸੁਪਰ ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
    ['Care Hospitals & Heart Institute', { hi: 'केयर हॉस्पिटल्स एवं हार्ट इंस्टीट्यूट', pa: 'ਕੇਅਰ ਹਸਪਤਾਲ ਅਤੇ ਦਿਲ ਇੰਸਟੀਚਿਊਟ' }],
    ['KIMS Global Medical Hospital', { hi: 'किम्स ग्लोबल मेडिकल अस्पताल', pa: 'ਕਿਮਜ਼ ਗਲੋਬਲ ਮੈਡੀਕਲ ਹਸਪਤਾਲ' }],
    ['Sahyadri Speciality Hospital', { hi: 'सह्याद्री स्पेशलिटी अस्पताल', pa: 'ਸਹਿਯਾਦਰੀ ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
    ['Medanta The Medicity Centre', { hi: 'मेदांता द मेडिसिटी सेंटर', pa: 'ਮੇਦਾਂਤਾ ਦ ਮੈਡੀਸਿਟੀ ਸੈਂਟਰ' }],
    ['Ruby Hall Clinic & Institute', { hi: 'रूबी हॉल क्लिनिक एवं संस्थान', pa: 'ਰੂਬੀ ਹਾਲ ਕਲੀਨਿਕ ਅਤੇ ਸੰਸਥਾ' }],
    ['Ramakrishna Mission Seva Pratishthan', { hi: 'रामकृष्ण मिशन सेवा प्रतिष्ठान', pa: 'ਰਾਮਕ੍ਰਿਸ਼ਨ ਮਿਸ਼ਨ ਸੇਵਾ ਪ੍ਰਤਿਸ਼ਠਾਨ' }],
    ["St. Luke's Mission Hospital", { hi: 'सेंट ल्यूक्स मिशन अस्पताल', pa: 'ਸੇਂਟ ਲਿਊਕਸ ਮਿਸ਼ਨ ਹਸਪਤਾਲ' }],
    ['Super Speciality Hospital', { hi: 'सुपर स्पेशलिटी अस्पताल', pa: 'ਸੁਪਰ ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
    ['Multispeciality Hospital', { hi: 'मल्टीस्पेशलिटी अस्पताल', pa: 'ਮਲਟੀਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
    ['Speciality Hospital', { hi: 'स्पेशलिटी अस्पताल', pa: 'ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
    ['Hospital', { hi: 'अस्पताल', pa: 'ਹਸਪਤਾਲ' }],
    ['Clinic', { hi: 'क्लिनिक', pa: 'ਕਲੀਨਿਕ' }],
    ['Centre', { hi: 'सेंटर', pa: 'ਸੈਂਟਰ' }],
    ['Center', { hi: 'सेंटर', pa: 'ਸੈਂਟਰ' }]
  ];

  for (const [enPattern, trans] of chains) {
    if (result.includes(enPattern)) {
      result = result.replace(enPattern, trans[lang as 'hi' | 'pa']);
      break;
    }
  }

  for (const [cityKey, cityTrans] of Object.entries(CITIES_MAP)) {
    const regex = new RegExp(`\\b${cityKey}\\b`, 'i');
    if (regex.test(result)) {
      result = result.replace(regex, cityTrans[lang as 'hi' | 'pa']);
    }
  }

  return result;
}

export function localizeAddress(address: string, lang: string): string {
  if (!address || lang === 'en') return address;
  let res = address;

  const terms: [string, { hi: string; pa: string }][] = [
    ['Sector', { hi: 'सेक्टर', pa: 'ਸੈਕਟਰ' }],
    ['Phase', { hi: 'फेज़', pa: 'ਫੇਜ਼' }],
    ['Road', { hi: 'रोड', pa: 'ਰੋਡ' }],
    ['Rd', { hi: 'रोड', pa: 'ਰੋਡ' }],
    ['Near', { hi: 'निकट', pa: 'ਨੇੜੇ' }],
    ['Opposite', { hi: 'सामने', pa: 'ਸਾਹਮਣੇ' }],
    ['Mall Road', { hi: 'माल रोड', pa: 'ਮਾਲ ਰੋਡ' }],
    ['District', { hi: 'जिला', pa: 'ਜ਼ਿਲ੍ਹਾ' }]
  ];

  for (const [term, trans] of terms) {
    const reg = new RegExp(`\\b${term}\\b`, 'i');
    res = res.replace(reg, trans[lang as 'hi' | 'pa']);
  }

  for (const [cityKey, cityTrans] of Object.entries(CITIES_MAP)) {
    const regex = new RegExp(`\\b${cityKey}\\b`, 'i');
    if (regex.test(res)) {
      res = res.replace(regex, cityTrans[lang as 'hi' | 'pa']);
    }
  }

  return res;
}

export function localizeMetric(label: string, value: string, lang: string): { label: string; value: string } {
  if (lang === 'en') return { label, value };

  let locLabel = label;
  const lKey = label.toLowerCase();
  if (lKey.includes('live icu') || lKey === 'icu') {
    locLabel = lang === 'hi' ? 'लाइव आईसीयू' : 'ਲਾਈਵ ਆਈ.ਸੀ.ਯੂ.';
  } else if (lKey.includes('accreditation')) {
    locLabel = lang === 'hi' ? 'मान्यता' : 'ਮਾਨਤਾ';
  } else if (lKey.includes('pre-auth') || lKey.includes('turnaround')) {
    locLabel = lang === 'hi' ? 'कैशलेस प्री-ऑथ' : 'ਕੈਸ਼ਲੈਸ ਪ੍ਰੀ-ਔਥ';
  } else if (lKey.includes('total beds') || lKey.includes('beds available')) {
    locLabel = lang === 'hi' ? 'कुल बेड' : 'ਕੁੱਲ ਬੈੱਡ';
  }

  let locValue = value;
  const vKey = value.toLowerCase();
  if (vKey.includes('open icu') || vKey.includes('icu')) {
    const match = value.match(/(\d+)/);
    const count = match ? match[1] : '';
    locValue = lang === 'hi' ? `${count} खाली आईसीयू` : `${count} ਖਾਲੀ ਆਈ.ਸੀ.ਯੂ.`;
  } else if (vKey.includes('total')) {
    const match = value.match(/(\d+)/);
    const count = match ? match[1] : '';
    locValue = lang === 'hi' ? `${count} कुल बेड` : `${count} ਕੁੱਲ ਬੈੱਡ`;
  } else if (vKey.includes('beds available') || vKey.includes('open now')) {
    const match = value.match(/(\d+)/);
    const count = match ? match[1] : '';
    locValue = lang === 'hi' ? `${count} बेड उपलब्ध` : `${count} ਬੈੱਡ ਉਪਲਬਧ`;
  } else if (vKey.includes('instant') || vKey.includes('cashless')) {
    locValue = lang === 'hi' ? 'तत्काल (कैशलेस)' : 'ਤੁਰੰਤ (ਕੈਸ਼ਲੈਸ)';
  } else if (vKey.includes('min')) {
    locValue = value.replace(/mins?|minutes?/i, lang === 'hi' ? 'मिनट' : 'ਮਿੰਟ');
  } else {
    locValue = localizeAccreditation(value, lang);
  }

  return { label: locLabel, value: locValue };
}

export function localizeTag(tag: string, lang: string): string {
  if (lang === 'en') return tag;
  const t = tag.toLowerCase();
  if (t.includes('pmjay') || t.includes('cashless')) {
    return lang === 'hi' ? 'पीएमजेएवाई / कैशलेस' : 'ਪੀਐਮਜੇਏਵਾਈ / ਕੈਸ਼ਲੈਸ';
  }
  if (t.includes('trauma')) {
    return lang === 'hi' ? 'ट्रॉमा सेंटर 24x7' : 'ਟਰੌਮਾ ਸੈਂਟਰ 24x7';
  }
  return localizeSpecialty(tag, lang);
}

export function localizeHospital<T extends Record<string, any>>(hospital: T, lang: string): T {
  if (!hospital || lang === 'en') return hospital;

  const locName = localizeHospitalName(hospital.name || '', lang);
  const locCity = localizeCity(hospital.city || '', lang);
  const locState = localizeCity(hospital.state || '', lang);
  const locAddress = localizeAddress(hospital.address || '', lang);
  const locType = localizeHospitalType(hospital.type || hospital.typeRaw || '', lang);
  const locAccreditation = localizeAccreditation(hospital.accreditation || hospital.qualityBadge || '', lang);
  const locTurnaround = localizeTurnaround(hospital.turnaround || '', lang);
  const locTariff = localizeTariff(hospital.cost_indicative || hospital.deluxeTariff || '', lang);
  const locDisease = hospital.top_disease_treated || hospital.topDisease
    ? localizeDisease(hospital.top_disease_treated || hospital.topDisease, lang)
    : undefined;

  const locSpecialties = Array.isArray(hospital.specialties)
    ? hospital.specialties.map((s: string) => localizeSpecialty(s, lang))
    : hospital.specialties;

  const locMetrics = Array.isArray(hospital.metrics)
    ? hospital.metrics.map((m: any) => {
        const localized = localizeMetric(m.label, m.value, lang);
        return { ...m, label: localized.label, value: localized.value };
      })
    : hospital.metrics;

  const locTags = Array.isArray(hospital.tags)
    ? hospital.tags.map((tag: any) => {
        if (typeof tag === 'string') return localizeTag(tag, lang);
        if (tag && typeof tag.label === 'string') {
          return { ...tag, label: localizeTag(tag.label, lang) };
        }
        return tag;
      })
    : hospital.tags;

  const liveIcuCount = hospital.beds_icu_available ?? hospital.liveIcu ?? 5;
  const roomAvailable = lang === 'hi'
    ? `${Math.max(2, liveIcuCount - 2)} बेड उपलब्ध`
    : lang === 'pa'
    ? `${Math.max(2, liveIcuCount - 2)} ਬੈੱਡ ਉਪਲਬਧ`
    : hospital.roomAvailable;

  return {
    ...hospital,
    name: locName,
    city: locCity,
    state: locState,
    address: locAddress,
    type: locType,
    typeRaw: locType,
    accreditation: locAccreditation,
    qualityBadge: locAccreditation,
    turnaround: locTurnaround,
    cost_indicative: locTariff,
    top_disease_treated: locDisease,
    topDisease: locDisease,
    specialties: locSpecialties,
    metrics: locMetrics,
    tags: locTags,
    roomAvailable: roomAvailable || hospital.roomAvailable,
  };
}
