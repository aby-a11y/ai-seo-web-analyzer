import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, CheckCircle, XCircle, AlertTriangle, Info,
  FileText, Code, Link as LinkIcon, Zap, Globe, Users, TrendingUp
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReportPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API}/seo/reports/${reportId}`);
      setReport(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load report:', error);
      setLoading(false);
    }
  };

  const ScoreCircle = ({ score, label }) => {
    const getColor = (score) => {
      if (score >= 80) return 'text-green-600 border-green-600';
      if (score >= 60) return 'text-yellow-600 border-yellow-600';
      return 'text-red-600 border-red-600';
    };

    return (
      <div className="flex flex-col items-center">
        <div className={`w-24 h-24 rounded-full border-8 ${getColor(score)} flex items-center justify-center`}>
          <span className="text-3xl font-bold">{score}</span>
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
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <StatusIcon status={status} />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{label}</h4>
            {value && <p className="text-sm text-gray-600 mt-1">{value}</p>}
            {recommendation && (
              <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-600 rounded-r">
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

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

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Report not found</p>
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

  const data = report.scraped_data || {};
  const onpage = data.on_page_seo || {};
  const technical = data.technical_seo || {};
  const content = data.content_analysis || {};
  const internal = data.internal_linking || {};
  const backlinks = data.backlinks || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sticky Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Score */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Audit Report</h1>
              <p className="text-gray-600">
                <a href={report.url} target="_blank" rel="noopener noreferrer" 
                   className="text-indigo-600 hover:underline">
                  {report.url}
                </a>
              </p>
            </div>
            <ScoreCircle score={report.seo_score || 75} label="Overall Score" />
          </div>

          {/* Quick Summary */}
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
              { id: 'advanced', label: 'Advanced SEO', icon: Code },
              { id: 'keywords', label: 'Keywords & Backlinks', icon: LinkIcon },
              { id: 'performance', label: 'Performance', icon: Zap },
              { id: 'local', label: 'Local SEO', icon: Globe },
              { id: 'social', label: 'Social', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
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

        {/* Content Sections */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          {/* ========== BASIC SEO ========== */}
          {activeSection === 'basic' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-indigo-600" />
                Basic SEO
              </h2>

              {/* Meta Title */}
              <CheckItem
                label="Meta Title"
                status={onpage.title?.length >= 50 && onpage.title?.length <= 60 ? 'pass' : 'warning'}
                value={onpage.title ? `"${onpage.title}" (${onpage.title.length} characters)` : 'Not found'}
                recommendation={
                  !onpage.title ? 'Add a meta title (50-60 characters)' :
                  onpage.title.length < 50 ? 'Title is too short. Aim for 50-60 characters.' :
                  onpage.title.length > 60 ? 'Title is too long. Keep it under 60 characters.' :
                  null
                }
              />

              {/* Meta Description */}
              <CheckItem
                label="Meta Description"
                status={onpage.meta_description?.length >= 150 && onpage.meta_description?.length <= 160 ? 'pass' : 'warning'}
                value={onpage.meta_description ? `"${onpage.meta_description.substring(0, 100)}..." (${onpage.meta_description.length} characters)` : 'Not found'}
                recommendation={
                  !onpage.meta_description ? 'Add a meta description (150-160 characters)' :
                  onpage.meta_description.length < 150 ? 'Description is too short. Aim for 150-160 characters.' :
                  onpage.meta_description.length > 160 ? 'Description is too long. Keep it under 160 characters.' :
                  null
                }
              />

              {/* SERP Preview */}
              <div className="border-b py-4">
                <h4 className="font-semibold text-gray-900 mb-3">SERP Snippet Preview</h4>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {onpage.title || 'Your Page Title Here'}
                  </div>
                  <div className="text-green-700 text-sm mt-1">
                    {report.url}
                  </div>
                  <div className="text-gray-600 text-sm mt-2">
                    {onpage.meta_description || 'Your meta description will appear here...'}
                  </div>
                </div>
              </div>

              {/* H1 Tag */}
              <CheckItem
                label="H1 Header Tag"
                status={onpage.h1_tags?.length === 1 ? 'pass' : onpage.h1_tags?.length > 1 ? 'warning' : 'fail'}
                value={
                  onpage.h1_tags?.length > 0 
                    ? `Found ${onpage.h1_tags.length}: "${onpage.h1_tags.join('", "')}"`
                    : 'No H1 tag found'
                }
                recommendation={
                  onpage.h1_tags?.length === 0 ? 'Add exactly one H1 tag to your page' :
                  onpage.h1_tags?.length > 1 ? 'Use only one H1 tag per page' :
                  null
                }
              />

              {/* H2-H6 Tags */}
              <CheckItem
                label="H2-H6 Header Tags"
                status={onpage.h2_tags?.length > 0 ? 'pass' : 'warning'}
                value={`H2: ${onpage.h2_tags?.length || 0}, H3: ${onpage.h3_tags?.length || 0}, H4: ${onpage.h4_tags?.length || 0}`}
                recommendation={
                  onpage.h2_tags?.length === 0 ? 'Add H2 tags to structure your content better' : null
                }
              />

              {/* Amount of Content */}
              <CheckItem
                label="Amount of Content"
                status={content.word_count >= 300 ? 'pass' : 'warning'}
                value={`${content.word_count || 0} words`}
                recommendation={
                  content.word_count < 300 ? 'Add more content. Aim for at least 300 words for better SEO.' :
                  content.word_count < 1000 ? 'Good content length. Consider expanding to 1000+ words for competitive keywords.' :
                  null
                }
              />
            </div>
          )}

          {/* ========== ADVANCED SEO ========== */}
          {activeSection === 'advanced' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Code className="w-6 h-6 mr-3 text-indigo-600" />
                Advanced SEO
              </h2>

              {/* Canonical Tag */}
              <CheckItem
                label="Canonical Tag"
                status={technical.canonical_tag ? 'pass' : 'warning'}
                value={technical.canonical_tag ? `Present: ${technical.canonical_tag}` : 'Not found'}
                recommendation={!technical.canonical_tag ? 'Add a canonical tag to avoid duplicate content issues' : null}
              />

              {/* Image Alt Attributes */}
              <CheckItem
                label="Image Alt Attributes"
                status={
                  content.images_without_alt === 0 ? 'pass' :
                  content.images_without_alt <= 3 ? 'warning' : 'fail'
                }
                value={`${content.images_without_alt || 0} images without alt text out of ${content.total_images || 0} total`}
                recommendation={
                  content.images_without_alt > 0 
                    ? `Add alt text to ${content.images_without_alt} images for better accessibility and SEO`
                    : null
                }
              />

              {/* Noindex Tag */}
              <CheckItem
                label="Noindex Tag Test"
                status={technical.noindex ? 'fail' : 'pass'}
                value={technical.noindex ? 'Noindex tag found (page will not be indexed)' : 'Not present (good)'}
                recommendation={technical.noindex ? 'Remove noindex tag if you want this page to appear in search results' : null}
              />

              {/* Robots.txt */}
              <CheckItem
                label="Robots.txt"
                status={technical.robots_txt_exists ? 'pass' : 'warning'}
                value={technical.robots_txt_exists ? 'Present and accessible' : 'Not found'}
                recommendation={!technical.robots_txt_exists ? 'Create a robots.txt file to guide search engine crawlers' : null}
              />

              {/* SSL Enabled */}
              <CheckItem
                label="SSL Enabled"
                status={technical.https ? 'pass' : 'fail'}
                value={technical.https ? 'HTTPS enabled ✓' : 'No SSL certificate'}
                recommendation={!technical.https ? 'Enable HTTPS for security and better rankings' : null}
              />

              {/* XML Sitemaps */}
              <CheckItem
                label="XML Sitemaps"
                status={technical.sitemap_exists ? 'pass' : 'warning'}
                value={technical.sitemap_url || 'Not found'}
                recommendation={!technical.sitemap_exists ? 'Create and submit an XML sitemap to help search engines discover your pages' : null}
              />

              {/* Llms.txt */}
              <CheckItem
                label="Llms.txt"
                status={technical.llms_txt ? 'pass' : 'info'}
                value={technical.llms_txt ? 'Present' : 'Not found (optional)'}
                recommendation={!technical.llms_txt ? 'Consider adding llms.txt for AI crawler optimization' : null}
              />

              {/* Analytics */}
              <CheckItem
                label="Analytics"
                status={technical.has_analytics ? 'pass' : 'warning'}
                value={technical.analytics_found?.join(', ') || 'Not detected'}
                recommendation={!technical.has_analytics ? 'Install Google Analytics or similar to track website performance' : null}
              />

              {/* Schema.org Structured Data */}
              <CheckItem
                label="Schema.org Structured Data"
                status={technical.schema_markup ? 'pass' : 'warning'}
                value={technical.schema_types?.join(', ') || 'Not found'}
                recommendation={!technical.schema_markup ? 'Add structured data (Schema.org) to help search engines understand your content' : null}
              />

              {/* Identity Schema */}
              <CheckItem
                label="Identity Schema"
                status={technical.identity_schema ? 'pass' : 'info'}
                value={technical.identity_schema ? 'Organization/Person schema found' : 'Not found'}
                recommendation={!technical.identity_schema ? 'Add Organization or Person schema to establish entity identity' : null}
              />

              {/* Rendered Content */}
              <CheckItem
                label="Rendered Content (LLM Readability)"
                status={content.llm_readable ? 'pass' : 'warning'}
                value={content.llm_readable ? 'Content is easily readable by LLMs' : 'Content may be hard to parse'}
                recommendation={!content.llm_readable ? 'Ensure content is in clean HTML without excessive JavaScript rendering' : null}
              />
            </div>
          )}

          {/* ========== KEYWORDS & BACKLINKS ========== */}
          {activeSection === 'keywords' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <LinkIcon className="w-6 h-6 mr-3 text-indigo-600" />
                Keywords & Backlinks
              </h2>

              {/* Keyword Consistency */}
              <div className="border-b py-4">
                <h4 className="font-semibold text-gray-900 mb-3">Keyword Consistency</h4>
                {content.keywords?.primary && content.keywords.primary.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-2">Primary Keywords:</p>
                    <div className="flex flex-wrap gap-2">
                      {content.keywords.primary.map((kw, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                          {kw.keyword} ({kw.count}x)
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No primary keywords identified</p>
                )}
              </div>

              {/* Backlinks Summary */}
              <CheckItem
                label="Backlinks Summary"
                status={backlinks.total_backlinks > 10 ? 'pass' : 'warning'}
                value={`${backlinks.total_backlinks || 0} total backlinks from ${backlinks.unique_domains || 0} domains`}
                recommendation={
                  backlinks.total_backlinks < 10 
                    ? 'Build more quality backlinks to improve domain authority'
                    : null
                }
              />

              {/* Top Backlinks */}
              <div className="border-b py-4">
                <h4 className="font-semibold text-gray-900 mb-3">Top Backlinks</h4>
                {backlinks.top_backlinks?.length > 0 ? (
                  <div className="space-y-2">
                    {backlinks.top_backlinks.slice(0, 5).map((link, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                        <LinkIcon className="w-4 h-4 text-gray-400" />
                        <a href={link.url} target="_blank" rel="noopener noreferrer" 
                           className="text-indigo-600 hover:underline text-sm flex-1">
                          {link.domain || link.url}
                        </a>
                        <span className="text-xs text-gray-500">DA: {link.authority || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No backlink data available</p>
                )}
              </div>

              {/* Top Pages by Backlinks */}
              <div className="border-b py-4">
                <h4 className="font-semibold text-gray-900 mb-3">Top Pages by Backlinks</h4>
                {internal.top_linked_pages?.length > 0 ? (
                  <div className="space-y-2">
                    {internal.top_linked_pages.slice(0, 5).map((page, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-900">{page.url}</p>
                        <p className="text-xs text-gray-600">{page.links} backlinks</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No internal linking data available</p>
                )}
              </div>

              {/* Top Anchors */}
              <div className="border-b py-4">
                <h4 className="font-semibold text-gray-900 mb-3">Top Anchors by Backlinks</h4>
                {backlinks.top_anchors?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {backlinks.top_anchors.map((anchor, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {anchor.text} ({anchor.count})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No anchor data available</p>
                )}
              </div>

              {/* Top Referring Domains */}
              <div className="border-b py-4">
                <h4 className="font-semibold text-gray-900 mb-3">Top Referring Domain Geographies</h4>
                {backlinks.top_countries?.length > 0 ? (
                  <div className="space-y-2">
                    {backlinks.top_countries.map((country, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium">{country.name}</span>
                        <span className="text-gray-600">{country.count} domains</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Geographic data not available</p>
                )}
              </div>
            </div>
          )}

          {/* ========== PERFORMANCE ========== */}
          {activeSection === 'performance' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Zap className="w-6 h-6 mr-3 text-indigo-600" />
                Performance
              </h2>

              {/* Responsive */}
              <CheckItem
                label="Responsive Design"
                status={technical.viewport_meta ? 'pass' : 'fail'}
                value={technical.viewport_meta ? 'Mobile-friendly viewport detected' : 'No viewport meta tag'}
                recommendation={!technical.viewport_meta ? 'Add viewport meta tag for mobile responsiveness' : null}
              />

              {/* Website Speed */}
              <CheckItem
                label="Website Speed (Desktop)"
                status="info"
                value="Use PageSpeed Insights for detailed metrics"
                recommendation="Test at: https://pagespeed.web.dev/"
              />

              <CheckItem
                label="Website Speed (Mobile)"
                status="info"
                value="Use PageSpeed Insights for detailed metrics"
                recommendation="Test at: https://pagespeed.web.dev/"
              />

              {/* Load Speed */}
              <CheckItem
                label="Website Load Speed"
                status={technical.load_time < 3 ? 'pass' : 'warning'}
                value={`${technical.load_time || 'N/A'}s`}
                recommendation={
                  technical.load_time > 3 
                    ? 'Optimize images, minify CSS/JS, and enable caching to improve load time'
                    : null
                }
              />

              {/* Download Size */}
              <CheckItem
                label="Website Download Size"
                status={technical.page_size_mb < 3 ? 'pass' : 'warning'}
                value={`${technical.page_size_mb || 'N/A'} MB`}
                recommendation={
                  technical.page_size_mb > 3 
                    ? 'Compress images and minimize file sizes to reduce page weight'
                    : null
                }
              />

              {/* AMP */}
              <CheckItem
                label="AMP (Accelerated Mobile Pages)"
                status={technical.amp_enabled ? 'pass' : 'info'}
                value={technical.amp_enabled ? 'AMP version detected' : 'Not implemented (optional)'}
                recommendation={!technical.amp_enabled ? 'Consider implementing AMP for faster mobile experience' : null}
              />
            </div>
          )}

          {/* ========== LOCAL SEO ========== */}
          {activeSection === 'local' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Globe className="w-6 h-6 mr-3 text-indigo-600" />
                Local SEO
              </h2>

              {/* Address & Phone */}
              <CheckItem
                label="Address & Phone Shown on Website"
                status={technical.has_contact_info ? 'pass' : 'warning'}
                value={technical.has_contact_info ? 'Contact information found' : 'Not detected'}
                recommendation={!technical.has_contact_info ? 'Display your business address and phone number prominently' : null}
              />

              {/* Local Business Schema */}
              <CheckItem
                label="Local Business Schema"
                status={technical.local_business_schema ? 'pass' : 'warning'}
                value={technical.local_business_schema ? 'LocalBusiness schema detected' : 'Not found'}
                recommendation={!technical.local_business_schema ? 'Add LocalBusiness schema markup for better local SEO' : null}
              />

              {/* Google Business Profile */}
              <CheckItem
                label="Google Business Profile Identified"
                status={technical.google_business_verified ? 'pass' : 'info'}
                value={technical.google_business_verified ? 'Profile verified' : 'Not verified'}
                recommendation="Claim and optimize your Google Business Profile for local visibility"
              />
            </div>
          )}

          {/* ========== SOCIAL ========== */}
          {activeSection === 'social' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-indigo-600" />
                Social Media
              </h2>

              {/* Facebook */}
              <CheckItem
                label="Facebook Page Linked"
                status={technical.social?.facebook ? 'pass' : 'warning'}
                value={technical.social?.facebook || 'Not found'}
                recommendation={!technical.social?.facebook ? 'Link your Facebook page for better social presence' : null}
              />

              <CheckItem
                label="Facebook Pixel"
                status={technical.facebook_pixel ? 'pass' : 'info'}
                value={technical.facebook_pixel ? 'Installed' : 'Not detected'}
                recommendation={!technical.facebook_pixel ? 'Install Facebook Pixel to track conversions and optimize ads' : null}
              />

              {/* Twitter/X */}
              <CheckItem
                label="X (formerly Twitter) Account Linked"
                status={technical.social?.twitter ? 'pass' : 'warning'}
                value={technical.social?.twitter || 'Not found'}
                recommendation={!technical.social?.twitter ? 'Link your X/Twitter account' : null}
              />

              {/* Instagram */}
              <CheckItem
                label="Instagram Linked"
                status={technical.social?.instagram ? 'pass' : 'warning'}
                value={technical.social?.instagram || 'Not found'}
                recommendation={!technical.social?.instagram ? 'Link your Instagram profile' : null}
              />

              {/* LinkedIn */}
              <CheckItem
                label="LinkedIn Page Linked"
                status={technical.social?.linkedin ? 'pass' : 'warning'}
                value={technical.social?.linkedin || 'Not found'}
                recommendation={!technical.social?.linkedin ? 'Link your LinkedIn company page' : null}
              />

              {/* YouTube */}
              <CheckItem
                label="YouTube Channel Linked"
                status={technical.social?.youtube ? 'pass' : 'warning'}
                value={technical.social?.youtube || 'Not found'}
                recommendation={!technical.social?.youtube ? 'Link your YouTube channel if you create video content' : null}
              />

              <CheckItem
                label="YouTube Channel Activity"
                status={technical.youtube_active ? 'pass' : 'info'}
                value={technical.youtube_active ? 'Active channel detected' : 'No recent activity'}
                recommendation={!technical.youtube_active ? 'Post regular video content to boost engagement' : null}
              />
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        {report.ai_report?.recommendations && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-indigo-600" />
              AI-Powered Recommendations
            </h2>
            <div className="prose max-w-none">
              <div className="whitespace-pre-line text-gray-700">
                {report.ai_report.recommendations}
              </div>
            </div>
          </div>
        )}

        {/* 30-Day Action Plan */}
        {report.ai_report?.action_plan && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">30-Day Action Plan</h2>
            <div className="prose max-w-none">
              <div className="whitespace-pre-line text-gray-700">
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
