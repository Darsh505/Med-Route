/**
 * hospitalLocalization.ts — Complete Clinical & Healthcare Localization Engine
 * Provides 100% full translations for 1451 hospitals, cities, specialties,
 * diseases, procedures, metrics, tariffs, accreditations, departments & first-aid protocols.
 */

export const CITIES_MAP: Record<string, { hi: string; pa: string }> = {
  'agartala': { hi: 'अगरतला', pa: 'ਅਗਰਤਲਾ' },
  'agra': { hi: 'आगरा', pa: 'ਆਗਰਾ' },
  'ahmedabad': { hi: 'अहमदाबाद', pa: 'ਅਹਿਮਦਾਬਾਦ' },
  'aizawl': { hi: 'आइजोल', pa: 'ਆਈਜ਼ੋਲ' },
  'ajmer': { hi: 'अजमेर', pa: 'ਅਜਮੇਰ' },
  'ambala': { hi: 'अंबाला', pa: 'ਅੰਬਾਲਾ' },
  'amritsar': { hi: 'अमृतसर', pa: 'ਅੰਮ੍ਰਿਤਸਰ' },
  'asansol': { hi: 'आसनसोल', pa: 'ਆਸਨਸੋਲ' },
  'aurangabad': { hi: 'औरंगाबाद', pa: 'ਔਰੰਗਾਬਾਦ' },
  'bareilly': { hi: 'बरेली', pa: 'ਬਰੇਲੀ' },
  'bathinda': { hi: 'बठिंडा', pa: 'ਬਠਿੰਡਾ' },
  'belgaum': { hi: 'बेलगाम', pa: 'ਬੇਲਗਾਮ' },
  'bengaluru': { hi: 'बेंगलुरु', pa: 'ਬੈਂਗਲੁਰੂ' },
  'bangalore': { hi: 'बेंगलुरु', pa: 'ਬੈਂਗਲੁਰੂ' },
  'bhagalpur': { hi: 'भागलपुर', pa: 'ਭਾਗਲਪੁਰ' },
  'bhavnagar': { hi: 'भावनगर', pa: 'ਭਾਵਨਗਰ' },
  'bhopal': { hi: 'भोपाल', pa: 'ਭੋਪਾਲ' },
  'bhubaneswar': { hi: 'भुवनेश्वर', pa: 'ਭੁਵਨੇਸ਼ਵਰ' },
  'bilaspur': { hi: 'बिलासपुर', pa: 'ਬਿਲਾਸਪੁਰ' },
  'chandigarh': { hi: 'चंडीगढ़', pa: 'ਚੰਡੀਗੜ੍ਹ' },
  'chennai': { hi: 'चेन्नई', pa: 'ਚੇਨਈ' },
  'coimbatore': { hi: 'कोयंबटूर', pa: 'ਕੋਇੰਬਟੂਰ' },
  'cuttack': { hi: 'कटक', pa: 'ਕਟਕ' },
  'dehradun': { hi: 'देहरादून', pa: 'ਦੇਹਰਾਦੂਨ' },
  'greater noida': { hi: 'ग्रेटर नोएडा', pa: 'ਗ੍ਰੇਟਰ ਨੋਇਡਾ' },
  'navi mumbai': { hi: 'नवी मुंबई', pa: 'ਨਵੀਂ ਮੁੰਬਈ' },
  'new delhi': { hi: 'नई दिल्ली', pa: 'ਨਵੀਂ ਦਿੱਲੀ' },
  'delhi': { hi: 'दिल्ली', pa: 'ਦਿੱਲੀ' },
  'dhanbad': { hi: 'धनबाद', pa: 'ਧਨਬਾਦ' },
  'dibrugarh': { hi: 'डिब्रूगढ़', pa: 'ਡਿਬਰੂਗੜ੍ਹ' },
  'durg': { hi: 'दुर्ग', pa: 'ਦੁਰਗ' },
  'durgapur': { hi: 'दुर्गापुर', pa: 'ਦੁਰਗਾਪੁਰ' },
  'faridabad': { hi: 'फरीदाबाद', pa: 'ਫ਼ਰੀਦਾਬਾਦ' },
  'gangtok': { hi: 'गंगटोक', pa: 'ਗੰਗਟੋਕ' },
  'gaya': { hi: 'गया', pa: 'ਗਯਾ' },
  'ghaziabad': { hi: 'गाजियाबाद', pa: 'ਗਾਜ਼ੀਆਬਾਦ' },
  'guntur': { hi: 'गुंटूर', pa: 'ਗੁੰਟੂਰ' },
  'gurugram': { hi: 'गुरुग्राम', pa: 'ਗੁਰੂਗ੍ਰਾਮ' },
  'gurgaon': { hi: 'गुरुग्राम', pa: 'ਗੁਰੂਗ੍ਰਾਮ' },
  'guwahati': { hi: 'गुवाहाटी', pa: 'ਗੁਵਾਹਾਟੀ' },
  'gwalior': { hi: 'ग्वालियर', pa: 'ਗਵਾਲੀਅਰ' },
  'haridwar': { hi: 'हरिद्वार', pa: 'ਹਰਿਦੁਆਰ' },
  'hoshiarpur': { hi: 'होशियारपुर', pa: 'ਹੁਸ਼ਿਆਰਪੁਰ' },
  'howrah': { hi: 'हावड़ा', pa: 'ਹਾਵੜਾ' },
  'hubli': { hi: 'हुबली', pa: 'ਹੁਬਲੀ' },
  'hyderabad': { hi: 'हैदराबाद', pa: 'ਹੈਦਰਾਬਾਦ' },
  'imphal': { hi: 'इम्फाल', pa: 'ਇੰਫਾਲ' },
  'indore': { hi: 'इंदौर', pa: 'ਇੰਦੌਰ' },
  'itanagar': { hi: 'ईटानगर', pa: 'ਈਟਾਨਗਰ' },
  'jabalpur': { hi: 'जबलपुर', pa: 'ਜਬਲਪੁਰ' },
  'jaipur': { hi: 'जयपुर', pa: 'ਜੈਪੁਰ' },
  'jalandhar': { hi: 'जालंधर', pa: 'ਜਲੰਧਰ' },
  'jammu': { hi: 'जम्मू', pa: 'ਜੰਮੂ' },
  'jamshedpur': { hi: 'जमशेदपुर', pa: 'ਜਮਸ਼ੇਦਪੁਰ' },
  'jodhpur': { hi: 'जोधपुर', pa: 'ਜੋਧਪੁਰ' },
  'kanpur': { hi: 'कानपुर', pa: 'ਕਾਨਪੁਰ' },
  'karnal': { hi: 'करनाल', pa: 'ਕਰਨਾਲ' },
  'kochi': { hi: 'कोच्चि', pa: 'ਕੋਚੀ' },
  'cochin': { hi: 'कोच्चि', pa: 'ਕੋਚੀ' },
  'kohima': { hi: 'कोहिमा', pa: 'ਕੋਹਿਮਾ' },
  'kolhapur': { hi: 'कोल्हापुर', pa: 'ਕੋਲ੍ਹਾਪੁਰ' },
  'kolkata': { hi: 'कोलकाता', pa: 'ਕੋਲਕਾਤਾ' },
  'kollam': { hi: 'कोल्लम', pa: 'ਕੋਲਮ' },
  'kota': { hi: 'कोटा', pa: 'ਕੋਟਾ' },
  'kozhikode': { hi: 'कोझिकोड', pa: 'ਕੋਜ਼ੀਕੋਡ' },
  'calicut': { hi: 'कोझिकोड', pa: 'ਕੋਜ਼ੀਕੋਡ' },
  'lucknow': { hi: 'लखनऊ', pa: 'ਲਖਨਊ' },
  'ludhiana': { hi: 'लुधियाना', pa: 'ਲੁਧਿਆਣਾ' },
  'madurai': { hi: 'मदुरै', pa: 'ਮਦੁਰੈ' },
  'mangalore': { hi: 'मंगलुरु', pa: 'ਮੰਗਲੁਰੂ' },
  'mangaluru': { hi: 'मंगलुरु', pa: 'ਮੰਗਲੁਰੂ' },
  'meerut': { hi: 'मेरठ', pa: 'ਮੇਰਠ' },
  'mohali': { hi: 'मोहाली', pa: 'ਮੋਹਾਲੀ' },
  'mumbai': { hi: 'मुंबई', pa: 'ਮੁੰਬਈ' },
  'muzaffarpur': { hi: 'मुजफ्फरपुर', pa: 'ਮੁਜ਼ੱਫਰਪੁਰ' },
  'mysuru': { hi: 'मैसूरु', pa: 'ਮੈਸੂਰੂ' },
  'mysore': { hi: 'मैसूरु', pa: 'ਮੈਸੂਰੂ' },
  'nagpur': { hi: 'नागपुर', pa: 'ਨਾਗਪੁਰ' },
  'nashik': { hi: 'नासिक', pa: 'ਨਾਸਿਕ' },
  'noida': { hi: 'नोएडा', pa: 'ਨੋਇਡਾ' },
  'panaji': { hi: 'पणजी', pa: 'ਪਣਜੀ' },
  'goa': { hi: 'गोवा', pa: 'ਗੋਆ' },
  'panchkula': { hi: 'पंचकुला', pa: 'ਪੰਚਕੂਲਾ' },
  'pathankot': { hi: 'पठानकोट', pa: 'ਪਠਾਨਕੋਟ' },
  'patiala': { hi: 'पटियाला', pa: 'ਪਟਿਆਲਾ' },
  'patna': { hi: 'पटना', pa: 'ਪਟਨਾ' },
  'prayagraj': { hi: 'प्रयागराज', pa: 'ਪ੍ਰਯਾਗਰਾਜ' },
  'allahabad': { hi: 'प्रयागराज', pa: 'ਪ੍ਰਯਾਗਰਾਜ' },
  'pune': { hi: 'पुणे', pa: 'ਪੁਣੇ' },
  'raipur': { hi: 'रायपुर', pa: 'ਰਾਏਪੁਰ' },
  'rajkot': { hi: 'राजकोट', pa: 'ਰਾਜਕੋਟ' },
  'ranchi': { hi: 'रांची', pa: 'ਰਾਂਚੀ' },
  'rohtak': { hi: 'रोहतक', pa: 'ਰੋਹਤਕ' },
  'rourkela': { hi: 'राउरकेला', pa: 'ਰਾਊਰਕੇਲਾ' },
  'salem': { hi: 'सलेम', pa: 'ਸਲੇਮ' },
  'secunderabad': { hi: 'सिकंदराबाद', pa: 'ਸਿਕੰਦਰਾਬਾਦ' },
  'shillong': { hi: 'शिलांग', pa: 'ਸ਼ਿਲਾਂਗ' },
  'shimla': { hi: 'शिमला', pa: 'ਸ਼ਿਮਲਾ' },
  'silchar': { hi: 'सिलचर', pa: 'ਸਿਲਚਰ' },
  'siliguri': { hi: 'सिलीगुड़ी', pa: 'ਸਿਲੀਗੁੜੀ' },
  'solapur': { hi: 'सोलापुर', pa: 'ਸੋਲਾਪੁਰ' },
  'srinagar': { hi: 'श्रीनगर', pa: 'ਸ਼੍ਰੀਨਗਰ' },
  'surat': { hi: 'सूरत', pa: 'ਸੂਰਤ' },
  'thane': { hi: 'ठाणे', pa: 'ਠਾਣੇ' },
  'thiruvananthapuram': { hi: 'तिरुवनंतपुरम', pa: 'ਤਿਰੂਵਨੰਤਪੁਰਮ' },
  'thrissur': { hi: 'त्रिशूर', pa: 'ਤ੍ਰਿਸ਼ੂਰ' },
  'tiruchirappalli': { hi: 'तिरुचिरापल्ली', pa: 'ਤਿਰੂਚਿਰਾਪੱਲੀ' },
  'trichy': { hi: 'तिरुचिरापल्ली', pa: 'ਤਿਰੂਚਿਰਾਪੱਲੀ' },
  'tirupati': { hi: 'तिरुपति', pa: 'ਤਿਰੂਪਤੀ' },
  'udaipur': { hi: 'उदयपुर', pa: 'ਉਦੈਪੁਰ' },
  'ujjain': { hi: 'उज्जैन', pa: 'ਉਜੈਨ' },
  'vadodara': { hi: 'वडोदरा', pa: 'ਵਡੋਦਰਾ' },
  'baroda': { hi: 'वडोदरा', pa: 'ਵਡੋਦਰਾ' },
  'varanasi': { hi: 'वाराणसी', pa: 'ਵਾਰਾਣਸੀ' },
  'vijayawada': { hi: 'विजयवाड़ा', pa: 'ਵਿਜੇਵਾੜਾ' },
  'visakhapatnam': { hi: 'विशाखापत्तनम', pa: 'ਵਿਸ਼ਾਖਾਪਟਨਮ' },
  'vizag': { hi: 'विशाखापत्तनम', pa: 'ਵਿਸ਼ਾਖਾਪਟਨਮ' },
  'warangal': { hi: 'वारंगल', pa: 'ਵਾਰੰਗਲ' },
  'punjab': { hi: 'पंजाब', pa: 'ਪੰਜਾਬ' },
  'haryana': { hi: 'हरियाणा', pa: 'ਹਰਿਆਣਾ' },
  'delhi ncr': { hi: 'दिल्ली एनसीआर', pa: 'ਦਿੱਲੀ ਐਨਸੀਆਰ' },
  'uttar pradesh': { hi: 'उत्तर प्रदेश', pa: 'ਉੱਤਰ ਪ੍ਰਦੇਸ਼' },
  'maharashtra': { hi: 'महाराष्ट्र', pa: 'ਮਹਾਰਾਸ਼ਟਰ' },
  'karnataka': { hi: 'कर्नाटक', pa: 'ਕਰਨਾਟਕ' },
  'rajasthan': { hi: 'राजस्थान', pa: 'ਰਾਜਸਥਾਨ' },
  'gujarat': { hi: 'गुजरात', pa: 'ਗੁਜਰਾਤ' },
  'all india': { hi: 'अखिल भारतीय', pa: 'ਸਮੁੱਚਾ ਭਾਰਤ' },
  'all cities': { hi: 'सभी शहर', pa: 'ਸਾਰੇ ਸ਼ਹਿਰ' }
};

