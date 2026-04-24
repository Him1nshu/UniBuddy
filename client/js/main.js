const app = {

    // ── Utilities ────────────────────────────────────────────────────────

    alert: function(msg) {
        document.getElementById('custom-alert-msg').innerText = msg;
        document.getElementById('custom-alert').style.display = 'flex';
    },

    // ── Init ─────────────────────────────────────────────────────────────

    init: function() {
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
            this.navigate('home');
        }
    },

    bindEvents: function() {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                if (page) this.navigate(page);
            });
        });

        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    },

    // ── Navigation ───────────────────────────────────────────────────────

    currentLFType: 'lost',

    navigate: function(page) {
        // Treat clicking auth when logged-in as logout
        if (page === 'auth' && localStorage.getItem('token')) {
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

        if (page === 'lost-found')  this.loadLFItems();
        if (page === 'facilities')  this.loadFacilities();
        if (page === 'admin') {
            this.loadAdminAnnouncements();
            this.loadRoomInfo();
        }
    },

    // ── Auth ─────────────────────────────────────────────────────────────

    switchAuthTab: function(tab) {
        const loginBtn  = document.getElementById('tab-login');
        const regBtn    = document.getElementById('tab-register');
        const loginCont = document.getElementById('auth-login-container');
        const regCont   = document.getElementById('auth-register-container');

        if (tab === 'login') {
            loginBtn.classList.add('active');
            regBtn.classList.remove('active');
            loginCont.style.display = 'block';
            regCont.style.display   = 'none';
        } else {
            regBtn.classList.add('active');
            loginBtn.classList.remove('active');
            loginCont.style.display = 'none';
            regCont.style.display   = 'block';
        }
    },

    auth: function(endpoint) {
        let name, email, password;
        if (endpoint === 'register') {
            name     = document.getElementById('reg-name').value.trim();
            email    = document.getElementById('reg-email').value.trim();
            password = document.getElementById('reg-pass').value;
        } else {
            email    = document.getElementById('login-email').value.trim();
            password = document.getElementById('login-pass').value;
        }

        const body = endpoint === 'register' ? { name, email, password } : { email, password };

        fetch(`/api/auth/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        .then(res => res.json())
        .then(data => {
            if (endpoint === 'register') {
                if (data.msg === 'Registration complete. Please log in.') {
                    app.alert('Registration successful! Please log in.');
                    this.switchAuthTab('login');
                    document.getElementById('login-email').value = email;
                } else {
                    app.alert(data.msg || 'Registration failed. Please try again.');
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
                app.alert(data.msg || 'Login failed. Please check your credentials.');
            }
        })
        .catch(() => app.alert('Unable to connect. Please ensure the server is running.'));
    },

    login:    function() { this.auth('login'); },
    register: function() { this.auth('register'); },

    // ── Admin Status ─────────────────────────────────────────────────────

    checkAdminStatus: function() {
        const isAdmin = localStorage.getItem('role') === 'admin';
        document.getElementById('nav-admin-item').style.display = isAdmin ? 'list-item' : 'none';
    },

    // ── Announcements ─────────────────────────────────────────────────────

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
        })
        .catch(() => {});
    },

    // ── Lost & Found ──────────────────────────────────────────────────────

    showReportForm: function(type) {
        this.currentLFType = type;

        const lostBtn  = document.getElementById('btn-report-lost');
        const foundBtn = document.getElementById('btn-report-found');

        if (type === 'lost') {
            lostBtn.className  = 'btn btn-primary';
            foundBtn.className = 'btn btn-secondary';
        } else {
            foundBtn.className = 'btn btn-primary';
            lostBtn.className  = 'btn btn-secondary';
        }

        document.getElementById('lf-form-title').innerText = `Report ${type === 'lost' ? 'Lost' : 'Found'} Item`;
        document.getElementById('lf-form-container').style.display = 'block';
    },

    submitLFItem: function() {
        const token = localStorage.getItem('token');
        if (!token) return app.alert('Please log in first.');

        const title = document.getElementById('lf-title').value.trim();
        const desc  = document.getElementById('lf-desc').value.trim();
        if (!title || !desc) return app.alert('Please fill in the title and description.');

        const formData = new FormData();
        formData.append('title',       title);
        formData.append('description', desc);
        formData.append('category',    document.getElementById('lf-cat').value);
        formData.append('type',        this.currentLFType);

        const imageFile = document.getElementById('lf-image').files[0];
        if (imageFile) formData.append('image', imageFile);

        fetch('/api/items', {
            method: 'POST',
            headers: { 'x-auth-token': token },
            body: formData
        })
        .then(res => res.json())
        .then(() => {
            app.alert('Item reported successfully!');
            document.getElementById('lf-form-container').style.display = 'none';
            document.getElementById('lf-title').value  = '';
            document.getElementById('lf-desc').value   = '';
            document.getElementById('lf-image').value  = '';
            this.loadLFItems();
        })
        .catch(() => app.alert('Error submitting report. Please try again.'));
    },

    loadLFItems: function() {
        const list    = document.getElementById('lf-items-list');
        const isAdmin = localStorage.getItem('role') === 'admin';

        list.innerHTML = '<div class="loading-state">Loading items…</div>';

        fetch('/api/items')
        .then(res => res.json())
        .then(items => {
            if (!Array.isArray(items) || items.length === 0) {
                list.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <p>No items have been reported yet.</p>
                    </div>`;
                return;
            }

            list.innerHTML = items.map(i => `
                <div class="card">
                    <div class="card-body">
                        <div class="card-top">
                            <span class="badge badge-${i.type}">${i.type.toUpperCase()}</span>
                            <span class="badge badge-${i.status}">${i.status.toUpperCase()}</span>
                        </div>
                        <div class="card-tags">
                            <span class="tag">${this._capitalize(i.category)}</span>
                        </div>
                        <h4 class="item-title">${this._esc(i.title)}</h4>
                        <p class="item-desc">${this._esc(i.description)}</p>
                        ${i.image_url ? `<img src="${i.image_url}" class="item-img" alt="Item photo">` : ''}
                        ${isAdmin ? `
                        <div class="admin-controls">
                            <select onchange="app.updateItemStatus(${i.id}, 'items', this.value)">
                                <option value="open"     ${i.status === 'open'     ? 'selected' : ''}>Open</option>
                                <option value="resolved" ${i.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                            </select>
                            <button class="btn btn-danger btn-sm" onclick="app.deleteItem(${i.id}, 'items')">Delete</button>
                        </div>` : ''}
                    </div>
                    <div class="card-footer">
                        <span>Reported by <strong>${this._esc(i.reported_by_name)}</strong></span>
                    </div>
                </div>
            `).join('');
        })
        .catch(() => {
            list.innerHTML = '<div class="empty-state"><p>Failed to load items. Please try again.</p></div>';
        });
    },

    // ── Facilities ────────────────────────────────────────────────────────

    toggleFacilityForm: function() {
        const form = document.getElementById('fac-form-container');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    },

    submitFacilityIssue: function() {
        const token = localStorage.getItem('token');
        if (!token) return app.alert('Please log in first.');

        const title    = document.getElementById('fac-title').value.trim();
        const room     = document.getElementById('fac-room').value.trim();
        const desc     = document.getElementById('fac-desc').value.trim();
        const category = document.getElementById('fac-category').value;
        const severity = document.getElementById('fac-severity').value;

        if (!title || !room || !desc) return app.alert('Please fill in all required fields.');

        fetch('/api/facility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ title, room, description: desc, category, severity })
        })
        .then(res => res.json())
        .then(() => {
            app.alert('Facility issue reported successfully!');
            document.getElementById('fac-form-container').style.display = 'none';
            document.getElementById('fac-title').value = '';
            document.getElementById('fac-room').value  = '';
            document.getElementById('fac-desc').value  = '';
            this.loadFacilities();
        })
        .catch(() => app.alert('Error submitting report. Please try again.'));
    },

    loadFacilities: function() {
        const token   = localStorage.getItem('token');
        if (!token) return;
        const list    = document.getElementById('fac-items-list');
        const isAdmin = localStorage.getItem('role') === 'admin';

        list.innerHTML = '<div class="loading-state">Loading issues…</div>';

        fetch('/api/facility', { headers: { 'x-auth-token': token } })
        .then(res => res.json())
        .then(issues => {
            if (!Array.isArray(issues) || issues.length === 0) {
                list.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🔧</div>
                        <p>No facility issues reported yet.</p>
                    </div>`;
                return;
            }

            list.innerHTML = issues.map(i => {
                const severity = i.severity || 'low';
                const category = i.category || '';
                return `
                <div class="card">
                    <div class="card-body">
                        <div class="card-top">
                            <span class="badge badge-${i.status}">${this._statusLabel(i.status)}</span>
                            <button class="upvote-btn ${i.has_upvoted ? 'voted' : ''}"
                                    onclick="app.upvoteIssue(${i.id})">
                                ▲ ${i.upvotes} Upvote${i.upvotes !== 1 ? 's' : ''}
                            </button>
                        </div>
                        <div class="card-tags">
                            ${severity ? `<span class="badge badge-${severity}">${this._capitalize(severity)}</span>` : ''}
                            ${category ? `<span class="tag">${this._capitalize(category)}</span>` : ''}
                            <span class="tag">Room ${this._esc(i.room)}</span>
                        </div>
                        <h4 class="item-title">${this._esc(i.title)}</h4>
                        <p class="item-desc">${this._esc(i.description)}</p>
                        ${isAdmin ? `
                        <div class="admin-controls">
                            <select onchange="app.updateItemStatus(${i.id}, 'facility', this.value)">
                                <option value="pending"     ${i.status === 'pending'     ? 'selected' : ''}>Pending</option>
                                <option value="in_progress" ${i.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                <option value="resolved"    ${i.status === 'resolved'    ? 'selected' : ''}>Resolved</option>
                            </select>
                            <button class="btn btn-danger btn-sm" onclick="app.deleteItem(${i.id}, 'facility')">Delete</button>
                        </div>` : ''}
                    </div>
                    <div class="card-footer">
                        <span>Reported by <strong>${this._esc(i.reported_by_name)}</strong></span>
                    </div>
                </div>`;
            }).join('');
        })
        .catch(() => {
            list.innerHTML = '<div class="empty-state"><p>Failed to load issues. Please try again.</p></div>';
        });
    },

    upvoteIssue: function(id) {
        const token = localStorage.getItem('token');
        if (!token) return app.alert('Please log in first!');
        fetch(`/api/facility/${id}/upvote`, {
            method: 'POST',
            headers: { 'x-auth-token': token }
        })
        .then(res => res.json())
        .then(() => this.loadFacilities())
        .catch(() => {});
    },

    // ── Shared Item Actions ───────────────────────────────────────────────

    updateItemStatus: function(id, type, status) {
        const token = localStorage.getItem('token');
        if (!token) return;
        fetch(`/api/${type}/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ status })
        })
        .then(res => res.json())
        .then(() => {
            if (type === 'items')    this.loadLFItems();
            if (type === 'facility') this.loadFacilities();
        })
        .catch(() => app.alert('Failed to update status.'));
    },

    deleteItem: function(id, type) {
        app._confirm('Are you sure you want to delete this item?', () => {
            const token = localStorage.getItem('token');
            fetch(`/api/${type}/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            })
            .then(res => res.json())
            .then(() => {
                if (type === 'items')    this.loadLFItems();
                if (type === 'facility') this.loadFacilities();
            })
            .catch(() => app.alert('Failed to delete item.'));
        });
    },

    // ── Admin Actions ─────────────────────────────────────────────────────

    submitAnnouncement: function() {
        const token = localStorage.getItem('token');
        if (!token) return app.alert('Please log in as admin first.');

        const message  = document.getElementById('admin-announcement-text').value.trim();
        const isActive = document.getElementById('admin-announcement-active').checked;
        if (!message) return app.alert('Please enter an announcement message.');

        fetch('/api/admin/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ message, is_active: isActive })
        })
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(() => {
            app.alert('Announcement posted!');
            document.getElementById('admin-announcement-text').value = '';
            this.loadAdminAnnouncements();
            this.loadActiveAnnouncement();
        })
        .catch(() => app.alert('Error posting announcement. Ensure you have admin rights.'));
    },

    loadAdminAnnouncements: function() {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch('/api/admin/announcements', { headers: { 'x-auth-token': token } })
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('admin-announcement-list');
            if (!Array.isArray(data) || data.length === 0) {
                list.innerHTML = '<p style="color:var(--text-secondary); font-size:0.875rem;">No announcements yet.</p>';
                return;
            }
            list.innerHTML = data.map(a => `
                <div class="ann-item ${a.is_active ? 'ann-active' : ''}">
                    ${a.is_active ? '<span class="badge badge-medium" style="float:right; margin-left:8px;">ACTIVE</span>' : ''}
                    <p class="ann-item-msg">${this._esc(a.message)}</p>
                    <div class="ann-item-meta">
                        <span>Posted by ${this._esc(a.created_by_name || 'Admin')}</span>
                        <span>&bull;</span>
                        <span>${new Date(a.created_at).toLocaleString()}</span>
                    </div>
                </div>
            `).join('');
        })
        .catch(() => {});
    },

    uploadNotice: function() {
        const token = localStorage.getItem('token');
        if (!token) return app.alert('Please log in as admin first.');

        const fileInput = document.getElementById('admin-notice-pdf');
        if (!fileInput.files[0]) return app.alert('Please select a PDF file.');

        const formData = new FormData();
        formData.append('noticePdf', fileInput.files[0]);

        fetch('/api/admin/upload-notice', {
            method: 'POST',
            headers: { 'x-auth-token': token },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            app.alert(data.msg || 'Notice uploaded successfully!');
            fileInput.value = '';
        })
        .catch(() => app.alert('Error uploading notice.'));
    },

    addRoomInfo: function() {
        const token   = localStorage.getItem('token');
        if (!token) return app.alert('Please log in as admin first.');

        const type    = document.getElementById('admin-room-type').value;
        const keyword = document.getElementById('admin-room-keyword').value.trim();
        const details = document.getElementById('admin-room-details').value.trim();

        if (!keyword || !details) return app.alert('Please fill in both keyword and details.');

        fetch('/api/admin/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ type, keyword, details })
        })
        .then(res => res.json())
        .then(data => {
            app.alert(data.msg || 'Entry added successfully!');
            document.getElementById('admin-room-keyword').value = '';
            document.getElementById('admin-room-details').value = '';
            this.loadRoomInfo();
        })
        .catch(() => app.alert('Error adding room info.'));
    },

    loadRoomInfo: function() {
        const token = localStorage.getItem('token');
        if (!token) return;
        const list = document.getElementById('admin-room-list');
        if (!list) return;

        fetch('/api/admin/rooms', { headers: { 'x-auth-token': token } })
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                list.innerHTML = '<p style="color:var(--text-secondary); font-size:0.875rem;">No entries yet. Add a keyword above.</p>';
                return;
            }
            list.innerHTML = data.map(r => `
                <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; background:var(--bg-color); border:1px solid var(--glass-border); border-radius:var(--radius-sm); padding:10px 14px;">
                    <div style="flex:1; min-width:0;">
                        <div style="display:flex; gap:8px; align-items:center; margin-bottom:4px;">
                            <span class="tag">${r.type === 'helpline' ? '📞 Helpline' : '🚪 Room'}</span>
                            <strong style="font-size:0.875rem;">${this._esc(r.keyword)}</strong>
                        </div>
                        <p style="font-size:0.82rem; color:var(--text-secondary); line-height:1.4;">${this._esc(r.details)}</p>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteRoomInfo(${r.id})" style="flex-shrink:0;">Delete</button>
                </div>
            `).join('');
        })
        .catch(() => {
            list.innerHTML = '<p style="color:var(--text-secondary); font-size:0.875rem;">Failed to load entries.</p>';
        });
    },

    deleteRoomInfo: function(id) {
        const token = localStorage.getItem('token');
        if (!token) return;
        app._confirm('Delete this room/helpline entry?', () => {
            fetch(`/api/admin/rooms/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            })
            .then(res => res.json())
            .then(() => this.loadRoomInfo())
            .catch(() => app.alert('Failed to delete entry.'));
        });
    },

    // ── Chatbot ───────────────────────────────────────────────────────────

    toggleChat: function() {
        const widget = document.getElementById('chatbot-widget');
        const toggle = widget.querySelector('.chat-toggle');
        widget.classList.toggle('collapsed');
        toggle.innerHTML = widget.classList.contains('collapsed') ? '&#9650;' : '&#9660;';
    },

    sendMessage: function() {
        const input    = document.getElementById('chat-input');
        const text     = input.value.trim();
        if (!text) return;

        const chatBody = document.getElementById('chat-body');

        const userMsg = document.createElement('div');
        userMsg.className   = 'chat-message user';
        userMsg.textContent = text;
        chatBody.appendChild(userMsg);

        input.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        const typingMsg = document.createElement('div');
        typingMsg.className   = 'chat-message bot';
        typingMsg.textContent = '…';
        chatBody.appendChild(typingMsg);
        chatBody.scrollTop = chatBody.scrollHeight;

        fetch('/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        })
        .then(res => res.json())
        .then(data => {
            typingMsg.textContent = data.reply;
            chatBody.scrollTop = chatBody.scrollHeight;
        })
        .catch(() => {
            typingMsg.textContent = "Sorry, I'm having trouble connecting right now.";
        });
    },

    // ── Confirm Modal Helper ──────────────────────────────────────────────

    _confirmCallback: null,

    _confirm: function(msg, onConfirm) {
        // Reuse the custom-alert modal with a Cancel button
        document.getElementById('custom-alert-msg').innerText = msg;
        const btnArea = document.getElementById('custom-alert').querySelector('.modal-buttons');
        btnArea.innerHTML = `
            <button class="btn btn-secondary" id="confirm-cancel-btn">Cancel</button>
            <button class="btn btn-danger" id="confirm-ok-btn">Delete</button>
        `;
        document.getElementById('confirm-cancel-btn').onclick = () => {
            document.getElementById('custom-alert').style.display = 'none';
            this._restoreAlertBtn();
        };
        document.getElementById('confirm-ok-btn').onclick = () => {
            document.getElementById('custom-alert').style.display = 'none';
            this._restoreAlertBtn();
            onConfirm();
        };
        document.getElementById('custom-alert').style.display = 'flex';
    },

    _restoreAlertBtn: function() {
        document.getElementById('custom-alert').querySelector('.modal-buttons').innerHTML =
            '<button class="btn btn-primary" onclick="document.getElementById(\'custom-alert\').style.display=\'none\'">OK</button>';
    },

    // ── Private Helpers ───────────────────────────────────────────────────

    _esc: function(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    _capitalize: function(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    _statusLabel: function(status) {
        const labels = { pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved', open: 'Open' };
        return labels[status] || status;
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
