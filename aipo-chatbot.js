/* 
  AIPO CHATBOT INJECTION SCRIPT - TRIXIE (TALKATIVE & SWEET)
  Goal: Get to know the user while being lovely and expressive.
  Updated: 2026-01-22
*/

(function () {
    // 1. STYLES
    const css = `
        :root {
            --trixie-pink: #f472b6;
            --trixie-purple: #a78bfa;
            --trixie-glass: rgba(255, 255, 255, 0.9);
            --trixie-shadow: 0 15px 35px rgba(244, 114, 182, 0.2);
        }

        .aipo-chatbot-ui * { box-sizing: border-box; font-family: 'Outfit', 'Inter', sans-serif !important; }

        .aipo-fab {
            position: fixed; bottom: 2rem; right: 2rem;
            width: 68px; height: 68px;
            background: linear-gradient(135deg, var(--trixie-pink), var(--trixie-purple));
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            color: white; cursor: pointer; box-shadow: var(--trixie-shadow);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 10000; border: none;
        }
        .aipo-fab:hover { transform: scale(1.1) rotate(15deg); }

        .aipo-chat-window {
            position: fixed; bottom: 7.5rem; right: 2rem;
            width: 400px; height: 600px; max-height: calc(100vh - 10rem);
            background: var(--trixie-glass); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 2px solid white; border-radius: 32px;
            box-shadow: var(--trixie-shadow); display: flex; flex-direction: column;
            overflow: hidden; opacity: 0; pointer-events: none;
            transform: translateY(40px) scale(0.9); transition: all 0.4s ease; z-index: 9999;
        }
        .aipo-chat-window.active { opacity: 1; pointer-events: all; transform: translateY(0) scale(1); }

        .aipo-header {
            padding: 1.5rem; background: linear-gradient(135deg, rgba(244, 114, 182, 0.15), rgba(167, 139, 250, 0.15));
            border-bottom: 1px solid rgba(244, 114, 182, 0.1); display: flex; align-items: center; gap: 1rem;
        }
        .aipo-bot-icon { 
            width: 52px; height: 52px; 
            background: linear-gradient(135deg, var(--trixie-pink), var(--trixie-purple)); 
            border-radius: 50%; display: flex; align-items: center; justify-content: center; 
            color: white; border: 3px solid white; box-shadow: 0 4px 12px rgba(244, 114, 182, 0.2);
        }

        .aipo-msg-container { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem; }
        .aipo-msg { max-width: 85%; padding: 1rem 1.2rem; border-radius: 24px; font-size: 0.95rem; line-height: 1.6; animation: aipoIn 0.5s ease-out forwards; position: relative; }
        .aipo-bot-msg { background: white; color: #1e293b; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
        .aipo-user-msg { background: var(--trixie-pink); color: white; align-self: flex-end; border-bottom-right-radius: 4px; box-shadow: 0 4px 15px rgba(244, 114, 182, 0.2); }

        .aipo-input-wrap { padding: 1.5rem; background: white; display: flex; gap: 0.8rem; border-top: 1px solid rgba(0,0,0,0.05); }
        .aipo-input { flex: 1; border: 2px solid #f1f5f9; border-radius: 18px; padding: 0.8rem 1.2rem; outline: none; transition: 0.3s; background: #f8fafc; font-size: 0.95rem; }
        .aipo-input:focus { border-color: var(--trixie-pink); background: white; box-shadow: 0 0 0 4px rgba(244, 114, 182, 0.1); }
        .aipo-send-btn { background: var(--trixie-pink); color: white; border: none; width: 48px; height: 48px; border-radius: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .aipo-send-btn:hover { background: var(--trixie-purple); transform: scale(1.05); }

        .aipo-quick-replies { display: flex; flex-wrap: wrap; gap: 0.8rem; padding: 0 1.5rem 1.5rem; }
        .aipo-reply { background: white; border: 2px solid rgba(244, 114, 182, 0.2); color: var(--trixie-pink); padding: 0.6rem 1.2rem; border-radius: 22px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: 0.3s; }
        .aipo-reply:hover { background: var(--trixie-pink); color: white; border-color: var(--trixie-pink); transform: translateY(-2px); }

        @keyframes aipoIn { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
    `;

    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    // 2. HTML
    const container = document.createElement('div');
    container.className = 'aipo-chatbot-ui';
    container.innerHTML = `
        <button id="aipoFab" class="aipo-fab" title="Chat with Trixie">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
        <div id="aipoWindow" class="aipo-chat-window">
            <div class="aipo-header">
                <div class="aipo-bot-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M9 15c1 1.5 3 2 5 0"></path></svg>
                </div>
                <div style="line-height:1.2">
                    <div style="font-weight:800; color:#1e293b; font-size:1.2rem; letter-spacing:-0.5px">Trixie ✨</div>
                    <div style="font-size:0.8rem; color:#f472b6; font-weight:600">Your Sweetest Friend</div>
                </div>
            </div>
            <div id="aipoMsgs" class="aipo-msg-container"></div>
            <div id="aipoReplies" class="aipo-quick-replies"></div>
            <div class="aipo-input-wrap">
                <input type="text" id="aipoInp" class="aipo-input" placeholder="Tell Trixie something...">
                <button id="aipoSubmit" class="aipo-send-btn">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // 3. LOGIC & PERSONALITY
    const fab = document.getElementById('aipoFab');
    const win = document.getElementById('aipoWindow');
    const msgs = document.getElementById('aipoMsgs');
    const inp = document.getElementById('aipoInp');
    const sub = document.getElementById('aipoSubmit');
    const reps = document.getElementById('aipoReplies');

    let userData = {
        name: '',
        goal: '',
        vibe: ''
    };

    let phase = 'greeting'; // greeting -> name -> interests -> goal -> final

    const botDialogue = {
        greeting: {
            text: "Hiiiii! ✨ Oh my goodness, I'm so happy you're here! I was just sitting here thinking about who might visit today... and it's you! I'm Trixie, and I'm honestly so excited to meet you! Can we be friends? 🌸",
            options: ["Hii Trixie!", "Of course!", "You're talkative!"]
        },
        getName: {
            text: "Yayyy! Besties already! 💖 I'm so curious though... what should I call you? Do you have a lovely name I can remember? I'd love to know! ✨",
            options: ["I'll type it!"]
        },
        getInterests: {
            text: "Oh, {name}! That's such a beautiful name, I love it! ✨ So tell me, {name}, what brings a cool person like you to our little AIPO corner? Are you building something big or just exploring? I want to know EVERYTHING! 🎀",
            options: ["Building an App", "Just looking around", "Startup idea!"]
        },
        getGoal: {
            text: "That is SO interesting! {name}, you sound like someone with really big dreams! ✨ I'm curious... if you could finish one major thing today, what would it be? I bet it's something amazing! 🌸",
            options: ["Finishing my design", "Planning a project", "Coding something cool"]
        },
        pitch: {
            text: "I KNEW IT! You're definitely a dreamer and a doer! 💖 Well, {name}, since you're so productive, you should totally check out the AIPO system right here. It's like having a super smart Product Owner friend to help you break down all those big goals! Want to see how it helps? ✨",
            options: ["Show me!", "Yes please, Trixie!"]
        },
        talkative_remark: {
            text: "Hehe, am I? I just have a lot of energy when I meet new people! 🌸 Meeting someone new is like opening a treasure chest! So... what's your name, treasure? ✨",
            options: ["It's... (type below)"]
        }
    };

    let autoGreetCount = 0;
    function isGreetingTime() {
        const now = new Date();
        const hour = now.getHours();
        return hour >= 9 && hour < 15;
    }

    function checkAutoGreet() {
        if (!isGreetingTime() || autoGreetCount >= 2) return;
        setTimeout(() => {
            if (!win.classList.contains('active')) {
                autoGreetCount++;
                win.classList.add('active');
                addBot(botDialogue.greeting);
            }
        }, 8000 * autoGreetCount + 5000);
    }

    fab.onclick = () => {
        win.classList.toggle('active');
        if (win.classList.contains('active') && msgs.children.length === 0) {
            setTimeout(() => addBot(botDialogue.greeting), 600);
        }
    };

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
                addBot({ text: `You're amazing, ${userData.name}! ✨ I'm so glad we talked. Use the 'Goal' box on this page to see the AIPO magic in action! 🌸`, options: ["Thanks, Trixie!"] });
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
        typing.innerHTML = '<span style="opacity:0.5">Trixie is typing...</span>';
        msgs.appendChild(typing);
        msgs.scrollTop = msgs.scrollHeight;

        setTimeout(() => {
            msgs.removeChild(typing);
            const d = document.createElement('div');
            d.className = 'aipo-msg aipo-bot-msg';
            d.innerHTML = obj.text;
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
        }, 1000);
    }

    checkAutoGreet();
})();
