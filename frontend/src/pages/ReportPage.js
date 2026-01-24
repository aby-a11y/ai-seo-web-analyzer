import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, ExternalLink, AlertTriangle, CheckCircle, Info, 
  TrendingUp, Target, Users, FileText, Calendar, Copy, Check,
  Sparkles
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

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Title Tag</p>
              <p className="font-medium text-gray-900">{report.title || 'Not found'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Word Count</p>
              <p className="font-medium text-gray-900">{report.word_count.toLocaleString()} words</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">H1 Tags</p>
              <p className="font-medium text-gray-900">{report.h1_tags.length} found</p>
            </div>
          </div>
        </div>

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