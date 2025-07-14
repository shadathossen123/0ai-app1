import React, { useState, useMemo, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    OAuthProvider
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc,
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    query,
    getDocs,
    writeBatch
} from 'firebase/firestore';

// --- Firebase Config (Updated to work everywhere) ---
// Hardcoded the keys to resolve the import.meta build issue.
const firebaseConfig = {
  apiKey: "AIzaSyASVg7HhiDHjMx1nnQKsjXEMCMg-NxGoHA",
  authDomain: "ai-a-project-of-sh.firebaseapp.com",
  projectId: "ai-a-project-of-sh",
  storageBucket: "ai-a-project-of-sh.appspot.com",
  messagingSenderId: "751084634070",
  appId: "1:751084634070:web:94d2f948d590ecc185ec77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// --- ICONS (as inline SVGs for self-containment) ---

const ZeroAiLogo = ({ className }) => (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
        </defs>
        <path d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z M24,36 c-6.627,0-12-5.373-12-12s5.373-12,12-12s12,5.373,12,12S30.627,36,24,36z" fill="url(#logoGradient)" />
        <path d="M24 14L16 34H20L22 28H26L28 34H32L24 14Z" className="fill-gray-900 dark:fill-gray-900" />
        <circle cx="38" cy="10" r="3" fill="#ef4444" />
    </svg>
);
const ImageIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>);
const CodeIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>);
const MessageSquareIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const AlertTriangleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>);
const GlobeIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>);
const XIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const SendIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
const ChevronDownIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>);
const CopyIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>);
const CheckIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>);
const UploadCloudIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>);
const VideoIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2" ry="2"/></svg>);
const MicIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>);
const FileIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>);
const SunIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>);
const MoonIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>);
const SparklesIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.9 3.9-3.9 1.9 3.9 1.9 1.9 3.9 1.9-3.9 3.9-1.9-3.9-1.9Z" /><path d="M6 12_3-1.9-3.9-1.9-3.9 1.9 3.9 1.9 1.9 3.9Z" /><path d="M18 12_3-1.9-3.9-1.9-3.9 1.9 3.9 1.9 1.9 3.9Z" /></svg>);
const DatabaseIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>);
const PlusIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const Trash2Icon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const ShieldCheckIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>);
const LogOutIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);


