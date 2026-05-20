// ============================
// আমার AI সহকারী - ভয়েস ইঞ্জিন
// ============================

// ব্রাউজার সাপোর্ট চেক (Speech Recognition ও Speech Synthesis)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;

// DOM এলিমেন্ট ধরে নেওয়া
const micBtn = document.getElementById('micBtn');
const responseBox = document.getElementById('responseBox');
const wave = document.getElementById('wave');
const btnText = micBtn.querySelector('.btn-text');

// রিকগনিশন অবজেক্ট তৈরি
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';  // বাংলা (বাংলাদেশ) - 'bn-IN' ও ব্যবহার করতে পারো
    recognition.interimResults = false; // পুরো কথা শেষ হলেই রেজাল্ট দেবে
    recognition.maxAlternatives = 1;    // একটি মাত্র বিকল্প নেবে
} else {
    alert('দুঃখিত, আপনার ব্রাউজারে ভয়েস রিকগনিশন সাপোর্ট করে না। Chrome ব্যবহার করুন।');
}

// রিকগনিশন ইভেন্ট হ্যান্ডলার (যখন কথা ধরা পড়বে)
if (recognition) {
    recognition.onresult = (event) => {
        // সবচেয়ে নির্ভরযোগ্য ট্রান্সক্রিপ্ট (যা ইউজার বলেছে)
        const transcript = event.results[0][0].transcript;
        responseBox.innerText = `আপনি বলেছেন: "${transcript}"`;

        // আপাতত ইকো হিসেবে জবাব দিচ্ছে, পরে কমান্ড প্রসেস হবে
        speak(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        responseBox.innerText = 'কিছু শুনতে পাইনি, আবার চেষ্টা করুন।';
        resetMicUI();
    };

    recognition.onend = () => {
        // রেকর্ডিং শেষ হলে UI রিসেট
        resetMicUI();
    };
}

// মাইক্রোফোন বাটনে ক্লিক করলে শোনা শুরু
micBtn.addEventListener('click', () => {
    if (!recognition) {
        alert('ভয়েস রিকগনিশন সাপোর্টেড নয়।');
        return;
    }
    // আগের কোনো কথা বলা থামিয়ে দাও
    window.speechSynthesis.cancel();
    // UI এক্টিভেট
    wave.classList.add('active');
    btnText.textContent = 'শুনছি...';
    // শোনা শুরু
    recognition.start();
});

// মাইক UI রিসেট ফাংশন
function resetMicUI() {
    wave.classList.remove('active');
    btnText.textContent = 'বলো কিছু';
}

// ============================
// স্পিচ আউটপুট (কথা বলা)
// ============================
function speak(text) {
    // আগের কথা থামাও
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD';            // বাংলা উচ্চারণ
    utterance.rate = 1.0;               // স্বাভাবিক গতি
    utterance.pitch = 1.0;              // স্বাভাবিক সুর
    utterance.volume = 1.0;             // পূর্ণ আওয়াজ

    // কোনো ভয়েস অ্যাভেইলেবল না থাকলে ডিফল্ট ব্যবহার করবে
    const voices = window.speechSynthesis.getVoices();
    // বাংলা ভয়েস খোঁজার চেষ্টা (সব ডিভাইসে নাও থাকতে পারে)
    const bnVoice = voices.find(voice => voice.lang.includes('bn'));
    if (bnVoice) utterance.voice = bnVoice;

    // বলো
    window.speechSynthesis.speak(utterance);

    // কথা বলার সময় রেসপন্স বক্সেও লেখাটি দেখাও
    responseBox.innerText = text;
}

// কিছু ডিভাইসে getVoices() async এ লোড হয়, তাই voices changed ইভেন্টেও সেট করা যায়
window.speechSynthesis.onvoiceschanged = () => {
    // দরকার হলে এখানে বাংলা ভয়েস পুনরায় সিলেক্ট করা যায়, কিন্তু এখন দরকার নেই।
};
