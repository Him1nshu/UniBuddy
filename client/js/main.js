const app = {
    init: function() {
        console.log('UniBuddy App Initialized');
        this.bindEvents();
    },

    bindEvents: function() {
        // Navigation links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                if (page) this.navigate(page);
            });
        });

        // Chat input enter key
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    },

    currentLFType: 'lost',

    navigate: function(page) {
        document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-links a[data-page="${page}"]`);
        if (activeLink) activeLink.classList.add('active');

        ['home', 'lost-found', 'facilities', 'auth'].forEach(p => {
            const el = document.getElementById(`page-${p}`);
            if (el) el.style.display = 'none';
        });

        const activePage = document.getElementById(`page-${page}`);
        if (activePage) activePage.style.display = 'block';
        
        if (page === 'lost-found') this.loadLFItems();
        if (page === 'facilities') this.loadFacilities();
    },

    auth: function(endpoint) {
        const name = document.getElementById('auth-name').value;
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-pass').value;
        
        const body = endpoint === 'register' ? { name, email, password } : { email, password };
        
        fetch(`/api/auth/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(res => res.json()).then(data => {
            if (data.token) {
                localStorage.setItem('token', data.token);
                document.getElementById('nav-auth-btn').innerText = 'Logout';
                alert('Success!');
                this.navigate('home');
            } else {
                alert(data.msg || 'Error');
            }
        });
    },

    login: function() { this.auth('login'); },
    register: function() { this.auth('register'); },

    showReportForm: function(type) {
        this.currentLFType = type;
        document.getElementById('lf-form-title').innerText = `Report ${type === 'lost' ? 'Lost' : 'Found'} Item`;
        document.getElementById('lf-form-container').style.display = 'block';
    },

    submitLFItem: function() {
        const token = localStorage.getItem('token');
        if (!token) return alert('Please login first by clicking the Login button at the top!');
        
        fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({
                title: document.getElementById('lf-title').value,
                description: document.getElementById('lf-desc').value,
                category: document.getElementById('lf-cat').value,
                type: this.currentLFType
            })
        }).then(res => res.json()).then(data => {
            alert('Item Reported!');
            document.getElementById('lf-form-container').style.display = 'none';
            this.loadLFItems();
        });
    },

    loadLFItems: function() {
        fetch('/api/items')
        .then(res => res.json())
        .then(items => {
            const list = document.getElementById('lf-items-list');
            if (items.length === 0) list.innerHTML = '<p>No items found.</p>';
            else list.innerHTML = items.map(i => `
                <div style="background:var(--glass-bg); padding:15px; border-radius:12px; border: 1px solid var(--glass-border);">
                    <span style="background:${i.type==='lost'?'var(--danger)':'var(--success)'}; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:bold; letter-spacing: 0.5px;">${i.type.toUpperCase()}</span>
                    <h4 style="margin-top:15px; font-size:1.4rem;">${i.title}</h4>
                    <span style="font-size:12px; background: rgba(255,255,255,0.1); padding: 3px 6px; border-radius:4px; margin-top:5px; display:inline-block;">${i.category}</span>
                    <p style="font-size:14px; color:var(--text-secondary); margin-top:10px;">${i.description}</p>
                    <div style="margin-top:15px; font-size:12px; color:#aaa; border-top:1px solid rgba(255,255,255,0.05); padding-top:10px;">
                        Status: <b>${i.status}</b> &bull; By: ${i.reported_by_name}
                    </div>
                </div>
            `).join('');
        }).catch(err => console.error(err));
    },

    submitFacilityIssue: function() {
        const token = localStorage.getItem('token');
        if (!token) return alert('Please login first by clicking the Login button at the top!');
        
        fetch('/api/facility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({
                title: document.getElementById('fac-title').value,
                room: document.getElementById('fac-room').value,
                description: document.getElementById('fac-desc').value
            })
        }).then(res => res.json()).then(data => {
            alert('Facility issue reported successfully!');
            document.getElementById('fac-form-container').style.display = 'none';
            this.loadFacilities();
        });
    },

    loadFacilities: function() {
        fetch('/api/facility')
        .then(res => res.json())
        .then(issues => {
            const list = document.getElementById('fac-items-list');
            if (issues.length === 0) list.innerHTML = '<p>No issues reported.</p>';
            else list.innerHTML = issues.map(i => `
                <div style="background:var(--glass-bg); padding:15px; border-radius:12px; border: 1px solid var(--glass-border);">
                    <span style="background:${i.status==='pending'?'var(--warning)':(i.status==='resolved'?'var(--success)':'var(--accent-primary)')}; padding:4px 10px; border-radius:20px; font-size:12px; color:#000; font-weight:bold; letter-spacing: 0.5px;">${i.status.toUpperCase()}</span>
                    <h4 style="margin-top:15px; font-size:1.4rem;">${i.title}</h4>
                    <span style="font-size:12px; background: rgba(255,255,255,0.1); padding: 3px 6px; border-radius:4px; margin-top:5px; display:inline-block;">Room ${i.room}</span>
                    <p style="font-size:14px; color:var(--text-secondary); margin-top:10px;">${i.description}</p>
                    <div style="margin-top:15px; font-size:12px; color:#aaa; border-top:1px solid rgba(255,255,255,0.05); padding-top:10px;">
                        Reported By: ${i.reported_by_name}
                    </div>
                </div>
            `).join('');
        }).catch(err => console.error(err));
    },

    toggleChat: function() {
        const widget = document.getElementById('chatbot-widget');
        if (widget.classList.contains('collapsed')) {
            widget.classList.remove('collapsed');
        } else {
            widget.classList.add('collapsed');
        }
    },

    sendMessage: function() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;

        const chatBody = document.getElementById('chat-body');
        
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message user';
        userMsg.innerText = text;
        chatBody.appendChild(userMsg);
        
        input.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        // Fetch from backend chatbot API
        fetch('/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        })
        .then(res => res.json())
        .then(data => {
            const botMsg = document.createElement('div');
            botMsg.className = 'chat-message bot';
            botMsg.innerText = data.reply;
            chatBody.appendChild(botMsg);
            chatBody.scrollTop = chatBody.scrollHeight;
        })
        .catch(err => {
            console.error('Chatbot error:', err);
            const botMsg = document.createElement('div');
            botMsg.className = 'chat-message bot';
            botMsg.innerText = "Sorry, I'm having trouble connecting to my brain.";
            chatBody.appendChild(botMsg);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