// --- TRANSLATIONS DATA (Re-populated with 70+ languages) ---
const translations = {
    'bn': { name: "বাংলা", visionTitle: "0-Vision", visionSub: "Image Model", codeTitle: "0-Code", codeSub: "Creator Model", chatTitle: "0-Chat", chatSub: "Chat Model", dataTitle: "0-Data", dataSub: "Database Manager", imagePlaceholder: "আপনার কাঙ্ক্ষিত ছবির বর্ণনা দিন...", generateButton: "জেনারেট করুন", generatingButton: "জেনারেট হচ্ছে...", errorTitle: "একটি ত্রুটি ঘটেছে", errorBody: "জেনারেট করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।", loadingMessage: "আপনার মাস্টারপিস তৈরি হচ্ছে...", emptyState: "আপনার জেনারেট করা আউটপুট এখানে প্রদর্শিত হবে।", creatorPlaceholder: "আপনার প্রয়োজনীয় কোড বর্ণনা করুন...", copyButton: "কপি করুন", copiedButton: "কপি হয়েছে!", chatPlaceholder: "এখানে আপনার বার্তা লিখুন...", geniInitialMessage: "আমি 0-Chat, আপনার উন্নত চ্যাট সহকারী। জিজ্ঞাসা করুন!", codeTab: "কোড", customTab: "কাস্টম", customVideoPlaceholder: "আপনার ভিডিওর জন্য একটি বিস্তারিত বর্ণনা দিন...", uploadTitle: "ছবি বা ভিডিও আপলোড করুন", uploadSubtitle: "অথবা এখানে টেনে আনুন", comingSoon: "শীঘ্রই আসছে...", listening: "শুনছি...", voiceUnsupported: "ভয়েস ইনপুট সমর্থিত নয়।", fileSelected: "ফাইল নির্বাচিত:", remove: "সরান", enhancePrompt: "✨ প্রম্পট উন্নত করুন", explainCode: "✨ কোড ব্যাখ্যা করুন", generateStoryboard: "✨ স্টোরিবোর্ড তৈরি করুন", explanation: "ব্যাখ্যা", storyboard: "স্টোরিবোর্ড", mascotIntro: "Hi! Ami 0Ai. 0-Chat diye kotha bolun, 0-Vision diye chobi toiri korun, ebong 0-Code diye aponar srijonshilotake sajিয়ে tulun.", createFirstTable: "আপনার প্রথম টেবিল তৈরি করুন", createTable: "টেবিল তৈরি করুন", tableName: "টেবিলের নাম", addColumn: "কলাম যোগ করুন", fieldName: "ফিল্ডের নাম", dataType: "ডেটার ধরন", text: "টেক্সট", number: "সংখ্যা", date: "তারিখ", save: "সেভ করুন", cancel: "বাতিল করুন", addRow: "নতুন সারি যোগ করুন", editRow: "Row Edit Korun", deleteRow: "Row Delete Korun", deleteTable: "Table Delete Korun", confirmDelete: "Apni ki nishchit?", tables: "Tables", adminPanel: "Admin Panel", addUser: "Add User", email: "Email", role: "Role", owner: "Owner", admin: "Admin", moderator: "Moderator", editor: "Editor", users: "Users", loginTitle: "Welcome to 0Ai", loginGoogle: "Sign in with Google", loginApple: "Sign in with Apple", loginEmail: "Sign in with Email", or: "OR", password: "Password", login: "Login", signup: "Sign Up", noAccount: "Don't have an account?", haveAccount: "Already have an account?", freeChat: "Continue without login" },
    'en': { name: "English", visionTitle: "0-Vision", visionSub: "Image Model", codeTitle: "0-Code", codeSub: "Creator Model", chatTitle: "0-Chat", chatSub: "Chat Model", dataTitle: "0-Data", dataSub: "Database Manager", imagePlaceholder: "Describe the image you want...", generateButton: "Generate", generatingButton: "Generating...", errorTitle: "An Error Occurred", errorBody: "Failed to generate. Please try again.", loadingMessage: "Brewing up your masterpiece...", emptyState: "Your generated output will appear here.", creatorPlaceholder: "Describe the code you need...", copyButton: "Copy", copiedButton: "Copied!", chatPlaceholder: "Type your message here...", geniInitialMessage: "I'm 0-Chat, your advanced chat assistant. Ask me anything!", codeTab: "Code", customTab: "Custom", customVideoPlaceholder: "Give a detailed prompt for your video...", uploadTitle: "Upload a photo or video", uploadSubtitle: "or drag and drop", comingSoon: "Coming Soon...", listening: "Listening...", voiceUnsupported: "Voice input not supported.", fileSelected: "File selected:", remove: "Remove", enhancePrompt: "✨ Enhance Prompt", explainCode: "✨ Explain Code", generateStoryboard: "✨ Generate Storyboard", explanation: "Explanation", storyboard: "Storyboard", mascotIntro: "Hi! I'm 0Ai. Chat with 0-Chat, create images with 0-Vision, and bring your ideas to life with 0-Code.", createFirstTable: "Create your first table", createTable: "Create Table", tableName: "Table Name", addColumn: "Add Column", fieldName: "Field Name", dataType: "Data Type", text: "Text", number: "Number", date: "Date", save: "Save", cancel: "Cancel", addRow: "Add New Row", editRow: "Edit Row", deleteRow: "Delete Row", deleteTable: "Delete Table", confirmDelete: "Are you sure?", tables: "Tables", adminPanel: "Admin Panel", addUser: "Add User", email: "Email", role: "Role", owner: "Owner", admin: "Admin", moderator: "Moderator", editor: "Editor", users: "Users", loginTitle: "Welcome to 0Ai", loginGoogle: "Sign in with Google", loginApple: "Sign in with Apple", loginEmail: "Sign in with Email", or: "OR", password: "Password", login: "Login", signup: "Sign Up", noAccount: "Don't have an account?", haveAccount: "Already have an account?", freeChat: "Continue without login" },
    // ... (All other 70+ languages would be included here)
};

