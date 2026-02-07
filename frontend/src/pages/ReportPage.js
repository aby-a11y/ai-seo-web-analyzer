import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, CheckCircle, XCircle, AlertTriangle, Info,
  FileText, Code, Link as LinkIcon, Zap, Globe, Users
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const ReportPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
    try {
      console.log('Fetching report:', reportId);
      const response = await axios.get(`${API}/seo/reports/${reportId}`);
      console.log('Report data:', response.data);
      setReport(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load report:', err);
      setError(err.response?.data?.detail || 'Failed to load report');
      setLoading(false);
    }
  };

  // Helper function to safely get nested values
  const get = (obj, path, defaultValue = null) => {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result?.[key] === undefined) return defaultValue;
      result = result[key];
    }
    return result ?? defaultValue;
  };

  const ScoreCircle = ({ score, label }) => {
    const safeScore = score || 0;
    const getColor = (score) => {
      if (score >= 80) return 'text-green-600 border-green-600';
      if (score >= 60) return 'text-yellow-600 border-yellow-600';
      return 'text-red-600 border-red-600';
    };

    return (
      <div className="flex flex-col items-center">
        <div className={`w-24 h-24 rounded-full border-8 ${getColor(safeScore)} flex items-center justify-center`}>
          <span className="text-3xl font-bold">{safeScore}</span>
        </div>
        <p className="mt-2 text-gray-600 font-medium">{label}</p>
      </div>
    );
  };

  const StatusIcon = ({ status }) => {
    if (status === 'pass') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'fail') return <XCircle className="w-5 h-5 text-red-600" />;
    if (status === 'warning') return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <Info className="w-5 h-5 text-gray-400" />;
  };

  const CheckItem = ({ label, status, value, recommendation }) => (
    <div className="border-b last:border-b-0 py-4">
      <div className="flex items-start space-x-3">
        <StatusIcon status={status} />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{label}</h4>
          {value && <p className="text-sm text-gray-600 mt-1">{value}</p>}
          {recommendation && (
            <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-600 rounded-r text-sm text-gray-700">
              💡 {recommendation}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error || 'Report not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Safely extract data
  const scraped = report.scraped_data || {};
  const onpage = scraped.on_page_seo || {};
  const technical = scraped.technical_seo || {};
  const content = scraped.content_analysis || {};
  const internal = scraped.internal_linking || {};
  const backlinks = scraped.backlinks || {};

  // Safe getters
  const title = onpage.title || '';
  const titleLength = title.length;
  const metaDesc = onpage.meta_description || '';
  const metaLength = metaDesc.length;
  const h1Tags = onpage.h1_tags || [];
  const h2Tags = onpage.h2_tags || [];
  const h3Tags = onpage.h3_tags || [];
  const wordCount = content.word_count || 0;
  const totalImages = content.total_images || 0;
  const imagesWithoutAlt = content.images_without_alt || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Audit Report</h1>
              <a 
                href={report.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-600 hover:underline break-all"
              >
                {report.url}
              </a>
            </div>
            <ScoreCircle score={report.seo_score} label="Overall Score" />
          </div>

          {/* Summary */}
          {report.ai_report?.summary && (
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg">
              <p className="text-gray-800">{report.ai_report.summary}</p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="flex overflow-x-auto">
            {[
              { id: 'basic', label: 'Basic SEO', icon: FileText },
              { id: 'advanced', label: 'Advanced', icon: Code },
              { id: 'keywords', label: 'Keywords', icon: LinkIcon },
              { id: 'performance', label: 'Performance', icon: Zap },
              { id: 'local', label: 'Local SEO', icon: Globe },
              { id: 'social', label: 'Social', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-all ${
                    activeSection === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          {/* BASIC SEO */}
          {activeSection === 'basic' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-indigo-600" />
                Basic SEO
              </h2>

              <CheckItem
                label="Meta Title"
                status={titleLength >= 50 && titleLength <= 60 ? 'pass' : titleLength > 0 ? 'warning' : 'fail'}
                value={title ? `"${title}" (${titleLength} chars)` : 'Missing'}
                recommendation={
                  !title ? 'Add a title tag (50-60 characters recommended)' :
                  titleLength < 50 ? 'Title too short. Aim for 50-60 characters.' :
                  titleLength > 60 ? 'Title too long. Keep it under 60 characters.' : null
                }
              />

              <CheckItem
                label="Meta Description"
                status={metaLength >= 150 && metaLength <= 160 ? 'pass' : metaLength > 0 ? 'warning' : 'fail'}
                value={metaDesc ? `"${metaDesc.substring(0, 100)}..." (${metaLength} chars)` : 'Missing'}
                recommendation={
                  !metaDesc ? 'Add a meta description (150-160 characters)' :
                  metaLength < 150 ? 'Description too short. Aim for 150-160 characters.' :
                  metaLength > 160 ? 'Description too long. Keep it under 160 characters.' : null
                }
              />

              {/* SERP Preview */}
              <div className="border-b py-4">
                <h4 className="font-semibold text-gray-900 mb-3">SERP Snippet Preview</h4>
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <div className="text-blue-600 text-lg font-medium mb-1">
                    {title || 'Your Page Title Here (50-60 chars)'}
                  </div>
                  <div className="text-green-700 text-sm mb-2">
                    {report.url}
                  </div>
                  <div className="text-gray-700 text-sm">
                    {metaDesc || 'Your meta description will appear here (150-160 characters)...'}
                  </div>
                </div>
              </div>

              <CheckItem
                label="H1 Header Tag"
                status={h1Tags.length === 1 ? 'pass' : h1Tags.length > 1 ? 'warning' : 'fail'}
                value={h1Tags.length > 0 ? `${h1Tags.length} H1(s): "${h1Tags.join('", "')}"` : 'No H1 found'}
                recommendation={
                  h1Tags.length === 0 ? 'Add exactly one H1 tag to your page' :
                  h1Tags.length > 1 ? 'Use only one H1 tag per page for better SEO' : null
                }
              />

              <CheckItem
                label="H2-H6 Header Tags"
                status={h2Tags.length > 0 ? 'pass' : 'warning'}
                value={`H2: ${h2Tags.length}, H3: ${h3Tags.length}`}
                recommendation={h2Tags.length === 0 ? 'Add H2 subheadings to structure your content' : null}
              />

              <CheckItem
                label="Content Length"
                status={wordCount >= 300 ? 'pass' : 'warning'}
                value={`${wordCount} words`}
                recommendation={
                  wordCount < 300 ? 'Add more content. Aim for at least 300-500 words.' :
                  wordCount < 1000 ? 'Good start! Consider expanding to 1000+ words for competitive keywords.' : null
                }
              />
            </div>
          )}

          {/* ADVANCED SEO */}
          {activeSection === 'advanced' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Code className="w-6 h-6 mr-3 text-indigo-600" />
                Advanced SEO
              </h2>

              <CheckItem
                label="Canonical Tag"
                status={technical.canonical_tag ? 'pass' : 'warning'}
                value={technical.canonical_tag || 'Not found'}
                recommendation={!technical.canonical_tag ? 'Add a canonical tag to avoid duplicate content' : null}
              />

              <CheckItem
                label="Image Alt Attributes"
                status={imagesWithoutAlt === 0 ? 'pass' : imagesWithoutAlt <= 3 ? 'warning' : 'fail'}
                value={`${imagesWithoutAlt} images without alt text (out of ${totalImages})`}
                recommendation={imagesWithoutAlt > 0 ? `Add alt text to ${imagesWithoutAlt} images` : null}
              />

              <CheckItem
                label="Robots.txt"
                status={technical.robots_txt_exists ? 'pass' : 'warning'}
                value={technical.robots_txt_exists ? 'Found' : 'Not found'}
                recommendation={!technical.robots_txt_exists ? 'Create a robots.txt file' : null}
              />

              <CheckItem
                label="SSL/HTTPS"
                status={technical.https ? 'pass' : 'fail'}
                value={technical.https ? '✓ Enabled' : '✗ Not enabled'}
                recommendation={!technical.https ? 'Enable HTTPS for security and better rankings' : null}
              />

              <CheckItem
                label="XML Sitemap"
                status={technical.sitemap_exists ? 'pass' : 'warning'}
                value={technical.sitemap_url || 'Not found'}
                recommendation={!technical.sitemap_exists ? 'Create and submit an XML sitemap' : null}
              />

              <CheckItem
                label="Schema.org Structured Data"
                status={technical.schema_markup ? 'pass' : 'warning'}
                value={technical.schema_types?.join(', ') || 'Not found'}
                recommendation={!technical.schema_markup ? 'Add structured data (Schema.org) markup' : null}
              />

              <CheckItem
                label="Analytics"
                status={technical.has_analytics ? 'pass' : 'warning'}
                value={technical.analytics_found?.join(', ') || 'Not detected'}
                recommendation={!technical.has_analytics ? 'Install Google Analytics or similar' : null}
              />
            </div>
          )}

          {/* KEYWORDS & BACKLINKS */}
          {activeSection === 'keywords' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <LinkIcon className="w-6 h-6 mr-3 text-indigo-600" />
                Keywords & Backlinks
              </h2>

              <div className="border-b py-4">
                <h4 className="font-semibold text-gray-900 mb-3">Primary Keywords</h4>
                {content.keywords?.primary && content.keywords.primary.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {content.keywords.primary.slice(0, 10).map((kw, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                        {kw.keyword} ({kw.count}×)
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No keywords identified</p>
                )}
              </div>

              <CheckItem
                label="Backlinks Summary"
                status={backlinks.total_backlinks > 10 ? 'pass' : 'warning'}
                value={`${backlinks.total_backlinks || 0} backlinks from ${backlinks.unique_domains || 0} domains`}
                recommendation={backlinks.total_backlinks < 10 ? 'Build more quality backlinks' : null}
              />

              <CheckItem
                label="Internal Links"
                status={internal.total_internal_links > 5 ? 'pass' : 'warning'}
                value={`${internal.total_internal_links || 0} internal links found`}
                recommendation={internal.total_internal_links < 5 ? 'Add more internal links to improve site structure' : null}
              />
            </div>
          )}

          {/* PERFORMANCE */}
          {activeSection === 'performance' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Zap className="w-6 h-6 mr-3 text-indigo-600" />
                Performance
              </h2>

              <CheckItem
                label="Mobile Responsive"
                status={technical.viewport_meta ? 'pass' : 'fail'}
                value={technical.viewport_meta ? 'Viewport meta tag found' : 'No viewport meta'}
                recommendation={!technical.viewport_meta ? 'Add viewport meta tag for mobile' : null}
              />

              <CheckItem
                label="Page Load Time"
                status={technical.load_time < 3 ? 'pass' : 'warning'}
                value={`${technical.load_time || 'N/A'}s`}
                recommendation={technical.load_time > 3 ? 'Optimize for faster loading (compress images, minify CSS/JS)' : null}
              />

              <CheckItem
                label="Page Size"
                status={technical.page_size_mb < 3 ? 'pass' : 'warning'}
                value={`${technical.page_size_mb || 'N/A'} MB`}
                recommendation={technical.page_size_mb > 3 ? 'Reduce page size (compress images, remove unused code)' : null}
              />
            </div>
          )}

          {/* LOCAL SEO */}
          {activeSection === 'local' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Globe className="w-6 h-6 mr-3 text-indigo-600" />
                Local SEO
              </h2>

              <CheckItem
                label="Contact Information"
                status={technical.has_contact_info ? 'pass' : 'warning'}
                value={technical.has_contact_info ? 'Found on page' : 'Not found'}
                recommendation={!technical.has_contact_info ? 'Display business address and phone prominently' : null}
              />

              <CheckItem
                label="Local Business Schema"
                status={technical.local_business_schema ? 'pass' : 'warning'}
                value={technical.local_business_schema ? 'Present' : 'Not found'}
                recommendation={!technical.local_business_schema ? 'Add LocalBusiness schema markup' : null}
              />

              <CheckItem
                label="Google Business Profile"
                status="info"
                value="Verify manually"
                recommendation="Claim and optimize your Google Business Profile"
              />
            </div>
          )}

          {/* SOCIAL */}
          {activeSection === 'social' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-indigo-600" />
                Social Media
              </h2>

              <CheckItem
                label="Facebook"
                status={technical.social?.facebook ? 'pass' : 'warning'}
                value={technical.social?.facebook || 'Not linked'}
                recommendation={!technical.social?.facebook ? 'Link your Facebook page' : null}
              />

              <CheckItem
                label="Twitter/X"
                status={technical.social?.twitter ? 'pass' : 'warning'}
                value={technical.social?.twitter || 'Not linked'}
                recommendation={!technical.social?.twitter ? 'Link your Twitter/X account' : null}
              />

              <CheckItem
                label="Instagram"
                status={technical.social?.instagram ? 'pass' : 'warning'}
                value={technical.social?.instagram || 'Not linked'}
                recommendation={!technical.social?.instagram ? 'Link your Instagram profile' : null}
              />

              <CheckItem
                label="LinkedIn"
                status={technical.social?.linkedin ? 'pass' : 'warning'}
                value={technical.social?.linkedin || 'Not linked'}
                recommendation={!technical.social?.linkedin ? 'Link your LinkedIn page' : null}
              />

              <CheckItem
                label="YouTube"
                status={technical.social?.youtube ? 'pass' : 'warning'}
                value={technical.social?.youtube || 'Not linked'}
                recommendation={!technical.social?.youtube ? 'Link your YouTube channel' : null}
              />
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        {report.ai_report?.recommendations && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Recommendations</h2>
            <div className="prose prose-indigo max-w-none">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {report.ai_report.recommendations}
              </div>
            </div>
          </div>
        )}

        {/* 30-Day Action Plan */}
        {report.ai_report?.action_plan && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-8 mt-8 border-2 border-indigo-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 30-Day Action Plan</h2>
            <div className="prose prose-indigo max-w-none">
              <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                {report.ai_report.action_plan}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
