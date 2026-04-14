const app = {
    alert: function(msg) {
        document.getElementById('custom-alert-msg').innerText = msg;
        document.getElementById('custom-alert').style.display = 'flex';
    },

    init: function() {
        console.log('UniBuddy App Initialized');
        const token = localStorage.getItem('token');
        if (!token) {
            document.querySelector('.nav-links').style.display = 'none';
            this.navigate('auth');
        } else {
            document.querySelector('.nav-links').style.display = 'flex';
            document.getElementById('nav-auth-btn').innerText = 'Logout';
            const userName = localStorage.getItem('name');
            if (userName) document.getElementById('nav-user-name').innerText = `Hello, ${userName}`;
            this.bindEvents();
            this.checkAdminStatus();
            this.loadActiveAnnouncement();
            
            // if we are on auth page initially but have token, go home
            const page = document.querySelector('.page-view[style*="display: block"]');
            if (!page || page.id === 'page-auth') this.navigate('home');
        }
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
        if (page === 'auth' && localStorage.getItem('token')) {
            // Logout logic
            localStorage.clear();
            document.getElementById('nav-user-name').innerText = '';
            document.getElementById('nav-auth-btn').innerText = 'Login';
            document.querySelector('.nav-links').style.display = 'none';
        }

        document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-links a[data-page="${page}"]`);
        if (activeLink) activeLink.classList.add('active');

        ['home', 'lost-found', 'facilities', 'auth', 'admin'].forEach(p => {
            const el = document.getElementById(`page-${p}`);
            if (el) el.style.display = 'none';
        });

        const activePage = document.getElementById(`page-${page}`);
        if (activePage) activePage.style.display = 'block';
        
        if (page === 'lost-found') this.loadLFItems();
        if (page === 'facilities') this.loadFacilities();
        if (page === 'admin') this.loadAdminAnnouncements();
    },

    switchAuthTab: function(tab) {
        const loginBtn = document.getElementById('tab-login');
        const regBtn = document.getElementById('tab-register');
        const loginCont = document.getElementById('auth-login-container');
        const regCont = document.getElementById('auth-register-container');

        if (tab === 'login') {
            loginBtn.style.background = 'var(--accent-primary)';
            loginBtn.style.color = '#fff';
            loginBtn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
            regBtn.style.background = 'transparent';
            regBtn.style.color = '#ccc';
            regBtn.style.boxShadow = 'none';
            loginCont.style.display = 'block';
            regCont.style.display = 'none';
        } else {
            regBtn.style.background = 'var(--accent-primary)';
            regBtn.style.color = '#fff';
            regBtn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
            loginBtn.style.background = 'transparent';
            loginBtn.style.color = '#ccc';
            loginBtn.style.boxShadow = 'none';
            loginCont.style.display = 'none';
            regCont.style.display = 'block';
        }
    },

    auth: function(endpoint) {
        let name, email, password;
        if (endpoint === 'register') {
            name = document.getElementById('reg-name').value;
            email = document.getElementById('reg-email').value;
            password = document.getElementById('reg-pass').value;
        } else {
            email = document.getElementById('login-email').value;
            password = document.getElementById('login-pass').value;
        }
        
        const body = endpoint === 'register' ? { name, email, password } : { email, password };
        
        fetch(`/api/auth/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(res => res.json()).then(data => {
            if (endpoint === 'register') {
                if (data.msg === 'Registration complete. Please log in.') {
                    app.alert(data.msg);
                    this.switchAuthTab('login');
                    document.getElementById('login-email').value = email;
                    document.getElementById('login-pass').value = '';
                } else {
                    app.alert(data.msg || 'Error registering');
                }
                return;
            }

            if (data.token) {
                localStorage.setItem('token', data.token);
                if (data.user) {
                    if (data.user.role) localStorage.setItem('role', data.user.role);
                    if (data.user.name) {
                        localStorage.setItem('name', data.user.name);
                        document.getElementById('nav-user-name').innerText = `Hello, ${data.user.name}`;
                    }
                }
                document.querySelector('.nav-links').style.display = 'flex';
                document.getElementById('nav-auth-btn').innerText = 'Logout';
                this.bindEvents();
                this.checkAdminStatus();
                this.loadActiveAnnouncement();
                this.navigate('home');
            } else {
                app.alert(data.msg || 'Error');
            }
        }).catch(err => console.error(err));
    },

    login: function() { this.auth('login'); },
    register: function() { this.auth('register'); },

    showReportForm: function(type) {
        this.currentLFType = type;
        
        // Toggle button active states visually
        const lostBtn = document.getElementById('btn-report-lost');
        const foundBtn = document.getElementById('btn-report-found');
        
        if (type === 'lost') {
            lostBtn.className = 'btn btn-primary';
            foundBtn.className = 'btn btn-secondary';
        } else {
            foundBtn.className = 'btn btn-primary';
            lostBtn.className = 'btn btn-secondary';
        }

        const color = 'var(--accent-primary)';
        document.getElementById('lf-form-title').innerText = `Report ${type === 'lost' ? 'Lost' : 'Found'} Item`;
        document.getElementById('lf-form-title').style.color = color;
        const container = document.getElementById('lf-form-container');
        container.style.display = 'block';
        container.style.border = `2px solid ${color}`;
        container.style.boxShadow = `0 0 15px ${color}33`;
    },

    submitLFItem: function() {
        const token = localStorage.getItem('token');
        if (!token) return app.alert('Please login first by clicking the Login button at the top!');
        
        const formData = new FormData();
        formData.append('title', document.getElementById('lf-title').value);
        formData.append('description', document.getElementById('lf-desc').value);
        formData.append('category', document.getElementById('lf-cat').value);
        formData.append('type', this.currentLFType);
        
        const imageFile = document.getElementById('lf-image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        fetch('/api/items', {
            method: 'POST',
            headers: { 'x-auth-token': token }, // Content-Type is auto-set for FormData
            body: formData
        }).then(res => res.json()).then(data => {
            app.alert('Item Reported!');
            document.getElementById('lf-form-container').style.display = 'none';
            // Clear inputs
            document.getElementById('lf-title').value = '';
            document.getElementById('lf-desc').value = '';
            document.getElementById('lf-image').value = '';
            this.loadLFItems();
        });
    },

    loadLFItems: function() {
        const isAdmin = localStorage.getItem('role') === 'admin';
        fetch('/api/items')
        .then(res => res.json())
        .then(items => {
            const list = document.getElementById('lf-items-list');
            if (items.length === 0) list.innerHTML = '<p>No items found.</p>';
            else list.innerHTML = items.map(i => `
                <div style="background:var(--glass-bg); padding:15px; border-radius:12px; border: 1px solid var(--glass-border);">
                    <span style="background:${i.type==='lost'?'var(--danger)':'var(--success)'}; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:bold; letter-spacing: 0.5px;">${i.type.toUpperCase()}</span>
                    <h4 style="margin-top:15px; font-size:1.4rem;">${i.title}</h4>
                    <span style="font-size:12px; background: rgba(0,0,0,0.1); padding: 3px 6px; border-radius:4px; margin-top:5px; display:inline-block;">${i.category}</span>
                    <p style="font-size:14px; color:var(--text-secondary); margin-top:10px;">${i.description}</p>
                    ${i.image_url ? `<img src="${i.image_url}" style="max-width:100%; border-radius:8px; margin-top:10px;">` : ''}
                    <div style="margin-top:15px; font-size:12px; color:#666; border-top:1px solid #ddd; padding-top:10px;">
                        Status: <b>${i.status}</b> &bull; By: ${i.reported_by_name}
                    </div>
                    ${isAdmin ? `
                    <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #ccc; display:flex; gap:10px;">
                        <select onchange="app.updateItemStatus(${i.id}, 'items', this.value)" style="padding:5px; border-radius:4px;">
                            <option value="open" ${i.status==='open'?'selected':''}>Open</option>
                            <option value="resolved" ${i.status==='resolved'?'selected':''}>Resolved</option>
                        </select>
                        <button onclick="app.deleteItem(${i.id}, 'items')" style="background:var(--danger); color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button>
                    </div>
                    ` : ''}
                </div>
            `).join('');
        }).catch(err => console.error(err));
    },

    submitFacilityIssue: function() {
        const token = localStorage.getItem('token');
        if (!token) return app.alert('Please login first by clicking the Login button at the top!');
        
        fetch('/api/facility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({
                title: document.getElementById('fac-title').value,
                room: document.getElementById('fac-room').value,
                description: document.getElementById('fac-desc').value
            })
        }).then(res => res.json()).then(data => {
            app.alert('Facility issue reported successfully!');
            document.getElementById('fac-form-container').style.display = 'none';
            // Clear inputs
            document.getElementById('fac-title').value = '';
            document.getElementById('fac-room').value = '';
            document.getElementById('fac-desc').value = '';
            this.loadFacilities();
        });
    },

    loadFacilities: function() {
        const token = localStorage.getItem('token');
        if (!token) return;
        const isAdmin = localStorage.getItem('role') === 'admin';
        fetch('/api/facility', {
            headers: { 'x-auth-token': token }
        })
        .then(res => res.json())
        .then(issues => {
            const list = document.getElementById('fac-items-list');
            if (!Array.isArray(issues) || issues.length === 0) list.innerHTML = '<p>No issues reported.</p>';
            else list.innerHTML = issues.map(i => `
                <div style="background:var(--glass-bg); padding:15px; border-radius:12px; border: 1px solid var(--glass-border);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span style="background:${i.status==='pending'?'var(--warning)':(i.status==='resolved'?'var(--success)':'var(--accent-primary)')}; padding:4px 10px; border-radius:20px; font-size:12px; color:#000; font-weight:bold; letter-spacing: 0.5px;">${i.status.toUpperCase()}</span>
                        <button onclick="app.upvoteIssue(${i.id})" style="background:${i.has_upvoted ? 'var(--accent-primary)' : 'transparent'}; color:${i.has_upvoted ? '#fff' : 'var(--text-primary)'}; border: 1px solid ${i.has_upvoted ? 'var(--accent-primary)' : 'var(--glass-border)'}; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600; display:flex; gap:5px; align-items:center; transition: all 0.2s;">
                            Upvote (${i.upvotes})
                        </button>
                    </div>
                    <h4 style="margin-top:15px; font-size:1.4rem;">${i.title}</h4>
                    <span style="font-size:12px; background: rgba(0,0,0,0.1); padding: 3px 6px; border-radius:4px; margin-top:5px; display:inline-block;">Room ${i.room}</span>
                    <p style="font-size:14px; color:var(--text-secondary); margin-top:10px;">${i.description}</p>
                    <div style="margin-top:15px; font-size:12px; color:#666; border-top:1px solid #ddd; padding-top:10px;">
                        Reported By: ${i.reported_by_name}
                    </div>
                    ${isAdmin ? `
                    <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #ccc; display:flex; gap:10px;">
                        <select onchange="app.updateItemStatus(${i.id}, 'facility', this.value)" class="form-input" style="padding:5px; border-radius:4px; margin:0;">
                            <option value="pending" ${i.status==='pending'?'selected':''}>Pending</option>
                            <option value="in_progress" ${i.status==='in_progress'?'selected':''}>In Progress</option>
                            <option value="resolved" ${i.status==='resolved'?'selected':''}>Resolved</option>
                        </select>
                        <button onclick="app.deleteItem(${i.id}, 'facility')" style="background:var(--danger); color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button>
                    </div>
                    ` : ''}
                </div>
            `).join('');
        }).catch(err => console.error(err));
    },

    upvoteIssue: function(id) {
        const token = localStorage.getItem('token');
        if (!token) return app.alert('Please login first!');
        
        // Optimistically reload UI quickly
        fetch(`/api/facility/${id}/upvote`, {
            method: 'POST',
            headers: { 'x-auth-token': token }
        }).then(res => res.json()).then(data => {
            this.loadFacilities();
        }).catch(err => console.error(err));
    },

    updateItemStatus: function(id, type, status) {
        const token = localStorage.getItem('token');
        if (!token) return app.alert('Not logged in!');
        fetch(`/api/${type}/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ status })
        }).then(res => res.json()).then(data => {
            if (type === 'items') this.loadLFItems();
            if (type === 'facility') this.loadFacilities();
        });
    },

    deleteItem: function(id, type) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        const token = localStorage.getItem('token');
        fetch(`/api/${type}/${id}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        }).then(res => res.json()).then(data => {
            if (type === 'items') this.loadLFItems();
            if (type === 'facility') this.loadFacilities();
        });
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
    },

    checkAdminStatus: function() {
        const role = localStorage.getItem('role');
        const adminLink = document.getElementById('nav-admin-link');
        if (role === 'admin') {
            adminLink.style.display = 'inline-block';
        } else {
            adminLink.style.display = 'none';
        }
    },

    loadActiveAnnouncement: function() {
        fetch('/api/announcements/active')
        .then(res => res.json())
        .then(data => {
            const banner = document.getElementById('global-announcement');
            const textEl = document.getElementById('global-announcement-text');
            if (data && data.message) {
                textEl.innerText = data.message;
                banner.style.display = 'block';
            } else {
                banner.style.display = 'none';
            }
        }).catch(err => console.error('Error fetching announcement:', err));
    },

    submitAnnouncement: function() {
        const token = localStorage.getItem('token');
        if (!token) return app.alert('Please login as admin first!');
        
        const message = document.getElementById('admin-announcement-text').value.trim();
        const isActive = document.getElementById('admin-announcement-active').checked;
        if (!message) return app.alert('Please enter a message!');
        
        fetch('/api/admin/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ message, is_active: isActive })
        }).then(res => {
            if (!res.ok) throw new Error('Unassigned or unauthorized');
            return res.json();
        }).then(data => {
            app.alert('Announcement posted successfully!');
            document.getElementById('admin-announcement-text').value = '';
            this.loadAdminAnnouncements();
            this.loadActiveAnnouncement(); // Refresh banner immediately
        }).catch(err => {
            console.error(err);
            app.alert('Error posting announcement. Ensure you have admin rights.');
        });
    },

    loadAdminAnnouncements: function() {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        fetch('/api/admin/announcements', {
            headers: { 'x-auth-token': token }
        })
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('admin-announcement-list');
            if (!Array.isArray(data) || data.length === 0) {
                list.innerHTML = '<p>No announcements found.</p>';
                return;
            }
            list.innerHTML = data.map(a => `
                <div style="background:var(--glass-bg); padding:15px; border-radius:8px; border: 1px solid ${a.is_active ? 'var(--warning)' : 'var(--glass-border)'};">
                    ${a.is_active ? '<span style="background:var(--warning); color:#000; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold; float:right;">ACTIVE</span>' : ''}
                    <p style="font-size:1rem; color:var(--text-primary); margin-bottom:10px;">${a.message}</p>
                    <div style="font-size:12px; color:var(--text-secondary);">
                        Posted by: ${a.created_by_name || 'Admin'} &bull; ${new Date(a.created_at).toLocaleString()}
                    </div>
                </div>
            `).join('');
        }).catch(err => console.error(err));
    },

    uploadNotice: function() {
        const token = localStorage.getItem('token');
        if (!token) return app.alert('Please login as admin first!');
        
        const fileInput = document.getElementById('admin-notice-pdf');
        if (!fileInput.files[0]) return app.alert('Please select a PDF file');

        const formData = new FormData();
        formData.append('noticePdf', fileInput.files[0]);

        fetch('/api/admin/upload-notice', {
            method: 'POST',
            headers: { 'x-auth-token': token },
            body: formData
        }).then(res => res.json()).then(data => {
            app.alert(data.msg || 'Success');
            fileInput.value = '';
        }).catch(err => {
            console.error(err);
            app.alert('Error uploading notice.');
        });
    },

    addRoomInfo: function() {
        const token = localStorage.getItem('token');
        if (!token) return app.alert('Please login as admin first!');

        const type = document.getElementById('admin-room-type').value;
        const keyword = document.getElementById('admin-room-keyword').value;
        const details = document.getElementById('admin-room-details').value;

        if (!keyword || !details) return app.alert('Please fill in keyword and details');

        fetch('/api/admin/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ type, keyword, details })
        }).then(res => res.json()).then(data => {
            app.alert(data.msg || 'Success');
            document.getElementById('admin-room-keyword').value = '';
            document.getElementById('admin-room-details').value = '';
        }).catch(err => {
            console.error(err);
            app.alert('Error adding room info.');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