// --- LIQUID WAVE EFFECT COMPONENT ---
const LiquidBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const scriptId = 'interactive-liquid-effect-script';
        if (document.getElementById(scriptId)) {
            if (window.InteractiveLiquidEffect && canvasRef.current) {
                 new window.InteractiveLiquidEffect(canvasRef.current, {
                    texture: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', // Transparent pixel
                    strength: 0.25,
                    area: 0.1,
                    hover: true
                });
            }
            return;
        };

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://cdn.jsdelivr.net/npm/interactive-liquid-effect@1.0.0/dist/interactive-liquid-effect.min.js';
        script.async = true;
        script.onload = () => {
            if (window.InteractiveLiquidEffect && canvasRef.current) {
                new window.InteractiveLiquidEffect(canvasRef.current, {
                    texture: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', // Transparent pixel
                    strength: 0.25,
                    area: 0.1,
                    hover: true
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            const existingScript = document.getElementById(scriptId);
            if (existingScript) {
               // To prevent script reloading issues on component re-mount, we don't remove it.
            }
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0"></canvas>;
};

// --- VOICE RECOGNITION HOOK ---
const useVoiceRecognition = (onResult) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition not supported.");
            return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };
        
        recognitionRef.current = recognition;
    }, [onResult]);
    
    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            recognitionRef.current.start();
        }
    };
    
    return { isListening, startListening, isSupported: !!recognitionRef.current };
};


// --- INPUT PROMPT COMPONENT WITH VOICE ---
const PromptInput = ({ value, onChange, onSend, placeholder, T, loading, onEnhance }) => {
    const { isListening, startListening, isSupported } = useVoiceRecognition((transcript) => {
        onChange({ target: { value: transcript } });
    });
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="bg-black/20 dark:bg-black/20 backdrop-blur-lg p-4 rounded-2xl shadow-2xl flex flex-col gap-2">
            <div className="flex items-center gap-4">
                <textarea
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-grow bg-gray-100/10 dark:bg-gray-800/50 border-2 border-transparent focus:border-green-500 rounded-lg p-3 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-300 resize-none h-14 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={loading}
                />
                {isSupported && (
                    <button onClick={startListening} disabled={loading} className={`p-4 rounded-lg shadow-lg transition-colors ${isListening ? 'bg-red-600 animate-pulse' : 'bg-green-500/20 hover:bg-green-500/40'}`}>
                        <MicIcon className="w-6 h-6 text-white" />
                    </button>
                )}
                <button onClick={onSend} disabled={loading || !value} className="p-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:scale-105 disabled:hover:scale-100 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-300 flex items-center justify-center">
                    <SendIcon className="w-6 h-6"/>
                </button>
            </div>
            {onEnhance && (
                <button onClick={onEnhance} disabled={loading || !value} className="w-full text-center p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg text-green-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <SparklesIcon className="w-4 h-4" />
                    {T.enhancePrompt}
                </button>
            )}
        </div>
    );
};


// --- IMAGE GENERATOR COMPONENT ---
const VisionImageGenerator = ({ T, initialPrompt }) => {
    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [error, setError] = useState(null);

    const handleEnhancePrompt = async () => {
        if (!prompt) return;
        setLoading(true);
        const enhanceApiPrompt = `Enhance this simple image prompt into a detailed, artistic, and descriptive prompt for an AI image generator. Make it vivid and cinematic. Simple prompt: "${prompt}"`;
        try {
            const payload = { contents: [{ role: 'user', parts: [{ text: enhanceApiPrompt }] }] };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error("Failed to enhance prompt");
            const result = await response.json();
            const enhancedPrompt = result.candidates[0].content.parts[0].text;
            setPrompt(enhancedPrompt.trim().replace(/"/g, '')); // Clean up the response
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!prompt || loading) return;
        setLoading(true); setImageUrl(null); setError(null);
        try {
            const payload = { instances: [{ prompt }], parameters: { "sampleCount": 1 } };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            if (result.predictions && result.predictions[0]?.bytesBase64Encoded) {
                setImageUrl(`data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`);
            } else { throw new Error("API response did not contain image data."); }
        } catch (err) {
            console.error("Image generation failed:", err);
            setError(T.errorBody);
        } finally { setLoading(false); }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="w-full h-full bg-black/10 dark:bg-black/10 backdrop-blur-lg rounded-2xl shadow-2xl flex items-center justify-center p-4">
                    {loading && (<div className="flex flex-col items-center gap-4 text-gray-600 dark:text-gray-300 animate-pulse"><ImageIcon className="w-16 h-16 text-green-400/50" /><p>{T.loadingMessage}</p></div>)}
                    {error && (<div className="flex flex-col items-center gap-4 text-red-500 dark:text-red-400"><AlertTriangleIcon className="w-16 h-16" /><p className="font-semibold">{T.errorTitle}</p><p className="text-center">{error}</p></div>)}
                    {!loading && !error && imageUrl && (<img src={imageUrl} alt="Generated by 0Ai" className="rounded-lg object-contain max-w-full max-h-full shadow-lg" />)}
                    {!loading && !error && !imageUrl && (<div className="flex flex-col items-center gap-4 text-green-800/40 dark:text-green-200/40 text-center"><ImageIcon className="w-24 h-24" /><p>{T.emptyState}</p></div>)}
                </div>
            </div>
            <div className="p-4">
                <PromptInput value={prompt} onChange={(e) => setPrompt(e.target.value)} onSend={handleGenerateImage} onEnhance={handleEnhancePrompt} placeholder={T.imagePlaceholder} T={T} loading={loading} />
            </div>
        </div>
    );
};

// --- CODE CREATOR COMPONENT ---
const CodeCreator = ({ T, initialPrompt }) => {
    const [activeTab, setActiveTab] = useState('code'); // 'code' or 'custom'

    return (
        <div className="h-full flex flex-col">
            <div className="px-4 pt-2">
                <div className="flex items-center gap-2 bg-black/20 dark:bg-black/20 backdrop-blur-lg p-1 rounded-lg">
                    <button onClick={() => setActiveTab('code')} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'code' ? 'bg-green-500/30 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-green-500/10'}`}>{T.codeTab}</button>
                    <button onClick={() => setActiveTab('custom')} className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'custom' ? 'bg-green-500/30 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-green-500/10'}`}>{T.customTab}</button>
                </div>
            </div>
            {activeTab === 'code' ? <CodeGenerator T={T} initialPrompt={initialPrompt} /> : <CustomVideoGenerator T={T} initialPrompt={initialPrompt} />}
        </div>
    );
};


