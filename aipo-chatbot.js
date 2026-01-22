/* AIPO CHATBOT INJECTION SCRIPT - TRIXIE (COMPACT & PURE CHAT VERSION)
  Goal: Get to know the user. No quick replies. 30% Smaller UI.
  Updated: 2026-01-22
*/

(function () {
    // 1. STYLES (Scaled down by ~30%)
    const css = `
        :root {
            --trixie-pink: #f472b6;
            --trixie-purple: #a78bfa;
            --trixie-glass: rgba(255, 255, 255, 0.95);
            --trixie-shadow: 0 10px 25px rgba(244, 114, 182, 0.2);
        }

        .aipo-chatbot-ui * { box-sizing: border-box; font-family: 'Outfit', 'Inter', sans-serif !important; }

        /* FAB - Reduced to 48px */
        .aipo-fab {
            position: fixed; bottom: 1.5rem; right: 1.5rem;
            width: 48px; height: 48px;
            background: linear-gradient(135deg, var(--trixie-pink), var(--trixie-purple));
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            color: white; cursor: pointer; box-shadow: var(--trixie-shadow);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 10000; border: none;
        }
        .aipo-fab:hover { transform: scale(1.1) rotate(15deg); }
        .aipo-fab svg { width: 24px; height: 24px; }

        /* Window - Reduced to 280px width, max height 450px */
        .aipo-chat-window {
            position: fixed; bottom: 5rem; right: 1.5rem;
            width: 280px; height: 450px; max-height: calc(100vh - 7rem);
            background: var(--trixie-glass); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 2px solid white; border-radius: 24px;
            box-shadow: var(--trixie-shadow); display: flex; flex-direction: column;
            overflow: hidden; opacity: 0; pointer-events: none;
            transform: translateY(30px) scale(0.9); transition: all 0.4s ease; z-index: 9999;
        }
        .aipo-chat-window.active { opacity: 1; pointer-events: all; transform: translateY(0) scale(1); }

        /* Header - Compact */
        .aipo-header {
            padding: 1rem; background: linear-gradient(135deg, rgba(244, 114, 182, 0.15), rgba(167, 139, 250, 0.15));
            border-bottom: 1px solid rgba(244, 114, 182, 0.1); display: flex; align-items: center; gap: 0.8rem;
        }
        .aipo-bot-icon { 
            width: 36px; height: 36px; 
            background: linear-gradient(135deg, var(--trixie-pink), var(--trixie-purple)); 
            border-radius: 50%; display: flex; align-items: center; justify-content: center; 
            color: white; border: 2px solid white; box-shadow: 0 4px 12px rgba(244, 114, 182, 0.2);
        }
        .aipo-bot-icon svg { width: 18px; height: 18px; }

        /* Messages - Smaller Fonts */
        .aipo-msg-container { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.8rem; }
        .aipo-msg { max-width: 90%; padding: 0.7rem 0.9rem; border-radius: 18px; font-size: 0.8rem; line-height: 1.5; animation: aipoIn 0.5s ease-out forwards; position: relative; }
        .aipo-bot-msg { background: white; color: #1e293b; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
        .aipo-user-msg { background: var(--trixie-pink); color: white; align-self: flex-end; border-bottom-right-radius: 4px; box-shadow: 0 4px 15px rgba(244, 114, 182, 0.2); }

        /* Input Area - Compact */
        .aipo-input-wrap { padding: 0.8rem; background: white; display: flex; gap: 0.5rem; border-top: 1px solid rgba(0,0,0,0.05); }
        .aipo-input { flex: 1; border: 2px solid #f1f5f9; border-radius: 14px; padding: 0.6rem 0.9rem; outline: none; transition: 0.3s; background: #f8fafc; font-size: 0.8rem; }
        .aipo-input:focus { border-color: var(--trixie-pink); background: white; box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.1); }
        .aipo-send-btn { background: var(--trixie-pink); color: white; border: none; width: 36px; height: 36px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .aipo-send-btn:hover { background: var(--trixie-purple); transform: scale(1.05); }
        .aipo-send-btn svg { width: 16px; height: 16px; }

        @keyframes aipoIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    `;

    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    // 2. HTML (Removed Replies Container)
    const container = document.createElement('div');
    container.className = 'aipo-chatbot-ui';
    container.innerHTML = `
        <button id="aipoFab" class="aipo-fab" title="Chat with Trixie">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
        <div id="aipoWindow" class="aipo-chat-window">
            <div class="aipo-header">
                <div class="aipo-bot-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M9 15c1 1.5 3 2 5 0"></path></svg>
                </div>
                <div style="line-height:1.2">
                    <div style="font-weight:800; color:#1e293b; font-size:0.9rem; letter-spacing:-0.5px">Trixie ✨</div>
                    <div style="font-size:0.65rem; color:#f472b6; font-weight:600">Your Sweetest Friend</div>
                </div>
            </div>
            <div id="aipoMsgs" class="aipo-msg-container"></div>
            <div class="aipo-input-wrap">
                <input type="text" id="aipoInp" class="aipo-input" placeholder="Say something...">
                <button id="aipoSubmit" class="aipo-send-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // 3. LOGIC & PERSONALITY (Cleaned up)
    const fab = document.getElementById('aipoFab');
    const win = document.getElementById('aipoWindow');
    const msgs = document.getElementById('aipoMsgs');
    const inp = document.getElementById('aipoInp');
    const sub = document.getElementById('aipoSubmit');

    let userData = { name: '', goal: '', vibe: '' };
    let phase = 'greeting'; 

    // Note: Options removed from dialogue objects
    const botDialogue = {
        greeting: {
            text: "Hiiiii! ✨ Oh my goodness, I'm so happy you're here! I was just sitting here thinking about who might visit today... and it's you! I'm Trixie. Can we be friends? 🌸"
        },
        getName: {
            text: "Yayyy! Besties already! 💖 I'm so curious though... what should I call you? Do you have a lovely name I can remember? ✨"
        },
        getInterests: {
            text: "Oh, {name}! That's such a beautiful name, I love it! ✨ So tell me, {name}, what brings a cool person like you here? Are you building something big? 🎀"
        },
        getGoal: {
            text: "That is SO interesting! {name}, you sound like someone with really big dreams! ✨ I'm curious... if you could finish one major thing today, what would it be? 🌸"
        },
        pitch: {
            text: "I KNEW IT! You're definitely a dreamer and a doer! 💖 Well, {name}, you should totally check out the AIPO system right here to help with that. Want to see how it works? ✨"
        },
        talkative_remark: {
            text: "Hehe, am I? I just have a lot of energy when I meet new people! 🌸 So... what's your name, treasure? ✨"
        }
    };

    let autoGreetCount = 0;
    
    // Auto-Open Logic
    function checkAutoGreet() {
        // Simple check: Is it between 9am and 3pm?
        const hour = new Date().getHours();
        if (hour < 9 || hour >= 15 || autoGreetCount >= 1) return;
        
        setTimeout(() => {
            if (!win.classList.contains('active')) {
                autoGreetCount++;
                win.classList.add('active');
                addBot(botDialogue.greeting);
            }
        }, 5000);
    }

    // Toggle Window
    fab.onclick = () => {
        win.classList.toggle('active');
        if (win.classList.contains('active') && msgs.children.length === 0) {
            setTimeout(() => addBot(botDialogue.greeting), 600);
        }
    };

    // Input Handling
    const handleInp = () => {
        const val = inp.value.trim();
        if (!val) return;
        addUser(val);
        inp.value = '';

        setTimeout(() => {
            if (phase === 'greeting') {
                if (val.toLowerCase().includes('talkative')) {
                    addBot(botDialogue.talkative_remark);
                } else {
                    phase = 'name';
                    addBot(botDialogue.getName);
                }
            } else if (phase === 'name') {
                userData.name = val;
                phase = 'interests';
                let resp = { ...botDialogue.getInterests };
                resp.text = resp.text.replace(/{name}/g, userData.name);
                addBot(resp);
            } else if (phase === 'interests') {
                userData.vibe = val;
                phase = 'goal';
                let resp = { ...botDialogue.getGoal };
                resp.text = resp.text.replace(/{name}/g, userData.name);
                addBot(resp);
            } else if (phase === 'goal') {
                userData.goal = val;
                phase = 'final';
                let resp = { ...botDialogue.pitch };
                resp.text = resp.text.replace(/{name}/g, userData.name);
                addBot(resp);
            } else {
                addBot({ text: `You're amazing, ${userData.name}! ✨ Use the 'Goal' box on this page to see the magic happen! 🌸` });
            }
        }, 1200);
    };

    sub.onclick = handleInp;
    inp.onkeypress = (e) => { if (e.key === 'Enter') handleInp(); };

    function addUser(t) {
        const d = document.createElement('div');
        d.className = 'aipo-msg aipo-user-msg'; d.textContent = t;
        msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    }

    function addBot(obj) {
        // Typing indicator
        const typing = document.createElement('div');
        typing.className = 'aipo-msg aipo-bot-msg';
        typing.innerHTML = '<span style="opacity:0.5; font-size:0.7rem">Trixie is typing...</span>';
        msgs.appendChild(typing);
        msgs.scrollTop = msgs.scrollHeight;

        setTimeout(() => {
            msgs.removeChild(typing);
            const d = document.createElement('div');
            d.className = 'aipo-msg aipo-bot-msg';
            d.innerHTML = obj.text;
            msgs.appendChild(d);
            msgs.scrollTop = msgs.scrollHeight;
        }, 1000);
    }

    checkAutoGreet();
})();