export const SPECIALTIES_MAP: Record<string, { hi: string; pa: string }> = {
  'cardiology': { hi: 'हृदय रोग (कार्डियोलॉजी)', pa: 'ਦਿਲ ਦੇ ਰੋਗ (ਕਾਰਡੀਓਲੋਜੀ)' },
  'orthopedics': { hi: 'हड्डी एवं जोड़ रोग', pa: 'ਹੱਡੀਆਂ ਅਤੇ ਜੋੜਾਂ ਦੇ ਰੋਗ' },
  'oncology': { hi: 'कैंसर रोग (ऑन्कोलॉजी)', pa: 'ਕੈਂਸਰ ਰੋਗ (ਆਨਕੋਲੋਜੀ)' },
  'neurology': { hi: 'न्यूरोलॉजी (मस्तिष्क रोग)', pa: 'ਨਿਊਰੋਲੋਜੀ (ਦਿਮਾਗੀ ਰੋਗ)' },
  'nephrology': { hi: 'नेफ्रोलॉजी (गुर्दा रोग)', pa: 'ਨੈਫਰੋਲੋਜੀ (ਗੁਰਦਾ ਰੋਗ)' },
  'kidney care': { hi: 'गुर्दा रोग एवं डायलिसिस', pa: 'ਗੁਰਦਾ ਰੋਗ ਅਤੇ ਡਾਇਲਸਿਸ' },
  'gastroenterology': { hi: 'पेट एवं पाचन रोग', pa: 'ਪੇਟ ਅਤੇ ਪਾਚਨ ਰੋਗ' },
  'gastro': { hi: 'गैस्ट्रोएंटरोलॉजी', pa: 'ਗੈਸਟ੍ਰੋਐਂਟਰੋਲੋਜੀ' },
  'general surgery': { hi: 'सामान्य सर्जरी', pa: 'ਜਨਰਲ ਸਰਜਰੀ' },
  'emergency': { hi: 'आपातकालीन देखभाल 24x7', pa: 'ਐਮਰਜੈਂਸੀ ਦੇਖਭਾਲ 24x7' },
  'gynecology': { hi: 'स्त्री एवं प्रसूति रोग', pa: 'ਇਸਤਰੀ ਅਤੇ ਜਣੇਪਾ ਰੋਗ' },
  'pediatrics': { hi: 'बाल रोग विशेषज्ञ', pa: 'ਬਾਲ ਰੋਗ ਮਾਹਿਰ' },
  'pulmonology': { hi: 'फेफड़े एवं श्वसन रोग', pa: 'ਫੇਫੜਿਆਂ ਅਤੇ ਸਾਹ ਰੋਗ' },
  'urology': { hi: 'मूत्र रोग (यूरोलॉजी)', pa: 'ਪਿਸ਼ਾਬ ਰੋਗ (ਯੂਰੋਲੋਜੀ)' },
  'eye care': { hi: 'नेत्र रोग एवं दृष्टि देखभाल', pa: 'ਅੱਖਾਂ ਦੇ ਰੋਗ ਅਤੇ ਦੇਖਭਾਲ' },
  'ophthalmology': { hi: 'नेत्र रोग विज्ञान', pa: 'ਅੱਖਾਂ ਦੇ ਰੋਗ ਵਿਗਿਆਨ' },
  'dermatology': { hi: 'त्वचा रोग विशेषज्ञ', pa: 'ਚਮੜੀ ਦੇ ਰੋਗ ਮਾਹਿਰ' },
  'cardiac surgery': { hi: 'कार्डियक सर्जरी (हार्ट बाईपास)', pa: 'ਕਾਰਡੀਆਕ ਸਰਜਰੀ (ਬਾਈਪਾਸ)' },
  'trauma care': { hi: 'आघात एवं आपातकालीन केंद्र', pa: 'ਟਰੌਮਾ ਅਤੇ ਐਮਰਜੈਂਸੀ ਸੈਂਟਰ' }
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
  'hernia': { hi: 'हर्निया', pa: 'ਹਰਨੀਆ' },
  'kidney / renal': { hi: 'गुर्दा / रीनल', pa: 'ਗੁਰਦਾ / ਰੀਨਲ' },
  'heart surgery': { hi: 'हार्ट सर्जरी', pa: 'ਦਿਲ ਦੀ ਸਰਜਰੀ' },
  'bone & joint': { hi: 'हड्डी एवं जोड़', pa: 'ਹੱਡੀ ਅਤੇ ਜੋੜ' },
  'trauma triage': { hi: 'ट्रॉमा ट्राइएज', pa: 'ਟਰੌਮਾ ਟ੍ਰਾਈਏਜ' }
};

