import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Sparkles, TrendingUp, Target, FileText, Zap, ArrowRight, History, User, Mail, Phone } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // ✨ NEW: User Details State
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showUserForm, setShowUserForm] = useState(false);

  // ✨ Normalize URL function
  const normalizeUrl = (inputUrl) => {
    let normalized = inputUrl.trim();
    
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = 'https://' + normalized;
    }
    
    try {
      const urlObj = new URL(normalized);
      if (!urlObj.hostname.startsWith('www.') && !urlObj.hostname.match(/^localhost/i)) {
        urlObj.hostname = 'www.' + urlObj.hostname;
      }
      normalized = urlObj.toString();
    } catch (e) {
      return normalized;
    }
    
    return normalized;
  };

  // ✨ NEW: Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✨ NEW: Validate phone format
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    return phoneRegex.test(phone);
  };

  // ✨ Step 1: URL validation
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const normalizedUrl = normalizeUrl(url);
    
    try {
      new URL(normalizedUrl);
    } catch {
      setError('Please enter a valid website URL');
      return;
    }

    setShowUserForm(true);
  };

  // ✨ Step 2: Submit with user details
  const handleAnalyzeWithDetails = async (e) => {
    e.preventDefault();
    setError('');

    if (!userDetails.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!validateEmail(userDetails.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePhone(userDetails.phone)) {
      setError('Please enter a valid phone number (minimum 10 digits)');
      return;
    }

    setLoading(true);
    
    try {
      const normalizedUrl = normalizeUrl(url);
      
      // ✨ Send with user details
      const response = await axios.post(`${API}/seo/analyze`, {
        url: normalizedUrl,
        user_details: {
          name: userDetails.name.trim(),
          email: userDetails.email.trim(),
          phone: userDetails.phone.trim()
        }
      });
      
      const reportId = response.data.id;
      navigate(`/report/${reportId}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze website');
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowUserForm(false);
    setError('');
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold gradient-text">Pixel Global</span>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <History className="w-5 h-5" />
              <span>History</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            AI-Powered <span className="gradient-text">SEO Analysis</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get instant, comprehensive SEO audits powered by advanced AI
          </p>

          {/* Conditional: URL Form OR User Details Form */}
          <div className="max-w-3xl mx-auto">
            {!showUserForm ? (
              // URL INPUT FORM
              <div>
                <form onSubmit={handleUrlSubmit}>
                  <div className="flex items-center bg-white rounded-2xl shadow-xl border-2 focus-within:border-indigo-500">
                    <Search className="w-6 h-6 text-gray-400 ml-6" />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Enter website URL (e.g., pixelglobal.com)"
                      className="flex-1 px-4 py-5 text-lg outline-none rounded-l-2xl"
                      required
                    />
                    <button
                      type="submit"
                      className="px-8 py-5 bg-indigo-600 text-white font-semibold rounded-r-2xl hover:bg-indigo-700"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-5 h-5 inline ml-2" />
                    </button>
                  </div>
                </form>
                {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
              </div>
            ) : (
              // USER DETAILS FORM
              <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
                <h2 className="text-2xl font-bold mb-2">Almost there! 🎉</h2>
                <p className="text-gray-600 mb-4">Enter your details to get your SEO report</p>
                <div className="p-3 bg-indigo-50 rounded-lg mb-6">
                  <p className="text-sm text-indigo-700">📊 Analyzing: <strong>{url}</strong></p>
                </div>

                <form onSubmit={handleAnalyzeWithDetails} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={userDetails.name}
                      onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={userDetails.email}
                      onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={userDetails.phone}
                      onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>

                  {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                    >
                      {loading ? 'Analyzing...' : 'Start Analysis'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <FeatureCard icon={<TrendingUp className="w-8 h-8" />} title="Comprehensive Analysis" />
          <FeatureCard icon={<Target className="w-8 h-8" />} title="Keyword Strategy" />
          <FeatureCard icon={<Sparkles className="w-8 h-8" />} title="AI-Powered" />
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold">Analyzing Your Website</h3>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg">
    <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold">{title}</h3>
  </div>
);

export default HomePage;
