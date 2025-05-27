import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Send, MessageSquare, Users, MapPin, Globe, LifeBuoy, ShieldAlert, Languages, Bot, User, Sun, CloudRain, Wind, Zap, Home, Crosshair, ExternalLink, ListChecks, HelpCircle, Clipboard, Edit3, CheckCircle, AlertCircle } from 'lucide-react';

const App = () => {
  // --- Constants for Agent Persona and Instructions ---
  const AGENT_NAME = "AlertHub Global";
  const GREETING_MESSAGE = `Hello! I’m ${AGENT_NAME} 🌍 — your emergency information assistant. I can help you stay safe by giving you alerts, finding nearby shelters, or helping you report a danger. How can I assist you today?`;
  const LANGUAGE_PROMPT_TEXT = "Please select your preferred language:";
  const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' }
  ];

  // --- Localized Text Generators ---
  const LOCATION_REQUEST_PROMPT_GENERATOR = (lang) => {
    switch (lang) {
      case 'es': return "Para ayudarle mejor, por favor comparta su ciudad o código postal. 🗺️";
      case 'fr': return "Pour mieux vous aider, veuillez indiquer votre ville ou code postal. 🗺️";
      case 'ar': return "لمساعدتك بشكل أفضل، يرجى مشاركة اسم مدينتك أو الرمز البريدي الخاص بك. 🗺️";
      case 'zh': return "为了更好地帮助您，请分享您所在的城市或邮政编码。🗺️";
      case 'bn': return "আপনাকে আরও ভালোভাবে সাহায্য করার জন্য, অনুগ্রহ করে আপনার শহর বা পোস্টাল কোড শেয়ার করুন। 🗺️";
      default: return "To help you better, please share your city or postal code. 🗺️";
    }
  };
  const HAZARD_DETAIL_PROMPT_GENERATOR = (lang) => {
    switch (lang) {
        case 'es': return "🆘 Por favor, describa el problema (ej: 'camino bloqueado por derrumbe') y su ubicación. Enviaré esto a los coordinadores de emergencia si están disponibles en su región.";
        case 'fr': return "🆘 Veuillez décrire le problème (ex: 'route bloquée par un glissement de terrain') et votre emplacement. J'enverrai cela aux coordinateurs d'urgence s'ils sont disponibles dans votre région.";
        case 'ar': return "🆘 يرجى وصف المشكلة (مثال: 'طريق مسدود بسبب انهيار أرضي') وموقعك. سأرسل هذا إلى منسقي الطوارئ إذا كانوا متوفرين في منطقتك.";
        case 'zh': return "🆘 请描述问题（例如：“山体滑坡导致道路堵塞”）和您的位置。如果该地区有应急协调员，我会将此信息发送给他们。";
        case 'bn': return "🆘 অনুগ্রহ করে সমস্যাটি বর্ণনা করুন (যেমন: 'ভূমিধসের কারণে রাস্তা অবরুদ্ধ') এবং আপনার অবস্থান জানান। আপনার অঞ্চলে উপলব্ধ থাকলে আমি এটি জরুরি সমন্বয়কারীদের কাছে পাঠাব।";
        default: return "🆘 Please describe the issue (e.g., ‘blocked road from landslide’) and your location. I’ll send this to emergency coordinators if available in your region.";
    }
  };
  const ESCALATION_MESSAGE_GENERATOR = (lang) => {
    switch (lang) {
        case 'es': return "⚠️ Esta situación puede requerir servicios de emergencia locales. Voy a reenviar su mensaje a un equipo de apoyo regional ahora.";
        case 'fr': return "⚠️ Cette situation peut nécessiter des services d'urgence locaux. Je vais transmettre votre message à une équipe de soutien régionale maintenant.";
        case 'ar': return "⚠️ قد يتطلب هذا الموقف خدمات طوارئ محلية. سأقوم بإعادة توجيه رسالتك إلى فريق دعم إقليمي الآن.";
        case 'zh': return "⚠️ 这种情况可能需要当地的紧急服务。我现在就将您的消息转发给区域支持团队。";
        case 'bn': return "⚠️ এই পরিস্থিতিতে স্থানীয় জরুরি পরিষেবার প্রয়োজন হতে পারে। আমি আপনার বার্তাটি এখন একটি আঞ্চলিক সহায়তা দলের কাছে ফরোয়ার্ড করব।";
        default: return "⚠️ This situation may require local emergency services. I’ll forward your message to a regional support team now.";
    }
  };
  const CLOSING_MESSAGE_GENERATOR = (lang) => {
    switch (lang) {
        case 'es': return "Manténgase a salvo. Puede enviarme un mensaje nuevamente en cualquier momento para recibir las últimas alertas o ayuda. 👋";
        case 'fr': return "Restez en sécurité. Vous pouvez me renvoyer un message à tout moment pour les dernières alertes ou de l'aide. 👋";
        case 'ar': return "ابق آمناً. يمكنك مراسلتي مرة أخرى في أي وقت للحصول على أحدث التنبيهات أو المساعدة. 👋";
        case 'zh': return "请注意安全。您可以随时再次给我发消息以获取最新的警报或帮助。👋";
        case 'bn': return "নিরাপদে থাকুন। সর্বশেষ সতর্কতা বা সাহায্যের জন্য আপনি যে কোনো সময় আমাকে আবার বার্তা দিতে পারেন। 👋";
        default: return "Stay safe. You can message me again anytime for the latest alerts or help. 👋";
    }
  };
  const SAFETY_CHECKLIST_BUTTON_TEXT_GENERATOR = (lang) => {
    switch (lang) {
      case 'es': return "✨ Obtener Lista de Seguridad";
      case 'fr': return "✨ Obtenir Liste de Sécurité";
      case 'ar': return "✨ الحصول على قائمة السلامة";
      case 'zh': return "✨ 获取安全清单";
      case 'bn': return "✨ নিরাপত্তা চেকলিস্ট পান";
      default: return "✨ Get Safety Checklist";
    }
  };
  const WHAT_TO_DO_NEXT_BUTTON_TEXT_GENERATOR = (lang) => {
    switch (lang) {
        case 'es': return "✨ ¿Qué hago ahora?";
        case 'fr': return "✨ Que faire maintenant ?";
        case 'ar': return "✨ ماذا أفعل الآن؟";
        case 'zh': return "✨ 我现在该怎么办？";
        case 'bn': return "✨ এখন আমার কী করা উচিত?";
        default: return "✨ What should I do now?";
    }
  };
  const ASSESS_IMPACT_BUTTON_TEXT_GENERATOR = (lang) => {
    switch (lang) {
        case 'es': return "✨ Evaluar Impacto Potencial";
        case 'fr': return "✨ Évaluer l'Impact Potentiel";
        case 'ar': return "✨ تقييم التأثير المحتمل";
        case 'zh': return "✨ 评估潜在影响";
        case 'bn': return "✨ সম্ভাব্য প্রভাব মূল্যায়ন করুন";
        default: return "✨ Assess Potential Impact";
    }
  };
  const DRAFT_SAFE_MSG_BUTTON_TEXT_GENERATOR = (lang) => {
    switch (lang) {
        case 'es': return "✨ Redactar Mensaje 'Estoy a Salvo'";
        case 'fr': return "✨ Rédiger Message 'Je suis en Sécurité'";
        case 'ar': return "✨ صياغة رسالة 'أنا بخير'";
        case 'zh': return "✨ 草拟“我安全”消息";
        case 'bn': return "✨ 'আমি নিরাপদ' বার্তা খসড়া করুন";
        default: return "✨ Draft 'I'm Safe' Message";
    }
  };
  const DRAFT_HELP_MSG_BUTTON_TEXT_GENERATOR = (lang) => {
    switch (lang) {
        case 'es': return "✨ Redactar Mensaje de Ayuda";
        case 'fr': return "✨ Rédiger Message d'Aide";
        case 'ar': return "✨ صياغة رسالة طلب مساعدة";
        case 'zh': return "✨ 草拟求助信息";
        case 'bn': return "✨ 'সাহায্য প্রয়োজন' বার্তা খসড়া করুন";
        default: return "✨ Draft 'Need Help' Message";
    }
  };
  const FOLLOW_UP_AFTER_REPORT_GENERATOR = (lang, context = "general") => {
    const baseText = {
      en: "Is there anything specific you'd like to know, or other ways I can assist?",
      es: "¿Hay algo específico que le gustaría saber o alguna otra forma en que pueda ayudarle?",
      fr: "Y a-t-il quelque chose de spécifique que vous aimeriez savoir ou une autre manière dont je pourrais vous aider ?",
      ar: "هل هناك شيء محدد تود معرفته أو أي طريقة أخرى يمكنني بها مساعدتك؟",
      zh: "您还有什么具体想了解的，或者我还能如何帮助您吗？",
      bn: "আপনার কি নির্দিষ্ট কিছু জানার আছে অথবা আমি অন্য কোনোভাবে আপনাকে সাহায্য করতে পারি?",
    };
    
    let actions = [
        { text: SAFETY_CHECKLIST_BUTTON_TEXT_GENERATOR(lang), type: 'get_safety_checklist', icon: <ListChecks size={16} className="mr-1" /> },
        { text: WHAT_TO_DO_NEXT_BUTTON_TEXT_GENERATOR(lang), type: 'get_what_to_do_next', icon: <HelpCircle size={16} className="mr-1" /> },
        { text: DRAFT_SAFE_MSG_BUTTON_TEXT_GENERATOR(lang), type: 'draft_safe_message', icon: <CheckCircle size={16} className="mr-1" /> },
        { text: DRAFT_HELP_MSG_BUTTON_TEXT_GENERATOR(lang), type: 'draft_help_message', icon: <AlertCircle size={16} className="mr-1" /> },
    ];

    if (context === "hazard_reported") {
        actions.unshift({ // Add to the beginning for hazard context
            text: ASSESS_IMPACT_BUTTON_TEXT_GENERATOR(lang), type: 'assess_hazard_impact', icon: <Zap size={16} className="mr-1" /> 
        });
    }

    return {
      text: baseText[lang] || baseText['en'],
      actions: actions
    };
  };


  // --- State Variables ---
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [userLocation, setUserLocation] = useState(null);
  const [chatPhase, setChatPhase] = useState('initialGreeting'); 
  const [isLoading, setIsLoading] = useState(false);
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);
  const [lastBotResponseForContext, setLastBotResponseForContext] = useState("");
  const [lastHazardReported, setLastHazardReported] = useState({details: "", location: ""}); // For impact assessment

  const chatEndRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatPhase === 'initialGreeting' && messages.length === 0) { // Ensure initial messages are only added once
      addBotMessage(GREETING_MESSAGE);
      addBotMessage(LANGUAGE_PROMPT_TEXT, 'languagePrompt');
      setChatPhase('awaitingLanguage');
    }
  }, [chatPhase, messages.length]);

  // --- Helper Functions ---
  const addMessage = (text, sender, type = 'text', data = null) => {
    const newMessage = { id: crypto.randomUUID(), text, sender, type, data, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    if (sender === 'bot' && type === 'text') { 
        setLastBotResponseForContext(text);
    }
  };

  const addBotMessage = (text, type = 'text', data = null) => {
    addMessage(text, 'bot', type, data);
  };

  const addUserMessage = (text, type = 'text', data = null) => {
    addMessage(text, 'user', type, data);
  };

  const copyToClipboard = (textToCopy) => {
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.position = "fixed"; // Prevent scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      addBotMessage("Message copied to clipboard! 👍", "system_feedback");
    } catch (err) {
      addBotMessage("Failed to copy message. 👎 Please copy manually.", "system_feedback");
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textArea);
  };


  // --- Gemini API Call ---
  const generateGeminiResponse = async (promptContent, promptType = "general") => {
    setIsLoading(true);
    const languageName = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name || 'English';
    
    let specificInstructions = "";
    // Add specific instructions based on promptType
    if (promptType === "safety_checklist") {
        specificInstructions = `Focus on generating a concise, actionable safety checklist (3-5 bullet points) relevant to the user's location and any recently mentioned specific events (e.g., earthquake, flood). If no specific event, provide general emergency preparedness steps.`;
    } else if (promptType === "what_to_do_next") {
        specificInstructions = `Based on the last information provided to the user (context: "${lastBotResponseForContext}"), suggest 1-2 immediate, critical, and actionable next steps. Be very concise and direct.`;
    } else if (promptType === "hazard_impact") {
        specificInstructions = `The user has reported a hazard: "${lastHazardReported.details}" at location "${lastHazardReported.location}". Briefly outline 2-3 potential consequences or secondary risks associated with this type of hazard in such a location. Be concise and use bullet points if appropriate.`;
    } else if (promptType === "draft_safe_message") {
        specificInstructions = `Generate a short, clear "I'm safe" message template (around 20-30 words). The user is at "${userLocation || 'their current location'}" and might be experiencing an event like "${lastBotResponseForContext.includes('WARNING') ? lastBotResponseForContext.substring(0,50) : 'the current situation'}". The message should be reassuring. Example: "Hi everyone, just wanted to let you know I'm safe at [Location] despite the [event/situation]. Will update when I can." Include a placeholder for [Location] if userLocation is not specific.`;
    } else if (promptType === "draft_help_message") {
        specificInstructions = `Generate a short, clear "Need Help" message template (around 20-30 words) for an emergency. The user is at "${userLocation || 'their current location'}" and might be experiencing an event like "${lastBotResponseForContext.includes('WARNING') ? lastBotResponseForContext.substring(0,50) : 'the current situation'}". The message should clearly state the need for help. Example: "EMERGENCY: Need help at [Location]. Situation: [briefly describe, e.g., flooding, building damage]. My status: [e.g., okay but trapped, injured]. Please contact authorities." Include placeholders for [Location] and a brief description.`;
    } else if (promptType === "situation_report") { // Specific instruction for situation reports
        specificInstructions = `When generating a situation report for "${userLocation}", it is crucial to also include any significant public health advisories, such as disease outbreaks (e.g., yellow fever, cholera, measles) reported by reputable international health organizations or on portals like ReliefWeb for the specified location, in addition to weather and natural disaster alerts. If no specific significant alerts (natural disaster, weather, or health) are active, state that the situation appears calm but remind the user to stay vigilant and check official local sources for updates.`;
    }


    const disasterSourceInfo = `When providing disaster alerts or situation reports, aim to reflect the type of verified, up-to-date information found on global disaster portals like ReliefWeb (reliefweb.int/disasters) and RSOE EDIS (rsoe-edis.org/eventList). This includes information on natural disasters, extreme weather, and significant public health events like disease outbreaks.`;

    const fullPrompt = `
      You are ${AGENT_NAME}, an Emergency Response AI Agent.
      Your role is to assist people globally. Communicate in ${languageName}.
      User's location: ${userLocation || 'not specified'}.
      ${disasterSourceInfo}
      Tone: Calm, clear, helpful. Simple, direct, accessible language. Prioritize actions. Short responses for mobile. Use emojis (🚨, 🆘, 🌪️, 🏥, 🌡️ for health alerts).
      Restrictions: No medical diagnoses, no dispatch, no unverified info. No PII collection unless for hazard reporting. Use reliable (simulated) sources. State if escalation needed.
      ${specificInstructions}
      User's query/situation: "${promptContent}"

      Provide a concise and actionable response.
      ${(promptType === "draft_safe_message" || promptType === "draft_help_message") ? "The output should be ONLY the message template itself, ready for the user to copy." : 
      `Examples:
      - Alert: "🚨 TSUNAMI WARNING for Hokkaido. Move to higher ground NOW."
      - Health Alert: "🌡️ YELLOW FEVER outbreak reported in [Region], Ecuador. Ensure vaccinations are up to date if traveling. Monitor symptoms."
      - Shelter: "🏥 Shelter at Jalan Merdeka 21, Jakarta. Open 24/7."
      - Hazard Confirm: "Thanks for reporting '[details]' at [location]. Forwarding to coordinators. If life-threatening, call local authorities."
      - Safety Tip: "💡 Earthquake prep: kit, routes, 'drop, cover, hold on'."
      - Situation Report: "🔍 Report for [Location]: [weather/alert/health status]. [Safety advice]. Check local authorities for updates."
      - Checklist Item: "- Secure loose outdoor items."
      - Next Step: "➡️ Move to the nearest designated evacuation center."
      - Impact Assessment: "- Potential road closures due to debris.\n- Risk of localized flooding if drainage is blocked."`}
    `;

    try {
      const chatHistory = [{ role: "user", parts: [{ text: fullPrompt }] }];
      const payload = { contents: chatHistory };
      const apiKey = ""; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        throw new Error(`API request failed: ${response.status}. ${errorData?.error?.message || ''}`);
      }

      const result = await response.json();

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        let text = result.candidates[0].content.parts[0].text.trim();
        if (promptType === "draft_safe_message" || promptType === "draft_help_message") {
            addBotMessage(text, "generated_message_template", { messageText: text });
        } else {
            addBotMessage(text);
        }
      } else {
        console.error("Unexpected Gemini API response:", result);
        addBotMessage("I'm having trouble processing that. Please try again. 🙏");
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      addBotMessage("Issue getting that info. Check connection or try later. 🛠️");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Action Handlers (New Features) ---
  const handleGetSafetyChecklist = async () => {
    addUserMessage(SAFETY_CHECKLIST_BUTTON_TEXT_GENERATOR(currentLanguage), 'action_trigger');
    setIsLoading(true);
    addBotMessage(`Okay, generating a safety checklist for ${userLocation || 'your area'}...`);
    await generateGeminiResponse(
      `User requests a safety checklist. Current location: ${userLocation}. Recent context: ${lastBotResponseForContext}`,
      "safety_checklist"
    );
  };

  const handleWhatToDoNext = async () => {
    addUserMessage(WHAT_TO_DO_NEXT_BUTTON_TEXT_GENERATOR(currentLanguage), 'action_trigger');
    setIsLoading(true);
    addBotMessage("Let me suggest what to do next...");
    await generateGeminiResponse(
      `User asks "What should I do now?". The last significant information I provided was: "${lastBotResponseForContext}". Location: ${userLocation}.`,
      "what_to_do_next"
    );
  };

  const handleAssessHazardImpact = async () => {
    addUserMessage(ASSESS_IMPACT_BUTTON_TEXT_GENERATOR(currentLanguage), 'action_trigger');
    setIsLoading(true);
    addBotMessage(`Assessing potential impact of "${lastHazardReported.details}" at ${lastHazardReported.location || userLocation}...`);
    await generateGeminiResponse(
        `Assess potential impact of hazard.`, // Details are in lastHazardReported state, accessed by Gemini prompt
        "hazard_impact"
    );
  };

  const handleDraftSafeMessage = async () => {
    addUserMessage(DRAFT_SAFE_MSG_BUTTON_TEXT_GENERATOR(currentLanguage), 'action_trigger');
    setIsLoading(true);
    addBotMessage("Drafting an 'I'm Safe' message for you...");
    await generateGeminiResponse(
        `Draft 'I'm safe' message. Location: ${userLocation}. Context: ${lastBotResponseForContext}`,
        "draft_safe_message"
    );
  };

  const handleDraftHelpMessage = async () => {
    addUserMessage(DRAFT_HELP_MSG_BUTTON_TEXT_GENERATOR(currentLanguage), 'action_trigger');
    setIsLoading(true);
    addBotMessage("Drafting a 'Need Help' message for you...");
    await generateGeminiResponse(
        `Draft 'Need Help' message. Location: ${userLocation}. Context: ${lastBotResponseForContext}`,
        "draft_help_message"
    );
  };


  // --- Input Handlers ---
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return; 

    addUserMessage(trimmedInput);
    setInputValue('');

    if (chatPhase === 'awaitingLocation') {
      setUserLocation(trimmedInput);
      setIsLoading(true); 
      addBotMessage(`Thanks! Noted location: "${trimmedInput}". Fetching situation report... 🔍`);
      // Call generateGeminiResponse with the specific promptType for situation report
      await generateGeminiResponse(
        `User provided location: "${trimmedInput}". Requesting a situation report.`, // Content for the query
        "situation_report" // Specify the prompt type
      );
      const followUp = FOLLOW_UP_AFTER_REPORT_GENERATOR(currentLanguage, "general");
      addBotMessage(followUp.text, 'text_with_actions', { actions: followUp.actions });
      setChatPhase('readyForQueries');
    } else if (chatPhase === 'awaitingHazardDetails') {
        setIsLoading(true);
        setLastHazardReported({details: trimmedInput, location: userLocation}); // Store for impact assessment
        const hazardReportPrompt = `User reporting hazard. Details: "${trimmedInput}". Location: ${userLocation}. Confirm receipt, mention escalation.`;
        await generateGeminiResponse(hazardReportPrompt); // Default prompt type is fine here
        const followUp = FOLLOW_UP_AFTER_REPORT_GENERATOR(currentLanguage, "hazard_reported"); 
        addBotMessage(followUp.text, 'text_with_actions', { actions: followUp.actions });
        setChatPhase('readyForQueries');
    } else if (chatPhase === 'readyForQueries') {
      const lowerInput = trimmedInput.toLowerCase();
      if (lowerInput.includes('alert') || lowerInput.includes('weather') || lowerInput.includes('disaster') || lowerInput.includes('health') || lowerInput.includes('outbreak')) {
        // For general alert queries, use the situation_report type to ensure comprehensive info
        addBotMessage(`Looking up alerts for "${userLocation || 'your area'}" related to "${trimmedInput}"...`);
        await generateGeminiResponse(`User query about alerts: "${trimmedInput}"`, "situation_report");
      } else if (lowerInput.includes('shelter') || lowerInput.includes('aid') || lowerInput.includes('hospital')) {
        await generateGeminiResponse(`Find shelters/aid. Query: "${trimmedInput}"`);
      } else if (lowerInput.includes('report') || lowerInput.includes('hazard') || lowerInput.includes('danger')) {
        addBotMessage(HAZARD_DETAIL_PROMPT_GENERATOR(currentLanguage));
        setChatPhase('awaitingHazardDetails');
      } else if (lowerInput.includes('tip') || lowerInput.includes('guidance') || lowerInput.includes('safety')) {
        await generateGeminiResponse(`Safety tips/guidance. Query: "${trimmedInput}"`);
      } else if (lowerInput.includes('escalate')) {
        addBotMessage(ESCALATION_MESSAGE_GENERATOR(currentLanguage));
      } else if (lowerInput.includes('bye') || lowerInput.includes('thank you')) {
        addBotMessage(CLOSING_MESSAGE_GENERATOR(currentLanguage));
      }
      else { 
        await generateGeminiResponse(`General query: "${trimmedInput}". Determine if in scope (alerts, shelters, hazard reporting, safety tips) and respond, or politely state out of scope.`);
      }
    } else {
      addBotMessage("I'm not sure how to handle that. Could you clarify?");
    }
  };

  const handleLanguageSelect = (langCode) => {
    if (isLoading) return; 
    setCurrentLanguage(langCode);
    setIsLanguageSelected(true); 
    
    const selectedLangName = SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name;
    addMessage(`Language set to ${selectedLangName}.`, 'bot', 'system_feedback'); // Use a different type for system messages
    
    addBotMessage(LOCATION_REQUEST_PROMPT_GENERATOR(langCode));
    setChatPhase('awaitingLocation');
  };


  // --- UI Components ---
  const MessageBubble = ({ msg }) => {
    const isUser = msg.sender === 'user';
    const bubbleColor = isUser ? 'bg-blue-500 text-white' : (msg.type === 'system_feedback' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-800');
    const alignment = isUser ? 'items-end' : 'items-start';
    const Icon = isUser ? User : (msg.type === 'system_feedback' ? CheckCircle : Bot) ;

    const handleActionClick = (actionType) => {
        if (isLoading) return;
        // New action handlers
        if (actionType === 'assess_hazard_impact') handleAssessHazardImpact();
        else if (actionType === 'draft_safe_message') handleDraftSafeMessage();
        else if (actionType === 'draft_help_message') handleDraftHelpMessage();
        // Existing action handlers
        else if (actionType === 'get_safety_checklist') handleGetSafetyChecklist();
        else if (actionType === 'get_what_to_do_next') handleWhatToDoNext();
    };

    return (
      <div className={`flex flex-col p-2 ${alignment}`}>
        <div className={`flex items-end space-x-2 max-w-xs md:max-w-md lg:max-w-lg ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <Icon className={`w-6 h-6 rounded-full flex-shrink-0 ${isUser ? 'text-blue-500' : (msg.type === 'system_feedback' ? 'text-green-500' : 'text-slate-500')}`} />
          <div className={`px-4 py-2 rounded-lg shadow ${bubbleColor} ${msg.type === 'action_trigger' && isUser ? 'italic opacity-80' : ''}`}>
            {msg.type === 'languagePrompt' && !isLanguageSelected ? (
              <>
                <p className="mb-2">{msg.text}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className="bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors duration-150 flex items-center justify-center space-x-1"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : msg.type === 'text_with_actions' && msg.data?.actions ? (
                <>
                    <p className="whitespace-pre-wrap mb-2">{msg.text}</p>
                    <div className="flex flex-col space-y-2 mt-2">
                        {msg.data.actions.map(action => (
                            <button
                                key={action.type}
                                onClick={() => handleActionClick(action.type)}
                                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors duration-150 flex items-center justify-center disabled:opacity-60"
                                disabled={isLoading}
                            >
                                {action.icon} {action.text}
                            </button>
                        ))}
                    </div>
                </>
            ) : msg.type === 'generated_message_template' && msg.data?.messageText ? (
                <>
                    <p className="whitespace-pre-wrap mb-2 italic">"{msg.data.messageText}"</p>
                    <button
                        onClick={() => copyToClipboard(msg.data.messageText)}
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-lg text-sm transition-colors duration-150 flex items-center justify-center w-full"
                        disabled={isLoading}
                    >
                        <Clipboard size={14} className="mr-1" /> Copy Message
                    </button>
                </>
            ) : (
              <p className="whitespace-pre-wrap">{msg.text}</p>
            )}
          </div>
        </div>
        <p className={`text-xs text-slate-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-8 h-8" />
            <h1 className="text-xl md:text-2xl font-bold">{AGENT_NAME}</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Globe className="w-5 h-5" />
            <span>{SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name || 'English'}</span>
            {userLocation && (
              <>
                <MapPin className="w-5 h-5" />
                <span className="truncate max-w-[100px] sm:max-w-[150px]">{userLocation}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        {isLoading && (
          <div className="flex items-center justify-start p-2">
            <Bot className="w-6 h-6 text-slate-500 mr-2" />
            <div className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg shadow">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-300"></div>
                <span className="text-sm">AlertHub is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-300 p-3 md:p-4 shadow-top">
        <div className="container mx-auto flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && inputValue.trim() && handleSendMessage()}
            placeholder={
              chatPhase === 'awaitingLanguage' ? "Select a language above..." :
              chatPhase === 'awaitingLocation' ? "Enter your city or postal code..." :
              chatPhase === 'awaitingHazardDetails' ? "Describe the hazard and location..." :
              "Type your message or use quick actions..."
            }
            className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-shadow"
            disabled={isLoading || (chatPhase === 'awaitingLanguage' && !isLanguageSelected)}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim() || (chatPhase === 'awaitingLanguage' && !isLanguageSelected)}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