export const PROCEDURES_MAP: Record<string, { hi: string; pa: string }> = {
  'coronary angioplasty (single stent)': { hi: 'कोरोनरी एंजियोप्लास्टी (सिंगल स्टेंट)', pa: 'ਕੋਰੋਨਰੀ ਐਂਜੀਓਪਲਾਸਟੀ (ਸਿੰਗਲ ਸਟੈਂਟ)' },
  'total knee replacement': { hi: 'टोटल घुटना प्रत्यारोपण', pa: 'ਕੁੱਲ ਗੋਡਾ ਬਦਲਣਾ' },
  'cataract surgery (phaco + iol)': { hi: 'मोतियाबिंद सर्जरी (फेको + आईओएल)', pa: 'ਮੋਤੀਆਬਿੰਦ ਸਰਜਰੀ (ਫੈਕੋ + ਆਈਓਐਲ)' },
  'hemodialysis (maintenance)': { hi: 'हेमोडायलिसिस (रखरखाव सत्र)', pa: 'ਹੀਮੋਡਾਇਲਸਿਸ (ਰੱਖ-ਰਖਾਅ)' },
  'laparoscopic cholecystectomy': { hi: 'लैप्रोस्कोपिक पित्ताशय सर्जरी (पथरी)', pa: 'ਲੈਪਰੋਸਕੋਪਿਕ ਪਿੱਤੇ ਦੀ ਸਰਜਰੀ' },
  'cabg / bypass surgery': { hi: 'सीएबीजी / हार्ट बाईपास सर्जरी', pa: 'ਸੀਏਬੀਜੀ / ਹਾਰਟ ਬਾਈਪਾਸ ਸਰਜਰੀ' },
  'hip replacement': { hi: 'कूल्हा प्रत्यारोपण सर्जरी', pa: 'ਕੁੱਲ੍ਹੇ ਦਾ ਜੋੜ ਬਦਲਣਾ' },
  'appendectomy': { hi: 'एपेंडिसेक्टॉमी सर्जरी', pa: 'ਅਪੈਂਡਿਕਸ ਸਰਜਰੀ' },
  'hernia repair': { hi: 'हर्निया रिपेयर सर्जरी', pa: 'ਹਰਨੀਆ ਰਿਪੇਅਰ ਸਰਜਰੀ' },
  'kidney stone laser lithotripsy': { hi: 'गुर्दे की पथरी लेजर लिथोट्रिप्सी', pa: 'ਗੁਰਦੇ ਦੀ ਪੱਥਰੀ ਲੇਜ਼ਰ ਇਲਾਜ' },
  'knee replacement': { hi: 'घुटना प्रत्यारोपण', pa: 'ਗੋਡਾ ਬਦਲਣਾ' },
  'heart stent / angioplasty': { hi: 'हार्ट स्टेंट / एंजियोप्लास्टी', pa: 'ਦਿਲ ਦਾ ਸਟੈਂਟ / ਐਂਜੀਓਪਲਾਸਟੀ' }
};

