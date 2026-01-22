/* 
  AIPO CHATBOT INJECTION SCRIPT 
  Instructions: Send this file to the repository owner and ask them to:
  1. Add <script src="aipo-chatbot.js"></script> before the closing </body> tag.
*/

(function () {
    // 1. ADD STYLES
    const css = `
        :root {
            --aipo-primary: #2563eb;
            --aipo-secondary: #8b5cf6;
            --aipo-accent: #f43f5e;
            --aipo-bg-glass: rgba(255, 255, 255, 0.75);
            --aipo-text-p: #1e293b;
            --aipo-text-s: #64748b;
            --aipo-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            --aipo-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .aipo-chatbot-ui * { box-sizing: border-box; font-family: 'Inter', sans-serif !important; }

        .aipo-fab {
            position: fixed; bottom: 2rem; right: 2rem;
            width: 65px; height: 65px;
            background: linear-gradient(135deg, var(--aipo-primary), var(--aipo-secondary));
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            color: white; cursor: pointer; box-shadow: var(--aipo-shadow);
            transition: var(--aipo-transition); z-index: 10000; border: none; outline: none;
        }
        .aipo-fab:hover { transform: scale(1.1) rotate(10deg); box-shadow: 0 15px 30px rgba(37, 99, 235, 0.4); }

        .aipo-chat-window {
            position: fixed; bottom: 7.5rem; right: 2rem;
            width: 380px; height: 550px; max-height: calc(100vh - 10rem);
            background: var(--aipo-bg-glass); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 28px;
            box-shadow: var(--aipo-shadow); display: flex; flex-direction: column;
            overflow: hidden; opacity: 0; pointer-events: none;
            transform: translateY(30px) scale(0.95); transition: var(--aipo-transition); z-index: 9999;
        }
        .aipo-chat-window.active { opacity: 1; pointer-events: all; transform: translateY(0) scale(1); }

        .aipo-header {
            padding: 1.5rem; background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(139, 92, 246, 0.1));
            border-bottom: 1px solid rgba(255, 255, 255, 0.4); display: flex; align-items: center; gap: 1rem;
        }
        .aipo-bot-icon { width: 45px; height: 45px; background: linear-gradient(135deg, var(--aipo-primary), var(--aipo-secondary)); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; }

        .aipo-msg-container { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .aipo-msg { max-width: 85%; padding: 0.9rem 1.1rem; border-radius: 20px; font-size: 0.92rem; line-height: 1.5; animation: aipoIn 0.4s ease forwards; }
        .aipo-bot-msg { background: white; color: var(--aipo-text-p); align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .aipo-user-msg { background: var(--aipo-primary); color: white; align-self: flex-end; border-bottom-right-radius: 4px; }

        .aipo-input-wrap { padding: 1.25rem; background: white; border-top: 1px solid rgba(0,0,0,0.05); display: flex; gap: 0.6rem; }
        .aipo-input { flex: 1; border: 1px solid #e2e8f0; border-radius: 14px; padding: 0.75rem 1.1rem; outline: none; transition: 0.2s; }
        .aipo-input:focus { border-color: var(--aipo-primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        .aipo-send-btn { background: var(--aipo-primary); color: white; border: none; width: 45px; height: 45px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .aipo-send-btn:hover { background: var(--aipo-secondary); transform: translateY(-2px); }

        .aipo-quick-replies { display: flex; flex-wrap: wrap; gap: 0.6rem; padding: 0 1.5rem 1.25rem; }
        .aipo-reply { background: white; border: 1.5px solid rgba(37, 99, 235, 0.2); color: var(--aipo-primary); padding: 0.5rem 1rem; border-radius: 22px; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: 0.2s; }
        .aipo-reply:hover { background: var(--aipo-primary); color: white; border-color: var(--aipo-primary); }

        @keyframes aipoIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    `;

    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    // 2. ADD HTML
    const container = document.createElement('div');
    container.className = 'aipo-chatbot-ui';
    container.innerHTML = `
        <button id="aipoFab" class="aipo-fab">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
        <div id="aipoWindow" class="aipo-chat-window">
            <div class="aipo-header">
                <div class="aipo-bot-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
                </div>
                <div style="line-height:1.2">
                    <div style="font-weight:700; color:#1e293b; font-size:1.1rem">AIPO Assistant</div>
                    <div style="font-size:0.75rem; color:#64748b">AI-Powered Product Owner</div>
                </div>
            </div>
            <div id="aipoMsgs" class="aipo-msg-container"></div>
            <div id="aipoReplies" class="aipo-quick-replies"></div>
            <div class="aipo-input-wrap">
                <input type="text" id="aipoInp" class="aipo-input" placeholder="Type your goal...">
                <button id="aipoSubmit" class="aipo-send-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // 3. LOGIC
    const fab = document.getElementById('aipoFab');
    const win = document.getElementById('aipoWindow');
    const msgs = document.getElementById('aipoMsgs');
    const inp = document.getElementById('aipoInp');
    const sub = document.getElementById('aipoSubmit');
    const reps = document.getElementById('aipoReplies');

    const botConvo = {
        greeting: {
            text: "Welcome to AIPO! I'm your AI Product Owner assistant. I bridge the gap between goals and execution. Ready to break down a project?",
            options: ["Start Automation", "How it works?", "Contact Support"]
        },
        automation: {
            text: "Great choice! AIPO uses **Fractal Decomposition** to ensure no context is lost. Want to see how we handle large-scale task trees?",
            options: ["Show Example", "Try it now"]
        },
        demo: {
            text: "You're already on the platform! Simply enter your goal in the main 'Goal' field on this page, and watch the AIPO engine decompose it into actionable tasks.",
            options: ["Got it!", "Ask more questions"]
        }
    };

    let phase = 'greeting';

    fab.onclick = () => {
        win.classList.toggle('active');
        if (win.classList.contains('active') && msgs.children.length === 0) {
            setTimeout(() => addBot(botConvo.greeting), 600);
        }
    };

    const handleInp = () => {
        const val = inp.value.trim();
        if (!val) return;
        addUser(val);
        inp.value = '';
        setTimeout(() => {
            if (phase === 'greeting') { phase = 'automation'; addBot(botConvo.automation); }
            else if (phase === 'automation') { phase = 'demo'; addBot(botConvo.demo); }
            else { addBot({ text: "I'm here to help! Feel free to explore the AIPO platform features below." }); }
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
        const d = document.createElement('div');
        d.className = 'aipo-msg aipo-bot-msg'; d.innerHTML = obj.text;
        msgs.appendChild(d);

        reps.innerHTML = '';
        if (obj.options) {
            obj.options.forEach(opt => {
                const b = document.createElement('button');
                b.className = 'aipo-reply'; b.textContent = opt;
                b.onclick = () => { addUser(opt); inp.value = opt; handleInp(); };
                reps.appendChild(b);
            });
        }
        msgs.scrollTop = msgs.scrollHeight;
    }
})();
