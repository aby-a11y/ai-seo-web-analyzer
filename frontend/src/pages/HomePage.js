import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Sparkles, TrendingUp, Target, FileText, Zap, ArrowRight, History } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✨ NEW: Normalize URL function
  const normalizeUrl = (inputUrl) => {
    let normalized = inputUrl.trim();
    
    // Remove leading/trailing spaces
    normalized = normalized.trim();
    
    // If URL doesn't have protocol, add https://
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = 'https://' + normalized;
    }
    
    // If URL doesn't have www., add it (optional - you can remove this if not needed)
    // This ensures consistency: example.com → https://www.example.com
    try {
      const urlObj = new URL(normalized);
      if (!urlObj.hostname.startsWith('www.') && !urlObj.hostname.match(/^localhost/i)) {
        urlObj.hostname = 'www.' + urlObj.hostname;
      }
      normalized = urlObj.toString();
    } catch (e) {
      // If URL parsing fails, return as-is
      return normalized;
    }
    
    return normalized;
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    
    // ✨ UPDATED: Normalize URL before validation
    const normalizedUrl = normalizeUrl(url);
    
    // Validate URL
    try {
      new URL(normalizedUrl);
    } catch {
      setError('Please enter a valid website URL (e.g., example.com or https://example.com)');
      return;
    }

    setLoading(true);
    
    try {
      // ✨ UPDATED: Use normalized URL
      const response = await axios.post(`${API}/seo/analyze`, { url: normalizedUrl });
      const reportId = response.data.id;
      navigate(`/report/${reportId}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze website. Please try again.');
      setLoading(false);
    }
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
              data-testid="history-nav-button"
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
            Get instant, comprehensive SEO audits powered by advanced AI. 
            Identify issues, discover opportunities, and dominate search rankings.
          </p>

          {/* URL Input Form */}
          <div className="max-w-3xl mx-auto" data-testid="url-input-form">
            <form onSubmit={handleAnalyze} className="relative">
              <div className="flex items-center bg-white rounded-2xl shadow-xl border-2 border-transparent focus-within:border-indigo-500 transition-all">
                <Search className="w-6 h-6 text-gray-400 ml-6" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL (e.g., example.com or pixelglobal.com)"
                  className="flex-1 px-4 py-5 text-lg outline-none rounded-l-2xl"
                  disabled={loading}
                  data-testid="url-input"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !url}
                  className="px-8 py-5 bg-indigo-600 text-white font-semibold rounded-r-2xl hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  data-testid="analyze-button"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" data-testid="error-message">
                {error}
              </div>
            )}
            {/* ✨ NEW: Helper text */}
            <p className="mt-3 text-sm text-gray-500">
              💡 Just enter the domain name - we'll handle the rest! (e.g., pixelglobal.com)
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Comprehensive Analysis"
            description="Deep dive into title tags, meta descriptions, heading structure, and technical SEO signals."
          />
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Keyword Strategy"
            description="Get primary and long-tail keyword recommendations with intent classification."
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="Content Recommendations"
            description="Receive SEO-optimized content ideas and ideal page structures."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Competitor Insights"
            description="Understand content gaps and opportunities to outperform competitors."
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="AI-Powered"
            description="Leveraging GPT-4o-mini for expert-level SEO consulting and analysis."
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="30-Day Action Plan"
            description="Get a clear, prioritized roadmap for maximum impact with minimal effort."
          />
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" data-testid="loading-overlay">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Website</h3>
            <p className="text-gray-600">Our AI is performing a comprehensive SEO audit...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
    <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default HomePage;