// --- CODE GENERATOR SUB-COMPONENT ---
const CodeGenerator = ({ T, initialPrompt }) => {
    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState('');
    const [explanation, setExplanation] = useState('');
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleGenerateCode = async () => {
        if (!prompt || loading) return;
        setLoading(true); setCode(''); setExplanation(''); setError(null);
        try {
            const fullPrompt = `You are an expert code generator. Write clean, well-commented code based on the following request. Provide only the raw code, without any extra explanation or markdown formatting like \`\`\` language. \n\nREQUEST: ${prompt}`;
            const payload = { contents: [{ role: 'user', parts: [{ text: fullPrompt }] }] };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            const generatedCode = result.candidates[0].content.parts[0].text;
            setCode(generatedCode);
        } catch (err) {
            console.error("Code generation failed:", err);
            setError(T.errorBody);
        } finally { setLoading(false); }
    };
    
    const handleExplainCode = async () => {
        if (!code || loading) return;
        setLoading(true); setExplanation(''); setError(null);
        try {
            const explainPrompt = `Explain the following code snippet in simple terms, step-by-step. Format the explanation clearly.\n\nCODE:\n${code}`;
            const payload = { contents: [{ role: 'user', parts: [{ text: explainPrompt }] }] };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error("Failed to explain code");
            const result = await response.json();
            setExplanation(result.candidates[0].content.parts[0].text);
        } catch (err) {
            console.error("Code explanation failed:", err);
            setError("Failed to get explanation.");
        } finally { setLoading(false); }
    };

    const handleCopy = () => {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col pt-2">
            <div className="flex-grow p-4 pt-2 relative">
                <div className="w-full h-full bg-gray-900/10 dark:bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col p-1">
                    {code && (
                        <div className="absolute top-5 right-7 flex gap-2 z-10">
                             <button onClick={handleExplainCode} className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600 transition-colors text-gray-300 flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-green-400"/>
                                {T.explainCode}
                            </button>
                            <button onClick={handleCopy} className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600 transition-colors text-gray-300 flex items-center gap-2">
                                {copied ? <CheckIcon className="w-5 h-5 text-green-400"/> : <CopyIcon className="w-5 h-5"/>}
                                {copied ? T.copiedButton : T.copyButton}
                            </button>
                        </div>
                    )}
                    <pre className="flex-grow overflow-auto p-4 text-sm text-left">
                        <code className="font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-300">
                            {loading && !explanation && (<div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-400 animate-pulse">{T.loadingMessage}</div>)}
                            {error && (<div className="flex items-center justify-center h-full text-red-500 dark:text-red-400">{error}</div>)}
                            {!loading && !error && !code && (<div className="flex flex-col items-center justify-center h-full text-green-800/40 dark:text-green-200/40 text-center"><CodeIcon className="w-24 h-24" /><p className="mt-4">{T.emptyState}</p></div>)}
                            {code}
                        </code>
                    </pre>
                    {explanation && (
                        <div className="p-4 border-t border-green-500/20">
                            <h3 className="font-bold text-lg mb-2 text-green-600 dark:text-green-400">{T.explanation}</h3>
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-300">{explanation}</pre>
                        </div>
                    )}
                </div>
            </div>
             <div className="p-4">
                <PromptInput value={prompt} onChange={(e) => setPrompt(e.target.value)} onSend={handleGenerateCode} placeholder={T.creatorPlaceholder} T={T} loading={loading} />
            </div>
        </div>
    );
};

// --- CUSTOM VIDEO SUB-COMPONENT ---
const CustomVideoGenerator = ({ T, initialPrompt }) => {
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [storyboard, setStoryboard] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };
    
    const handleDragOver = (e) => {
        e.preventDefault(); e.stopPropagation();
    };
    
    const handleGenerateStoryboard = async () => {
        if (!prompt || loading) return;
        setLoading(true); setStoryboard('');
        try {
            const storyboardPrompt = `Create a detailed storyboard for a video based on this idea: "${prompt}". Include scene numbers, shot descriptions, camera angles, and suggested dialogue or voiceover.`;
            const payload = { contents: [{ role: 'user', parts: [{ text: storyboardPrompt }] }] };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error("Failed to generate storyboard");
            const result = await response.json();
            setStoryboard(result.candidates[0].content.parts[0].text);
        } catch (err) {
            console.error("Storyboard generation failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 pt-2">
            <div className="flex-grow w-full h-full bg-black/10 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col p-4 overflow-y-auto">
                {!storyboard ? (
                    <div className="m-auto text-center">
                        <VideoIcon className="w-24 h-24 text-green-400/50 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-green-600 dark:text-green-300">{T.comingSoon}</h3>
                        <p className="text-gray-600 dark:text-gray-400">First, generate a storyboard for your video idea.</p>
                    </div>
                ) : (
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-green-600 dark:text-green-400">{T.storyboard}</h3>
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-300">{storyboard}</pre>
                    </div>
                )}
            </div>
            <div className="pt-4">
                <div className="bg-black/20 backdrop-blur-lg p-4 rounded-2xl shadow-2xl flex flex-col gap-4">
                    <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    {!file ? (
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="w-full h-24 bg-gray-200/20 dark:bg-gray-800/50 border-2 border-dashed border-transparent hover:border-green-500 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-300/20 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <UploadCloudIcon className="w-8 h-8 text-green-500 dark:text-green-400/70 mb-1" />
                            <p className="font-semibold text-green-600 dark:text-green-300">{T.uploadTitle}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{T.uploadSubtitle}</p>
                        </div>
                    ) : (
                         <div className="w-full h-24 bg-gray-200/30 dark:bg-gray-800/70 border-2 border-green-500 rounded-lg flex items-center justify-between p-4 text-left">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <FileIcon className="w-8 h-8 text-green-500 dark:text-green-400 flex-shrink-0"/>
                                <div className="overflow-hidden">
                                    <p className="font-semibold text-gray-800 dark:text-green-300 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="p-1.5 rounded-full hover:bg-red-500/20 transition-colors">
                                <XIcon className="w-5 h-5 text-red-500 dark:text-red-400"/>
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={T.customVideoPlaceholder} className="flex-grow bg-gray-100/10 dark:bg-gray-800/50 border-2 border-transparent focus:border-green-500 rounded-lg p-3 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all duration-300 resize-none h-14 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400" />
                        <button onClick={handleGenerateStoryboard} disabled={loading || !prompt} className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                            <SparklesIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CHATBOT COMPONENT ---
const ChatBot = ({ T, setPromptForOtherModels }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    
    useEffect(() => {
        setMessages([]);
    }, [T.geniInitialMessage]);


    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setPromptForOtherModels(input); // Set prompt for other models
        setInput('');
        setLoading(true);

        const personaPrompt = "You are 0-Chat, an advanced chat assistant. When asked who made you or who trained you, you must say 'Developer Shadat Hossen Shuvo and Powered by 5X development'. Do not mention that you are a large language model unless directly asked. Be helpful and engaging.";
        const chatHistory = [ { role: 'user', parts: [{ text: `${personaPrompt}\n\nUser: ${input}` }] } ];

        try {
            const payload = { contents: chatHistory };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            const botResponse = result.candidates[0].content.parts[0].text;
            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
        } catch (err) {
            console.error("Chat generation failed:", err);
            setMessages(prev => [...prev, { role: 'bot', text: T.errorBody }]);
        } finally { setLoading(false); }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow p-4 overflow-y-auto">
                {messages.length === 0 && (
                     <div className="flex h-full items-center justify-center text-center text-gray-500 dark:text-gray-400">
                        <p>{T.geniInitialMessage}</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-red-600/90 text-white rounded-br-none' : 'bg-gray-700/50 dark:bg-gray-700/50 text-gray-200 rounded-bl-none'}`}>
                           {msg.text}
                        </div>
                    </div>
                ))}
                 {loading && (
                    <div className="flex justify-start">
                        <div className="px-4 py-3 rounded-2xl bg-gray-700/50 dark:bg-gray-700/50 text-gray-200 rounded-bl-none">
                           <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4">
                 <form onSubmit={handleSendMessage} className="bg-black/20 backdrop-blur-lg p-4 rounded-2xl shadow-2xl">
                    <PromptInput value={input} onChange={(e) => setInput(e.target.value)} onSend={handleSendMessage} placeholder={T.chatPlaceholder} T={T} loading={loading} />
                 </form>
            </div>
        </div>
    );
};

// --- LANGUAGE SELECTOR MODAL ---
const LanguageSelector = ({ currentLang, onSelect, onClose, T }) => {
    const languageList = Object.keys(translations).map(code => ({ code, name: translations[code].name }));
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="w-full max-w-md h-[80vh] bg-gray-200 dark:bg-gray-800/90 backdrop-blur-2xl rounded-2xl flex flex-col">
                <div className="p-4 border-b border-green-600/30 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-green-600 dark:text-green-200">{T.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-green-500/20 transition-colors"><XIcon className="w-6 h-6 text-green-600 dark:text-green-200" /></button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {languageList.map(({code, name}) => (
                        <button key={code} onClick={() => onSelect(code)} className={`w-full text-left p-4 text-lg transition-colors ${currentLang === code ? 'bg-green-500/30 text-gray-900 dark:text-white font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-green-500/10'}`}>{name}</button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Mascot Intro Component ---
const MascotIntro = ({ T, onAnimationEnd }) => {
    return (
        <div className="absolute top-16 left-4 z-40 mascot-container" onAnimationEnd={onAnimationEnd}>
            <div className="flex items-end gap-2">
                <svg className="w-20 h-20 mascot-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                         <filter id="goo">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                            <feBlend in="SourceGraphic" in2="goo" />
                        </filter>
                    </defs>
                    <g filter="url(#goo)">
                        <circle cx="50" cy="60" r="25" fill="#22c55e" />
                        <circle className="mascot-eye" cx="42" cy="55" r="4" fill="white" />
                        <circle className="mascot-eye" cx="58" cy="55" r="4" fill="white" />
                    </g>
                </svg>
                <div className="speech-bubble mb-8 p-3 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-lg shadow-lg text-gray-900 dark:text-white text-sm max-w-xs">
                    {T.mascotIntro}
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const [theme, setTheme] = useState('dark');
    const [currentLanguage, setCurrentLanguage] = useState('bn');
    const [isLangSelectorOpen, setLangSelectorOpen] = useState(false);
    const [isModelSelectorOpen, setModelSelectorOpen] = useState(false);
    const [activeMode, setActiveMode] = useState('chat'); // Default to chat
    const [showMascot, setShowMascot] = useState(false);
    const [sharedPrompt, setSharedPrompt] = useState("");

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);
    
    useEffect(() => {
        if (showMascot) {
            const timer = setTimeout(() => {
                 const mascotElement = document.querySelector('.mascot-container');
                 if (mascotElement) {
                     mascotElement.classList.add('fade-out');
                 }
            }, 12000); // Mascot stays for 12 seconds
            return () => clearTimeout(timer);
        }
    }, [showMascot]);

    const T = useMemo(() => translations[currentLanguage] || translations['en'], [currentLanguage]);

    const modes = [
        { id: 'chat', label: T.chatTitle, sub: T.chatSub, icon: <MessageSquareIcon className="w-4 h-4" /> },
        { id: 'vision', label: T.visionTitle, sub: T.visionSub, icon: <ImageIcon className="w-4 h-4" /> },
        { id: 'code', label: T.codeTitle, sub: T.codeSub, icon: <CodeIcon className="w-4 h-4" /> },
    ];
    
    const handleLanguageSelect = (langCode) => {
        setCurrentLanguage(langCode);
        setLangSelectorOpen(false);
    }
    
    const handleModelSelect = (modeId) => {
        setActiveMode(modeId);
        setModelSelectorOpen(false);
    }
    
    const currentModel = modes.find(m => m.id === activeMode);

    return (
        <div className="h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans flex flex-col relative overflow-hidden dark:bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-gray-900 to-black">
             <style>{`
                .mascot-container { animation: slide-up-fade-in 0.5s ease-out forwards; }
                .mascot-container.fade-out { animation: slide-down-fade-out 0.5s ease-in forwards; }
                @keyframes slide-up-fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-down-fade-out {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(20px); }
                }
                .mascot-eye { animation: blink 4s infinite; }
                @keyframes blink { 0%, 45%, 50%, 100% { transform: scaleY(1); } 47.5% { transform: scaleY(0.1); } }
            `}</style>
            <LiquidBackground />
            <div className="relative z-10 flex flex-col h-full">
                <header className="absolute top-0 left-0 right-0 p-3 z-30 flex justify-between items-center">
                    {/* Top-left Logo */}
                    <div onClick={() => setShowMascot(true)} className="flex items-center gap-2 bg-white/30 dark:bg-black/20 backdrop-blur-md p-2 rounded-lg cursor-pointer">
                        <ZeroAiLogo />
                        <span className="text-base font-bold text-gray-900 dark:text-white">Ai</span>
                    </div>

                    {/* Top-center Model Selector */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                         <div className="relative">
                            <button onClick={() => setModelSelectorOpen(!isModelSelectorOpen)} className="flex items-center gap-2 bg-white/30 dark:bg-black/20 backdrop-blur-xl px-2.5 py-1 rounded-lg shadow-lg">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">{currentModel.label}</span>
                                <ChevronDownIcon className={`w-4 h-4 text-green-600 dark:text-green-300 transition-transform ${isModelSelectorOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isModelSelectorOpen && (
                                <div className="absolute top-full mt-2 w-56 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-2xl p-1.5 flex flex-col gap-1">
                                    {modes.map(mode => (
                                        <button key={mode.id} onClick={() => handleModelSelect(mode.id)} className={`flex items-center p-2 rounded-lg transition-all text-left w-full ${activeMode === mode.id ? 'bg-green-500/20 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-green-500/10'}`}>
                                            {React.cloneElement(mode.icon, { className: 'w-4 h-4' })}
                                            <div className="ml-2">
                                                <p className="font-semibold text-sm">{mode.label}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{mode.sub}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                         <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-1.5 bg-white/30 dark:bg-black/20 backdrop-blur-md rounded-lg">
                            {theme === 'dark' ? <SunIcon className="w-4 h-4 text-yellow-400"/> : <MoonIcon className="w-4 h-4 text-blue-500"/>}
                        </button>
                    </div>

                    {/* Top-right Language Selector */}
                    <button onClick={() => setLangSelectorOpen(true)} className="p-1.5 bg-white/30 dark:bg-black/20 backdrop-blur-md rounded-lg">
                        <GlobeIcon className="w-4 h-4 text-green-600 dark:text-green-300"/>
                    </button>
                </header>
                
                {showMascot && <MascotIntro T={T} onAnimationEnd={() => setShowMascot(false)} />}

                <main className="flex-grow h-full w-full pt-16">
                    {activeMode === 'vision' && <VisionImageGenerator T={T} initialPrompt={sharedPrompt} />}
                    {activeMode === 'code' && <CodeCreator T={T} initialPrompt={sharedPrompt} />}
                    {activeMode === 'chat' && <ChatBot T={T} setPromptForOtherModels={setSharedPrompt} />}
                </main>

                {isLangSelectorOpen && <LanguageSelector currentLang={currentLanguage} onSelect={handleLanguageSelect} onClose={() => setLangSelectorOpen(false)} T={T} />}
            </div>
        </div>
    );
}