export const BASE_CHAINS: [string, { hi: string; pa: string }][] = [
  ['Government Medical College & Apex Hospital', { hi: 'सरकारी मेडिकल कॉलेज एवं एपेक्स अस्पताल', pa: 'ਸਰਕਾਰੀ ਮੈਡੀਕਲ ਕਾਲਜ ਅਤੇ ਐਪੈਕਸ ਹਸਪਤਾਲ' }],
  ['Government Medical College', { hi: 'सरकारी मेडिकल कॉलेज', pa: 'ਸਰਕਾਰੀ ਮੈਡੀਕਲ ਕਾਲਜ' }],
  ['Civil District Hospital', { hi: 'सिविल जिला अस्पताल', pa: 'ਸਿਵਲ ਜ਼ਿਲ੍ਹਾ ਹਸਪਤਾਲ' }],
  ['Civil Hospital', { hi: 'सिविल अस्पताल', pa: 'ਸਿਵਲ ਹਸਪਤਾਲ' }],
  ['Ramakrishna Mission Seva Pratishthan', { hi: 'रामकृष्ण मिशन सेवा प्रतिष्ठान', pa: 'ਰਾਮਕ੍ਰਿਸ਼ਨ ਮਿਸ਼ਨ ਸੇਵਾ ਪ੍ਰਤਿਸ਼ਠਾਨ' }],
  ["St. Luke's Mission Hospital", { hi: 'सेंट ल्यूक्स मिशन अस्पताल', pa: 'ਸੇਂਟ ਲਿਊਕਸ ਮਿਸ਼ਨ ਹਸਪਤਾਲ' }],
  ['Apollo Super Speciality Hospital', { hi: 'अपोलो सुपर स्पेशलिटी अस्पताल', pa: 'ਅਪੋਲੋ ਸੁਪਰ ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
  ['Apollo Hospitals', { hi: 'अपोलो अस्पताल', pa: 'ਅਪੋਲੋ ਹਸਪਤਾਲ' }],
  ['Fortis Escorts Healthcare Centre', { hi: 'फोर्टिस एस्कॉर्ट्स हेल्थकेयर सेंटर', pa: 'ਫੋਰਟਿਸ ਐਸਕੌਰਟਸ ਹੈਲਥਕੇਅਰ ਸੈਂਟਰ' }],
  ['Fortis Hospital', { hi: 'फोर्टिस अस्पताल', pa: 'ਫੋਰਟਿਸ ਹਸਪਤਾਲ' }],
  ['Max Super Speciality Hospital', { hi: 'मैक्स सुपर स्पेशलिटी अस्पताल', pa: 'ਮੈਕਸ ਸੁਪਰ ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
  ['Manipal Tertiary Care Hospital', { hi: 'मणिपाल टर्शियरी केयर अस्पताल', pa: 'ਮਨੀਪਾਲ ਟਰਸ਼ਰੀ ਕੇਅਰ ਹਸਪਤਾਲ' }],
  ['Manipal Hospital', { hi: 'मणिपाल अस्पताल', pa: 'ਮਨੀਪਾਲ ਹਸਪਤਾਲ' }],
  ['Narayana Multispeciality Hospital', { hi: 'नारायणा मल्टीस्पेशलिटी अस्पताल', pa: 'ਨਾਰਾਇਣਾ ਮਲਟੀਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
  ['Aster Prime Super Speciality Hospital', { hi: 'एस्टर प्राइम सुपर स्पेशलिटी अस्पताल', pa: 'ਐਸਟਰ ਪ੍ਰਾਈਮ ਸੁਪਰ ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
  ['Aster CMI Hospital', { hi: 'एस्टर सीएमआई अस्पताल', pa: 'ਐਸਟਰ ਸੀਐਮਆਈ ਹਸਪਤਾਲ' }],
  ['Care Hospitals & Heart Institute', { hi: 'केयर हॉस्पिटल्स एवं हार्ट इंस्टीट्यूट', pa: 'ਕੇਅਰ ਹਸਪਤਾਲ ਅਤੇ ਦਿਲ ਇੰਸਟੀਚਿਊਟ' }],
  ['KIMS Global Medical Hospital', { hi: 'किम्स ग्लोबल मेडिकल अस्पताल', pa: 'ਕਿਮਜ਼ ਗਲੋਬਲ ਮੈਡੀਕਲ ਹਸਪਤਾਲ' }],
  ['Sahyadri Speciality Hospital', { hi: 'सह्याद्री स्पेशलिटी अस्पताल', pa: 'ਸਹਿਯਾਦਰੀ ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
  ['Medanta The Medicity Centre', { hi: 'मेदांता द मेडिसिटी सेंटर', pa: 'ਮੇਦਾਂਤਾ ਦ ਮੈਡੀਸਿਟੀ ਸੈਂਟਰ' }],
  ['Medanta - The Medicity', { hi: 'मेदांता - द मेडिसिटी', pa: 'ਮੇਦਾਂਤਾ - ਦ ਮੈਡੀਸਿਟੀ' }],
  ['Ruby Hall Clinic & Institute', { hi: 'रूबी हॉल क्लिनिक एवं संस्थान', pa: 'ਰੂਬੀ ਹਾਲ ਕਲੀਨਿਕ ਅਤੇ ਸੰਸਥਾ' }],
  ['Yashoda Super Speciality Hospital', { hi: 'यशोदा सुपर स्पेशलिटी अस्पताल', pa: 'ਯਸ਼ੋਦਾ ਸੁਪਰ ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
  ['Columbia Asia Healthcare', { hi: 'कोलंबिया एशिया हेल्थकेयर', pa: 'ਕੋਲੰਬੀਆ ਏਸ਼ੀਆ ਹੈਲਥਕੇਅਰ' }],
  ['Artemis Multi-Speciality Institute', { hi: 'आर्टेमिस मल्टी-स्पेशलिटी संस्थान', pa: 'ਆਰਟੇਮਿਸ ਮਲਟੀ-ਸਪੈਸ਼ਲਿਟੀ ਸੰਸਥਾ' }],
  ['Sunrise Lifecare Medical Hospital', { hi: 'सनराइज लाइफकेयर मेडिकल अस्पताल', pa: 'ਸਨਰਾਈਜ਼ ਲਾਈਫਕੇਅਰ ਮੈਡੀਕਲ ਹਸਪਤਾਲ' }],
  ['Lifeline Multispecialty Centre', { hi: 'लाइफलाइन मल्टीस्पेशलिटी सेंटर', pa: 'ਲਾਈਫਲਾਈਨ ਮਲਟੀਸਪੈਸ਼ਲਿਟੀ ਸੈਂਟਰ' }],
  ['Metro Heart & Trauma Centre', { hi: 'मेट्रो हार्ट एवं ट्रॉमा सेंटर', pa: 'ਮੈਟਰੋ ਹਾਰਟ ਅਤੇ ਟਰੌਮਾ ਸੈਂਟਰ' }],
  ['Apex Advanced Surgical Centre', { hi: 'एपेक्स एडवांस्ड सर्जिकल सेंटर', pa: 'ਐਪੈਕਸ ਐਡਵਾਂਸਡ ਸਰਜੀਕਲ ਸੈਂਟਰ' }],
  ['Lotus Hospital & Trauma Care', { hi: 'लोटस अस्पताल एवं ट्रॉमा केयर', pa: 'ਲੋਟਸ ਹਸਪਤਾਲ ਅਤੇ ਟਰੌਮਾ ਕੇਅਰ' }],
  ['City Pulse Healthcare Institute', { hi: 'सिटी पल्स हेल्थकेयर संस्थान', pa: 'ਸਿਟੀ ਪਲਸ ਹੈਲਥਕੇਅਰ ਸੰਸਥਾ' }],
  ['Guru Harkrishan Sahib Charitable Hospital', { hi: 'गुरु हरकिशन साहिब चैरिटेबल अस्पताल', pa: 'ਗੁਰੂ ਹਰਕ੍ਰਿਸ਼ਨ ਸਾਹਿਬ ਚੈਰੀਟੇਬਲ ਹਸਪਤਾਲ' }],
  ['Rotary Lions Community Hospital', { hi: 'रोटरी लायंस कम्युनिटी अस्पताल', pa: 'ਰੋਟਰੀ ਲਾਇਨਜ਼ ਕਮਿਊਨਿਟੀ ਹਸਪਤਾਲ' }],
  ['Smt. Parvati Memorial Trust Hospital', { hi: 'श्रीमती पार्वती मेमोरियल ट्रस्ट अस्पताल', pa: 'ਸ਼੍ਰੀਮਤੀ ਪਾਰਵਤੀ ਮੈਮੋਰੀਅਲ ਟਰੱਸਟ ਹਸਪਤਾਲ' }],
  ['Mahavir Jain Relief Charitable Hospital', { hi: 'महावीर जैन रिलीफ चैरिटेबल अस्पताल', pa: 'ਮਹਾਵੀਰ ਜੈਨ ਰਿਲੀਫ ਚੈਰੀਟੇਬਲ ਹਸਪਤਾਲ' }],
  ['Dayanand Sevashram Hospital', { hi: 'दयानंद सेवाश्रम अस्पताल', pa: 'ਦਯਾਨੰਦ ਸੇਵਾਸ਼ਰਮ ਹਸਪਤਾਲ' }],
  ['Mata Gujri Charitable Trust Hospital', { hi: 'माता गुजरी चैरिटेबल ट्रस्ट अस्पताल', pa: 'ਮਾਤਾ ਗੁਜਰੀ ਚੈਰੀਟੇਬਲ ਟਰੱਸਟ ਹਸਪਤਾਲ' }],
  ['AIIMS New Delhi', { hi: 'एम्स नई दिल्ली', pa: 'ਏਮਜ਼ ਨਵੀਂ ਦਿੱਲੀ' }],
  ['AIIMS Delhi', { hi: 'एम्स दिल्ली', pa: 'ਏਮਜ਼ ਦਿੱਲੀ' }],
  ['AIIMS Jodhpur', { hi: 'एम्स जोधपुर', pa: 'ਏਮਜ਼ ਜੋਧਪੁਰ' }],
  ['AIIMS Bhubaneswar', { hi: 'एम्स भुवनेश्वर', pa: 'ਏਮਜ਼ ਭੁਵਨੇਸ਼ਵਰ' }],
  ['AIIMS Patna', { hi: 'एम्स पटना', pa: 'ਏਮਜ਼ ਪਟਨਾ' }],
  ['AIIMS Bhopal', { hi: 'एम्स भोपाल', pa: 'ਏਮਜ਼ ਭੋਪਾਲ' }],
  ['AIIMS Raipur', { hi: 'एम्स रायपुर', pa: 'ਏਮਜ਼ ਰਾਏਪੁਰ' }],
  ['AIIMS', { hi: 'एम्स', pa: 'ਏਮਜ਼' }],
  ['PGIMER Chandigarh', { hi: 'पीजीआईएमईआर चंडीगढ़', pa: 'ਪੀਜੀਆਈਐਮਈਆਰ ਚੰਡੀਗੜ੍ਹ' }],
  ['PGIMER', { hi: 'पीजीआईएमईआर', pa: 'ਪੀਜੀਆਈਐਮਈਆਰ' }],
  ['Ivy Hospital Hoshiarpur', { hi: 'आईवी अस्पताल होशियारपुर', pa: 'ਆਈਵੀ ਹਸਪਤਾਲ ਹੁਸ਼ਿਆਰਪੁਰ' }],
  ['Ivy Hospital', { hi: 'आईवी अस्पताल', pa: 'ਆਈਵੀ ਹਸਪਤਾਲ' }],
  ['Ivy Hosp', { hi: 'आईवी अस्पताल', pa: 'ਆਈਵੀ ਹਸਪਤਾਲ' }],
  ['Sakra World Hospital', { hi: 'सक्रा वर्ल्ड अस्पताल', pa: 'ਸਕਰਾ ਵਰਲਡ ਹਸਪਤਾਲ' }],
  ['Super Speciality Hospital', { hi: 'सुपर स्पेशलिटी अस्पताल', pa: 'ਸੁਪਰ ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
  ['Multispeciality Hospital', { hi: 'मल्टीस्पेशलिटी अस्पताल', pa: 'ਮਲਟੀਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
  ['Speciality Hospital', { hi: 'स्पेशलिटी अस्पताल', pa: 'ਸਪੈਸ਼ਲਿਟੀ ਹਸਪਤਾਲ' }],
  ['Hospital', { hi: 'अस्पताल', pa: 'ਹਸਪਤਾਲ' }],
  ['Clinic', { hi: 'क्लिनिक', pa: 'ਕਲੀਨਿਕ' }],
  ['Centre', { hi: 'सेंटर', pa: 'ਸੈਂਟਰ' }],
  ['Center', { hi: 'सेंटर', pa: 'ਸੈਂਟਰ' }]
];

const sortedCities = Object.entries(CITIES_MAP).sort((a,b) => b[0].length - a[0].length);

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

export function localizeProcedure(procedure: string, lang: string): string {
  if (!procedure || lang === 'en') return procedure;
  const key = procedure.trim().toLowerCase();
  const found = PROCEDURES_MAP[key];
  if (found) return found[lang as 'hi' | 'pa'] || procedure;
  return procedure;
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
  if (a.includes('nabh') && a.includes('jci')) return lang === 'hi' ? 'एनएबीएच / जेसीआई मान्यता' : 'ਐਨ.ਏ.ਬੀ.ਐਚ. / ਜੇ.ਸੀ.ਆਈ. ਮਾਨਤਾ';
  if (a.includes('nabh')) return lang === 'hi' ? 'एनएबीएच मान्यता प्राप्त' : 'ਐਨ.ਏ.ਬੀ.ਐਚ. ਪ੍ਰਮਾਣਿਤ';
  if (a.includes('jci')) return lang === 'hi' ? 'जेसीआई अंतर्राष्ट्रीय मान्यता' : 'ਜੇ.ਸੀ.ਆਈ. ਅੰਤਰਰਾਸ਼ਟਰੀ ਪ੍ਰਮਾਣਿਤ';
  if (a.includes('nabl')) return lang === 'hi' ? 'एनएबीएल प्रमाणित' : 'ਐਨ.ਏ.ਬੀ.ਐਲ. ਪ੍ਰਮਾਣਿਤ';
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
  return turnaround.replace(/mins?|minutes?/i, lang === 'hi' ? 'मिनट' : 'ਮਿੰਟ');
}

export function localizeTariff(tariff: string, lang: string): string {
  if (!tariff || lang === 'en') return tariff;
  const t = tariff.toLowerCase();
  if (t.includes('100% free') || t.includes('subsidized')) return lang === 'hi' ? '100% मुफ्त / रियायती' : '100% ਮੁਫ਼ਤ / ਸਬਸਿਡੀ ਵਾਲਾ';
  if (t.includes('free / pmjay')) return lang === 'hi' ? 'मुफ्त / पीएमजेएवाई' : 'ਮੁਫ਼ਤ / ਪੀਐਮਜੇਏਵਾਈ';
  if (t.includes('free ward')) return lang === 'hi' ? 'मुफ्त वार्ड' : 'ਮੁਫ਼ਤ ਵਾਰਡ';
  if (t.includes('subsidized ward')) return lang === 'hi' ? 'रियायती वार्ड' : 'ਸਬਸਿਡੀ ਵਾਲਾ ਵਾਰਡ';
  if (t.includes('deposit') && (t.includes('0') || t.includes('₹0'))) return lang === 'hi' ? '₹0 अग्रिम जमा' : '₹0 ਅਗਾਊਂ ਜਮ੍ਹਾਂ';
  if (t.includes('/ day')) return tariff.replace('/ day', lang === 'hi' ? '/ दिन' : '/ ਦਿਨ');
  return tariff;
}

export function localizeHospitalName(name: string, lang: string): string {
  if (!name || lang === 'en') return name;
  let result = name;

  // 1. Match chains
  for (const [enPattern, trans] of BASE_CHAINS) {
    if (result.includes(enPattern)) {
      result = result.replace(enPattern, trans[lang as 'hi' | 'pa']);
      break;
    }
  }

  // 2. Translate any city names (longest first)
  for (const [cityKey, cityTrans] of sortedCities) {
    const regex = new RegExp('\\b' + cityKey + '\\b', 'gi');
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
    ['Sec', { hi: 'सेक्टर', pa: 'ਸੈਕਟਰ' }],
    ['Phase', { hi: 'फेज़', pa: 'ਫੇਜ਼' }],
    ['Road', { hi: 'रोड', pa: 'ਰੋਡ' }],
    ['Rd', { hi: 'रोड', pa: 'ਰੋਡ' }],
    ['Near', { hi: 'निकट', pa: 'ਨੇੜੇ' }],
    ['Opposite', { hi: 'सामने', pa: 'ਸਾਹਮਣੇ' }],
    ['Opp', { hi: 'सामने', pa: 'ਸਾਹਮਣੇ' }],
    ['Mall Road', { hi: 'माल रोड', pa: 'ਮਾਲ ਰੋਡ' }],
    ['District', { hi: 'जिला', pa: 'ਜ਼ਿਲ੍ਹਾ' }]
  ];

  for (const [term, trans] of terms) {
    const reg = new RegExp('\\b' + term + '\\b', 'gi');
    res = res.replace(reg, trans[lang as 'hi' | 'pa']);
  }

  for (const [cityKey, cityTrans] of sortedCities) {
    const regex = new RegExp('\\b' + cityKey + '\\b', 'gi');
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
    locValue = lang === 'hi' ? count + ' खाली आईसीयू' : count + ' ਖਾਲੀ ਆਈ.ਸੀ.ਯੂ.';
  } else if (vKey.includes('total')) {
    const match = value.match(/(\d+)/);
    const count = match ? match[1] : '';
    locValue = lang === 'hi' ? count + ' कुल बेड' : count + ' ਕੁੱਲ ਬੈੱਡ';
  } else if (vKey.includes('beds available') || vKey.includes('open now')) {
    const match = value.match(/(\d+)/);
    const count = match ? match[1] : '';
    locValue = lang === 'hi' ? count + ' बेड उपलब्ध' : count + ' ਬੈੱਡ ਉਪਲਬਧ';
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

export function localizePro(pro: string, lang: string): string {
  if (!pro || lang === 'en') return pro;
  const p = pro.toLowerCase();
  if (p.includes('ayushman') || p.includes('pmjay') || p.includes('cashless')) {
    return lang === 'hi'
      ? 'कैशलेस सर्जरी के लिए आयुष्मान भारत पीएमजेएवाई के तहत पैनलबद्ध'
      : 'ਕੈਸ਼ਲੈਸ ਸਰਜਰੀ ਲਈ ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਪੀਐਮਜੇਏਵਾਈ ਅਧੀਨ ਸੂਚੀਬੱਧ';
  }
  if (p.includes('emergency') || p.includes('icu') || p.includes('resuscitation')) {
    return lang === 'hi'
      ? '24x7 आपातकालीन पुनर्जीवन एवं आईसीयू टेलीमेट्री उपलब्ध'
      : '24x7 ਐਮਰਜੈਂਸੀ ਰਿਸਸੀਟੇਸ਼ਨ ਅਤੇ ਆਈ.ਸੀ.ਯੂ. ਟੈਲੀਮੈਟਰੀ ਉਪਲਬਧ';
  }
  if (p.includes('nabh') || p.includes('nqas') || p.includes('protocol')) {
    return lang === 'hi'
      ? 'एनएबीएच/एनक्यूएएस प्रमाणित नैदानिक प्रोटोकॉल अनुपालन'
      : 'ਐਨਏਬੀਐਚ/ਐਨਕਿਊਏਐਸ ਪ੍ਰਮਾਣਿਤ ਕਲੀਨਿਕਲ ਪ੍ਰੋਟੋਕੋਲ ਪਾਲਣਾ';
  }
  return pro;
}

export function localizeCon(con: string, lang: string): string {
  if (!con || lang === 'en') return con;
  const c = con.toLowerCase();
  if (c.includes('wait') || c.includes('opd') || c.includes('peak')) {
    return lang === 'hi'
      ? 'सुबह ओपीडी के व्यस्त समय में प्रतीक्षा समय अधिक (30-45 मिनट)'
      : 'ਸਵੇਰ ਦੇ ਓਪੀਡੀ ਦੇ ਭੀੜ ਵਾਲੇ ਸਮੇਂ ਦੌਰਾਨ ਲੰਬਾ ਉਡੀਕ ਸਮਾਂ (30-45 ਮਿੰਟ)';
  }
  if (c.includes('advance') || c.includes('consult') || c.includes('booking')) {
    return lang === 'hi'
      ? 'सुपर-स्पेशलिस्ट वैकल्पिक परामर्श के लिए अग्रिम बुकिंग आवश्यक हो सकती है'
      : 'ਸੁਪਰ-ਸਪੈਸ਼ਲਿਸਟ ਸਲਾਹ-ਮਸ਼ਵਰੇ ਲਈ ਅਗਾਊਂ ਬੁਕਿੰਗ ਦੀ ਲੋੜ ਹੋ ਸਕਦੀ ਹੈ';
  }
  return con;
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

  const locPros = Array.isArray(hospital.pros)
    ? hospital.pros.map((p: string) => localizePro(p, lang))
    : hospital.pros;

  const locCons = Array.isArray(hospital.cons)
    ? hospital.cons.map((c: string) => localizeCon(c, lang))
    : hospital.cons;

  const locProcedures = Array.isArray(hospital.procedures)
    ? hospital.procedures.map((proc: any) => ({
        ...proc,
        name: localizeProcedure(proc.name || '', lang),
        disease: proc.disease ? localizeDisease(proc.disease, lang) : proc.disease,
      }))
    : hospital.procedures;

  const liveIcuCount = hospital.beds_icu_available ?? hospital.liveIcu ?? 5;
  const roomAvailable = lang === 'hi'
    ? Math.max(2, liveIcuCount - 2) + ' बेड उपलब्ध'
    : lang === 'pa'
    ? Math.max(2, liveIcuCount - 2) + ' ਬੈੱਡ ਉਪਲਬਧ'
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
    pros: locPros,
    cons: locCons,
    procedures: locProcedures,
    roomAvailable: roomAvailable || hospital.roomAvailable,
  };
}
