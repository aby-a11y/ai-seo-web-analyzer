import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, ExternalLink, AlertTriangle, CheckCircle, Info, 
  TrendingUp, Target, Users, FileText, Calendar, Copy, Check,
  Sparkles, Link2, Image as ImageIcon, Share2 
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReportPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedSection, setCopiedSection] = useState('');

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API}/seo/reports/${reportId}`);
      setReport(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load report');
      setLoading(false);
    }
  };

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  const getPriorityColor = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <Info className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Report not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </button>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-bold gradient-text">SEO Genius</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Website Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="website-overview">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">SEO Report</h1>
                {report.seo_score && (
                  <div className={`px-4 py-2 rounded-full font-bold text-2xl ${
                    report.seo_score >= 80 ? 'bg-green-100 text-green-800' :
                    report.seo_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`} data-testid="seo-score">
                    {report.seo_score}/100
                  </div>
                )}
              </div>
              <a 
                href={report.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 text-lg"
              >
                <span>{report.url}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-gray-500 mt-2">
                Analyzed on {new Date(report.analyzed_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {report.analysis_summary && (
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-lg">
              <p className="text-gray-800 leading-relaxed">{report.analysis_summary}</p>
            </div>
          )}

         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
  
  {/* Title Tag with Status Badge */}
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-l-4 border-indigo-500 hover:shadow-lg transition-all">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-700 font-semibold">Title Tag</p>
      {report.title && (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
          report.title.length >= 50 && report.title.length <= 60 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : report.title.length >= 45 && report.title.length <= 70
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {report.title.length >= 50 && report.title.length <= 60 
            ? '✓ Optimal' 
            : report.title.length >= 45 && report.title.length <= 70
            ? '⚠ Fair'
            : '✗ Fix'}
        </span>
      )}
    </div>
    <p className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2" title={report.title}>
      {report.title || 'Missing Title'}
    </p>
    {report.title && (
      <p className="text-xs text-gray-600 font-medium">
        {report.title.length} characters • Target: 50-60
      </p>
    )}
  </div>

  {/* Meta Description with Status Badge */}
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-l-4 border-purple-500 hover:shadow-lg transition-all">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-700 font-semibold">Meta Description</p>
      {report.meta_description && (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
          report.meta_description.length >= 150 && report.meta_description.length <= 160 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : report.meta_description.length >= 120 && report.meta_description.length <= 180
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {report.meta_description.length >= 150 && report.meta_description.length <= 160 
            ? '✓ Optimal' 
            : report.meta_description.length >= 120 && report.meta_description.length <= 180
            ? '⚠ Fair'
            : '✗ Fix'}
        </span>
      )}
    </div>
    <p className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2" title={report.meta_description}>
      {report.meta_description || 'Missing Meta'}
    </p>
    {report.meta_description && (
      <p className="text-xs text-gray-600 font-medium">
        {report.meta_description.length} characters • Target: 150-160
      </p>
    )}
  </div>

  {/* Word Count with Status Badge */}
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-l-4 border-blue-500 hover:shadow-lg transition-all">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-700 font-semibold">Content Length</p>
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
        report.word_count >= 1000 && report.word_count <= 2500 
          ? 'bg-green-100 text-green-800 border border-green-300' 
          : report.word_count >= 500 && report.word_count < 1000
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          : report.word_count >= 2501 && report.word_count <= 3000
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          : 'bg-red-100 text-red-800 border border-red-300'
      }`}>
        {report.word_count >= 1000 && report.word_count <= 2500 
          ? '✓ Good' 
          : report.word_count >= 500 || (report.word_count >= 2501 && report.word_count <= 3000)
          ? '⚠ Fair'
          : '✗ Thin'}
      </span>
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-1">
      {report.word_count.toLocaleString()}
    </p>
    <p className="text-xs text-gray-600 font-medium">words • Target: 1000-2500</p>
  </div>

  {/* Images Alt Text with Status Badge */}
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-l-4 border-green-500 hover:shadow-lg transition-all">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-700 font-semibold">Image Alt Tags</p>
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
        (report.images_without_alt ?? 0) === 0 
          ? 'bg-green-100 text-green-800 border border-green-300' 
          : (report.images_without_alt ?? 0) <= 3
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          : 'bg-red-100 text-red-800 border border-red-300'
      }`}>
        {(report.images_without_alt ?? 0) === 0 
          ? '✓ Perfect' 
          : (report.images_without_alt ?? 0) <= 3
          ? '⚠ Minor'
          : '✗ Issue'}
      </span>
    </div>
    <div className="flex items-baseline space-x-2 mb-1">
      <p className="text-3xl font-bold text-gray-900">{report.total_images ?? 0}</p>
      <p className="text-sm text-gray-600 font-medium">images</p>
    </div>
    <p className={`text-xs font-semibold ${
      (report.images_without_alt ?? 0) === 0 ? 'text-green-600' : 'text-red-600'
    }`}>
      {(report.images_without_alt ?? 0) === 0 
        ? '✓ All have alt text' 
        : `${report.images_without_alt} missing alt text`}
    </p>
  </div>

</div>

        

        {/* ========== TECHNICAL SEO SECTION (NEW) ========== */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="technical-seo-section">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 mb-6">
            <CheckCircle className="w-7 h-7 text-indigo-600" />
            <span>Technical SEO</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Canonical URL */}
            <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2 font-medium">Canonical Tag</p>
              <div className="flex items-center space-x-2 mb-2">
{report.canonical_url ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-700">Present</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-red-700">Missing</span>
                  </>
                )}
              </div>
              {report.canonical_url && (
                <p className="text-xs text-gray-600 break-all mt-2 bg-white p-2 rounded">
                  {report.canonical_url}
                </p>
              )}
              {!report.canonical_url && (
                <p className="text-xs text-gray-600 mt-2">
                  Add canonical tag to avoid duplicate content issues
                </p>
              )}
              {/* Canonical Issues */}
              {Array.isArray(report.canonical_issues) && report.canonical_issues.length > 0 && (
                <div className="mt-3 text-xs text-red-700 bg-red-50 p-2 rounded space-y-1">
                  {report.canonical_issues.slice(0, 3).map((issue, idx) => (
                    <div key={idx} className="flex items-start space-x-1">
                      <span>•</span>
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>


            {/* SSL Certificate */}
            <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-green-500 hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2 font-medium">SSL Certificate</p>
              <div className="flex items-center space-x-2 mb-2">
                {report.ssl_enabled ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-700">Enabled</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-red-700">Disabled</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {(report.technical_seo?.ssl_enabled ?? report.ssl_enabled) ? 'Secure HTTPS connection ✓' : 'HTTP only - migrate to HTTPS'}

              </p>
            </div>

            {/* Robots.txt */}
            <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-purple-500 hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2 font-medium">Robots.txt</p>
              <div className="flex items-center space-x-2 mb-2">
                {report.robots_txt_found ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-700">Found</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-bold text-yellow-700">Not Found</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {report.robots_txt_found ? 'Crawl instructions present' : 'Add robots.txt for better indexing'}
              </p>
            </div>

            {/* Sitemap */}
            <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2 font-medium">XML Sitemap</p>
              <div className="flex items-center space-x-2 mb-2">
                {report.sitemap_found ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-700">Found</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-bold text-yellow-700">Not Found</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {report.sitemap_found ? 'Sitemap.xml accessible' : 'Create sitemap.xml for better crawling'}
              </p>
            </div>
          </div>
        </div>
        {/* ========== END TECHNICAL SEO SECTION ========== */}

{/* ========== SOCIAL & BACKLINK ANALYSIS SECTION (NEW!) ========== */}
{report.backlink_analysis && (
  <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="social-backlink-section">
    <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 mb-6">
      <Share2 className="w-7 h-7 text-indigo-600" />
      <span>Social & Backlink Analysis</span>
    </h2>
    
    {/* Main Metrics Grid */}
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-l-4 border-blue-500">
        <p className="text-sm text-gray-700 mb-1 font-medium">External Links</p>
        <p className="text-3xl font-bold text-blue-900">{report.backlink_analysis.total_external_links ?? 0}</p>
        <p className="text-xs text-gray-600 mt-1">Outbound links</p>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-l-4 border-green-500">
        <p className="text-sm text-gray-700 mb-1 font-medium">Dofollow Links</p>
        <p className="text-3xl font-bold text-green-900">{report.backlink_analysis.dofollow_count ?? 0}</p>
        <p className="text-xs text-gray-600 mt-1">Link equity passing</p>
      </div>
      
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-lg border-l-4 border-yellow-500">
        <p className="text-sm text-gray-700 mb-1 font-medium">Unique Domains</p>
        <p className="text-3xl font-bold text-yellow-900">{report.backlink_analysis.unique_domains ?? 0}</p>
        <p className="text-xs text-gray-600 mt-1">Domain diversity</p>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-l-4 border-purple-500">
        <p className="text-sm text-gray-700 mb-1 font-medium">Link Quality</p>
        <p className="text-3xl font-bold text-purple-900">{report.backlink_analysis.link_quality_score ?? 0}/100</p>
        <p className="text-xs text-gray-600 mt-1">Algorithm score</p>
      </div>
    </div>

    {/* Top Linked Domains Table */}
    {Array.isArray(report.backlink_analysis.top_linked_domains) && report.backlink_analysis.top_linked_domains.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <ExternalLink className="w-5 h-5 text-indigo-600" />
          <span>Top Linked Domains (Referrer Potential)</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Domain</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Links</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Authority</th>
              </tr>
            </thead>
            <tbody>
              {report.backlink_analysis.top_linked_domains.slice(0, 10).map((domain, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-900 font-medium">{domain.domain}</td>
                  <td className="p-3 text-sm text-gray-700">{domain.link_count}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      domain.estimated_authority.includes('High') ? 'bg-green-100 text-green-800' :
                      domain.estimated_authority.includes('Medium') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {domain.estimated_authority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Referrer Strategy & Recommendations */}
    {Array.isArray(report.backlink_analysis.recommendations) && report.backlink_analysis.recommendations.length > 0 && (
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
        <p className="text-sm font-semibold text-indigo-900 mb-2 flex items-center space-x-2">
          <Target className="w-4 h-4" />
          <span>Referrer Strategy & Recommendations</span>
        </p>
        <ul className="space-y-1">
          {report.backlink_analysis.recommendations.map((rec, idx) => (
            <li key={idx} className="text-sm text-indigo-800 flex items-start space-x-2">
              <span className="mt-1">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Additional Link Metrics */}
    <div className="grid md:grid-cols-2 gap-4 mt-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700 mb-1 font-medium">Nofollow Links</p>
        <p className="text-2xl font-bold text-gray-900">{report.backlink_analysis.nofollow_count ?? 0}</p>
        <p className="text-xs text-gray-600 mt-1">No link equity transfer</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700 mb-1 font-medium">Dofollow Ratio</p>
        <p className="text-2xl font-bold text-gray-900">
          {report.backlink_analysis.total_external_links > 0 
            ? Math.round((report.backlink_analysis.dofollow_count / report.backlink_analysis.total_external_links) * 100) 
            : 0}%
        </p>
        <p className="text-xs text-gray-600 mt-1">Target: 60-80%</p>
      </div>
    </div>
  </div>
)}

/* end of social media



        {/* ========== INTERNAL LINKING SECTION (NEW) ========== */}
        {report.linking_analysis && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="internal-linking-section">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 mb-6">
              <Link2 className="w-7 h-7 text-indigo-600" />
              <span>Internal Linking Analysis</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-lg border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 mb-1 font-medium">Total Links</p>
                <p className="text-3xl font-bold text-indigo-900">{report.linking_analysis.total_links ?? 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-l-4 border-green-500">
                <p className="text-sm text-gray-700 mb-1 font-medium">Internal Links</p>
                <p className="text-3xl font-bold text-green-900">{report.linking_analysis.internal_count ?? 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-gray-700 mb-1 font-medium">External Links</p>
                <p className="text-3xl font-bold text-blue-900">{report.linking_analysis.external_count ?? 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-l-4 border-purple-500">
                <p className="text-sm text-gray-700 mb-1 font-medium">Internal Ratio</p>
                <p className="text-3xl font-bold text-purple-900">{report.linking_analysis.internal_ratio ?? 0}%</p>
                <p className="text-xs text-gray-600 mt-1">Target: 70-80%</p>
              </div>
            </div>

            {/* Linking Issues/Recommendations */}
            {Array.isArray(report.linking_analysis.recommendations) && report.linking_analysis.recommendations.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <p className="text-sm font-semibold text-yellow-900 mb-2">Recommendations:</p>
                <ul className="space-y-1">
                  {report.linking_analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-yellow-800 flex items-start space-x-2">
                      <span className="mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Metrics */}
            {(report.linking_analysis.nofollow_internal_count > 0 || report.linking_analysis.empty_anchor_count > 0) && (
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {report.linking_analysis.nofollow_internal_count > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-gray-700 mb-1">Nofollow Internal Links</p>
                    <p className="text-2xl font-bold text-red-700">{report.linking_analysis.nofollow_internal_count}</p>
                    <p className="text-xs text-red-600 mt-1">Should be 0 for better SEO</p>
                  </div>
                )}
                
                {report.linking_analysis.empty_anchor_count > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-gray-700 mb-1">Empty Anchor Text</p>
                    <p className="text-2xl font-bold text-red-700">{report.linking_analysis.empty_anchor_count}</p>
                    <p className="text-xs text-red-600 mt-1">Add descriptive anchor text</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* ========== END INTERNAL LINKING SECTION ========== */}
       
        {/* ========== BACKLINK & REFERRER ANALYSIS SECTION (NEW!) ========== */}
        {report.backlink_analysis && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="backlink-analysis-section">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 mb-6">
              <ExternalLink className="w-7 h-7 text-indigo-600" />
              <span>Backlink & Referrer Analysis</span>
            </h2>
            
            {/* Main Metrics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-gray-700 mb-1 font-medium">Total External Links</p>
                <p className="text-3xl font-bold text-blue-900">{report.backlink_analysis.total_external_links ?? 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-l-4 border-green-500">
                <p className="text-sm text-gray-700 mb-1 font-medium">Dofollow Links</p>
                <p className="text-3xl font-bold text-green-900">{report.backlink_analysis.dofollow_count ?? 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm text-gray-700 mb-1 font-medium">Unique Domains</p>
                <p className="text-3xl font-bold text-yellow-900">{report.backlink_analysis.unique_domains ?? 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-l-4 border-purple-500">
                <p className="text-sm text-gray-700 mb-1 font-medium">Link Quality Score</p>
                <p className="text-3xl font-bold text-purple-900">{report.backlink_analysis.link_quality_score ?? 0}/100</p>
                <p className="text-xs text-gray-600 mt-1">Algorithm-based</p>
              </div>
            </div>

            {/* Top Linked Domains Table */}
            {Array.isArray(report.backlink_analysis.top_linked_domains) && report.backlink_analysis.top_linked_domains.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Linked Domains</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Domain</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Links</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Estimated Authority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.backlink_analysis.top_linked_domains.slice(0, 10).map((domain, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-3 text-sm text-gray-900 font-medium">{domain.domain}</td>
                          <td className="p-3 text-sm text-gray-700">{domain.link_count}</td>
                          <td className="p-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              domain.estimated_authority.includes('High') ? 'bg-green-100 text-green-800' :
                              domain.estimated_authority.includes('Medium') ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {domain.estimated_authority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {Array.isArray(report.backlink_analysis.recommendations) && report.backlink_analysis.recommendations.length > 0 && (
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                <p className="text-sm font-semibold text-indigo-900 mb-2">🎯 Referrer Strategy & Recommendations:</p>
                <ul className="space-y-1">
                  {report.backlink_analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-indigo-800 flex items-start space-x-2">
                      <span className="mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Metrics */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 mb-1">Nofollow Links</p>
                <p className="text-2xl font-bold text-gray-900">{report.backlink_analysis.nofollow_count ?? 0}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 mb-1">Dofollow Ratio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {report.backlink_analysis.total_external_links > 0 
                    ? Math.round((report.backlink_analysis.dofollow_count / report.backlink_analysis.total_external_links) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-gray-600 mt-1">Target: 60-80%</p>
              </div>
            </div>
          </div>
        )}
        {/* ========== END BACKLINK ANALYSIS SECTION ========== */}


        {/* SEO Issues */}
        {report.seo_issues && report.seo_issues.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="seo-issues-section">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <AlertTriangle className="w-7 h-7 text-red-500" />
                <span>SEO Issues Detected</span>
              </h2>
              <span className="text-gray-600 font-medium">
                {report.seo_issues.length} issue{report.seo_issues.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-4">
              {report.seo_issues.map((issue, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center space-x-1 ${getPriorityColor(issue.priority)}`}>
                        {getPriorityIcon(issue.priority)}
                        <span>{issue.priority}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {issue.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{issue.issue}</h3>
                  <p className="text-gray-700 leading-relaxed">
                    <span className="font-medium text-indigo-600">Fix:</span> {issue.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keyword Strategy */}
        {report.keyword_strategy && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="keyword-strategy-section">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Target className="w-7 h-7 text-indigo-600" />
                <span>Keyword Strategy</span>
              </h2>
              <button
                onClick={() => copyToClipboard(
                  `Primary: ${report.keyword_strategy.primary_keyword}\n\nLong-tail:\n${report.keyword_strategy.long_tail_keywords.join('\n')}`,
                  'keywords'
                )}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copiedSection === 'keywords' ? (
                  <><Check className="w-4 h-4 text-green-600" /> <span className="text-sm">Copied!</span></>
                ) : (
                  <><Copy className="w-4 h-4" /> <span className="text-sm">Copy</span></>
                )}
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2 font-medium">Primary Keyword</p>
              <p className="text-2xl font-bold text-gray-900">{report.keyword_strategy.primary_keyword}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-4 font-medium">Long-tail Keywords</p>
              <div className="grid md:grid-cols-2 gap-3">
                {report.keyword_strategy.long_tail_keywords.map((keyword, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{keyword}</p>
                      {report.keyword_strategy.keyword_intent[keyword] && (
                        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded mt-1 inline-block">
                          {report.keyword_strategy.keyword_intent[keyword]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Competitor Analysis */}
        {report.competitor_analysis && Object.keys(report.competitor_analysis).length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="competitor-analysis-section">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 mb-6">
              <Users className="w-7 h-7 text-indigo-600" />
              <span>Competitive Landscape</span>
            </h2>

            {report.competitor_analysis.assumed_competitors && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-600 mb-3">Likely Competitors</p>
                <div className="flex flex-wrap gap-2">
                  {report.competitor_analysis.assumed_competitors.map((competitor, index) => (
                    <span key={index} className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-medium">
                      {competitor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {report.competitor_analysis.content_gaps && report.competitor_analysis.content_gaps.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">Content Gaps</p>
                  <ul className="space-y-2">
                    {report.competitor_analysis.content_gaps.map((gap, index) => (
                      <li key={index} className="flex items-start space-x-2 text-gray-700">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.competitor_analysis.opportunities && report.competitor_analysis.opportunities.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">Opportunities</p>
                  <ul className="space-y-2">
                    {report.competitor_analysis.opportunities.map((opp, index) => (
                      <li key={index} className="flex items-start space-x-2 text-gray-700">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Recommendations */}
        {report.content_recommendations && report.content_recommendations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="content-recommendations-section">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 mb-6">
              <FileText className="w-7 h-7 text-indigo-600" />
              <span>Content Recommendations</span>
            </h2>
            <div className="space-y-6">
              {report.content_recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                      {rec.page_type}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{rec.topic}</h3>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Target Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.target_keywords.map((kw, kwIndex) => (
                        <span key={kwIndex} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {rec.structure && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-3">Suggested Structure</p>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        {rec.structure.h1 && rec.structure.h1.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">H1</p>
                            {rec.structure.h1.map((h, hIndex) => (
                              <p key={hIndex} className="text-gray-900 font-semibold">{h}</p>
                            ))}
                          </div>
                        )}
                        {rec.structure.h2 && rec.structure.h2.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">H2</p>
                            {rec.structure.h2.map((h, hIndex) => (
                              <p key={hIndex} className="text-gray-800 pl-4">{h}</p>
                            ))}
                          </div>
                        )}
                        {rec.structure.h3 && rec.structure.h3.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">H3</p>
                            {rec.structure.h3.map((h, hIndex) => (
                              <p key={hIndex} className="text-gray-700 pl-8 text-sm">{h}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 30-Day Action Plan */}
        {report.action_plan_30_days && report.action_plan_30_days.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8" data-testid="action-plan-section">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 mb-6">
              <Calendar className="w-7 h-7 text-indigo-600" />
              <span>30-Day Action Plan</span>
            </h2>
            <div className="space-y-4">
              {report.action_plan_30_days.map((item, index) => (
                <div key={index} className="border-l-4 border-indigo-600 bg-gradient-to-r from-indigo-50 to-white p-6 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{item.week || `Week ${index + 1}`}</h3>
                    {item.priority && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                        {item.priority} Priority
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 mb-2 leading-relaxed">{item.action}</p>
                  {item.expected_impact && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Expected Impact:</span> {item.expected_impact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
