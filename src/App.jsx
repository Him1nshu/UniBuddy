import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  AlertCircle,
  Package,
  LogOut,
  User,
  Menu,
  X,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';

/* ================= MOCK DATA ================= */

const mockUsers = [
  { email: 'student@college.edu', password: 'demo123', name: 'John Doe', role: 'student' },
  { email: 'admin@college.edu', password: 'admin123', name: 'Admin User', role: 'admin' }
];

const mockLostItems = [
  {
    id: 1,
    type: 'lost',
    item: 'Blue Backpack',
    location: 'Library 2nd Floor',
    date: '2026-01-20',
    description: 'Blue Jansport backpack with laptop inside',
    contact: 'john@college.edu'
  },
  {
    id: 2,
    type: 'found',
    item: 'iPhone 13',
    location: 'Cafeteria',
    date: '2026-01-19',
    description: 'Black iPhone with cracked screen',
    contact: 'security@college.edu'
  }
];

const mockReports = [
  {
    id: 1,
    category: 'Maintenance',
    title: 'Broken AC in Room 301',
    description: 'Air conditioning not working',
    location: 'Building A, Room 301',
    status: 'in-progress',
    date: '2026-01-18'
  }
];

const mockBooks = [
  {
    id: 1,
    title: 'Clean Code',
    author: 'Robert Martin',
    isbn: '978-0132350884',
    available: 2
  },
  {
    id: 2,
    title: 'The Pragmatic Programmer',
    author: 'Hunt & Thomas',
    isbn: '978-0135957059',
    available: 1
  }
];

/* ================= MAIN APP ================= */

export default function CampusHelpWebsite() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [lostItems, setLostItems] = useState(mockLostItems);
  const [lostFilter, setLostFilter] = useState('all');
  const [showLostForm, setShowLostForm] = useState(false);

  const [reports, setReports] = useState(mockReports);
  const [showReportForm, setShowReportForm] = useState(false);

  const [books] = useState(mockBooks);
  const [search, setSearch] = useState('');

  /* ===== LOGIN ===== */
  const handleLogin = (e) => {
    e.preventDefault();
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  if (!currentUser) {
    return (
      <LoginPage
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={loginError}
        onLogin={handleLogin}
      />
    );
  }

  /* ===== FILTERS ===== */
  const filteredLostItems =
    lostFilter === 'all'
      ? lostItems
      : lostItems.filter((i) => i.type === lostFilter);

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <BookOpen />
          <h1 className="text-xl font-bold">Campus Help</h1>
        </div>
        <button
          onClick={() => setCurrentUser(null)}
          className="flex items-center space-x-1"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>

      {/* NAV */}
      <nav className="bg-white shadow flex space-x-4 px-4">
        <TabButton label="Home" onClick={() => setActiveTab('home')} active={activeTab === 'home'} />
        <TabButton label="Lost & Found" onClick={() => setActiveTab('lost')} active={activeTab === 'lost'} />
        <TabButton label="Reports" onClick={() => setActiveTab('reports')} active={activeTab === 'reports'} />
        <TabButton label="Library" onClick={() => setActiveTab('library')} active={activeTab === 'library'} />
      </nav>

      {/* CONTENT */}
      <main className="p-6">
        {activeTab === 'home' && <HomePage />}

        {activeTab === 'lost' && (
          <>
            <button
              onClick={() => setShowLostForm(!showLostForm)}
              className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              {showLostForm ? 'Cancel' : '+ Report Item'}
            </button>

            {showLostForm && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const newItem = {
                    id: Date.now(),
                    type: 'lost',
                    item: formData.get('item'),
                    description: formData.get('description'),
                    location: formData.get('location'),
                    date: new Date().toISOString().split('T')[0],
                    contact: currentUser.email,
                  };
                  setLostItems([newItem, ...lostItems]);
                  setShowLostForm(false);
                }}
                className="bg-gray-50 p-4 rounded mb-4 border border-gray-200"
              >
                <div className="space-y-3">
                  <input
                    name="item"
                    placeholder="Item Name (e.g. Blue Backpack)"
                    required
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="location"
                    placeholder="Location Last Seen"
                    required
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    name="description"
                    placeholder="Description"
                    required
                    className="w-full p-2 border rounded"
                  />
                  <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
                    Submit Report
                  </button>
                </div>
              </form>
            )}

            <div className="flex space-x-2 mb-4">
              <FilterButton label="All" active={lostFilter === 'all'} onClick={() => setLostFilter('all')} />
              <FilterButton label="Lost" active={lostFilter === 'lost'} onClick={() => setLostFilter('lost')} />
              <FilterButton label="Found" active={lostFilter === 'found'} onClick={() => setLostFilter('found')} />
            </div>

            {filteredLostItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded shadow mb-3">
                <h3 className="font-bold">{item.item}</h3>
                <p>{item.description}</p>
                <p className="text-sm text-gray-500">{item.location}</p>
              </div>
            ))}
          </>
        )}

        {activeTab === 'reports' && (
          <>
            <button
              onClick={() => setShowReportForm(!showReportForm)}
              className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              {showReportForm ? 'Cancel' : '+ New Report'}
            </button>

            {showReportForm && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const newReport = {
                    id: Date.now(),
                    category: 'General',
                    title: formData.get('title'),
                    description: formData.get('description'),
                    location: formData.get('location'),
                    status: 'open',
                    date: new Date().toISOString().split('T')[0],
                  };
                  setReports([newReport, ...reports]);
                  setShowReportForm(false);
                }}
                className="bg-gray-50 p-4 rounded mb-4 border border-gray-200"
              >
                <div className="space-y-3">
                  <input
                    name="title"
                    placeholder="Issue Title (e.g. Broken Wi-Fi)"
                    required
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="location"
                    placeholder="Location"
                    required
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    name="description"
                    placeholder="Description of the issue"
                    required
                    className="w-full p-2 border rounded"
                  />
                  <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
                    Submit Maintenance Report
                  </button>
                </div>
              </form>
            )}

            {reports.map((r) => (
              <div key={r.id} className="bg-white p-4 rounded shadow mb-3">
                <h3 className="font-bold">{r.title}</h3>
                <p>{r.description}</p>
                <p className="text-sm text-gray-500">{r.location}</p>
              </div>
            ))}
          </>
        )}

        {activeTab === 'library' && (
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books..."
              className="mb-4 p-2 border rounded w-full"
            />

            {filteredBooks.map((b) => (
              <div key={b.id} className="bg-white p-4 rounded shadow mb-3">
                <h3 className="font-bold">{b.title}</h3>
                <p>{b.author}</p>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function LoginPage({ email, setEmail, password, setPassword, error, onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600">
      <form onSubmit={onLogin} className="bg-white p-6 rounded w-80 space-y-3">
        <h2 className="text-xl font-bold text-center">Campus Help</h2>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-blue-600 text-white w-full py-2 rounded">Login</button>
      </form>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-4 font-medium ${active ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
        }`}
    >
      {label}
    </button>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded ${active ? 'bg-blue-600 text-white' : 'bg-gray-300'
        }`}
    >
      {label}
    </button>
  );
}

function HomePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome to Campus Help</h2>
      <p>Your one-stop solution for campus services.</p>
    </div>
  );
}


