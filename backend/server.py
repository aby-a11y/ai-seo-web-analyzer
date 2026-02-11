from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, HttpUrl
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import httpx
from bs4 import BeautifulSoup
from openai import AsyncOpenAI
import json
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


class SEOIssue(BaseModel):
    priority: str  # High, Medium, Low
    category: str
    issue: str
    recommendation: str


class KeywordStrategy(BaseModel):
    primary_keyword: str
    long_tail_keywords: List[str]
    keyword_intent: Dict[str, str]  # keyword -> intent type


class ContentRecommendation(BaseModel):
    page_type: str
    topic: str
    target_keywords: List[str]
    structure: Dict[str, List[str]]  # heading_level -> list of suggested headings


class SEOReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    analyzed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Website Overview
    title: Optional[str] = None
    meta_description: Optional[str] = None
    h1_tags: List[str] = []
    h2_tags: List[str] = []
    h3_tags: List[str] = []
    h4_tags: List[str] = []
    h5_tags: List[str] = []
    h6_tags: List[str] = []
    
    word_count: int = 0
    total_images: int = 0
    images_without_alt: int = 0
    canonical_url: Optional[str] = None
    canonical_issues: List[str] = []
    robots_txt_found: bool = False
    sitemap_found: bool = False
    ssl_enabled: bool = False
    
    # Complete analysis data
    technical_seo: Dict[str, Any] = {}
    schema_analysis: Dict[str, Any] = {}
    linking_analysis: Dict[str, Any] = {}
    backlink_analysis: Dict[str, Any] = {}
    # Analysis Results
    seo_issues: List[SEOIssue] = []
    keyword_strategy: Optional[KeywordStrategy] = None
    competitor_analysis: Dict[str, Any] = {}
    content_recommendations: List[ContentRecommendation] = []
    action_plan_30_days: List[Dict[str, str]] = []
    
    # Overall Score
    seo_score: Optional[int] = None
    analysis_summary: Optional[str] = None


class SEOAnalysisRequest(BaseModel):
    url: HttpUrl


class SEOReportResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    url: str
    analyzed_at: datetime
    title: Optional[str] = None
    meta_description: Optional[str] = None
    h1_tags: List[str] = []
    h2_tags: List[str] = []
    word_count: int = 0
    total_images: int = 0
    images_without_alt: int = 0
    canonical_url: Optional[str] = None
    canonical_issues: List[str] = []
    robots_txt_found: bool = False
    sitemap_found: bool = False
    ssl_enabled: bool = False
    
    technical_seo: Dict[str, Any] = {}
    schema_analysis: Dict[str, Any] = {}
    linking_analysis: Dict[str, Any] = {}
    backlink_analysis: Dict[str, Any] = {}
    
    seo_issues: List[SEOIssue] = []
    keyword_strategy: Optional[KeywordStrategy] = None
    competitor_analysis: Dict[str, Any] = {}
    content_recommendations: List[ContentRecommendation] = []
    action_plan_30_days: List[Dict[str, str]] = []
    seo_score: Optional[int] = None
    analysis_summary: Optional[str] = None


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ========== Helper functions ==========
def check_technical_seo(soup, final_url):
    """Enhanced Technical SEO checks with detailed canonical analysis"""
    from urllib.parse import urlparse, urljoin
    
    parsed = urlparse(final_url)
    root = f"{parsed.scheme}://{parsed.netloc}"
    
    # ========== CANONICAL TAG ANALYSIS (ENHANCED) ==========
    canonical_tags = soup.find_all("link", rel=lambda v: v and "canonical" in str(v).lower())
    
    canonical_issues = []
    canonical_status = "Not Set"
    canonical_url = None
    
    if len(canonical_tags) == 0:
        canonical_issues.append("⚠️ No canonical tag found - Add self-referencing canonical")
        canonical_status = "Missing"
    elif len(canonical_tags) > 1:
        canonical_issues.append(f"❌ Multiple canonical tags found ({len(canonical_tags)}) - Remove duplicates")
        canonical_status = "Error"
        canonical_url = canonical_tags[0].get("href")
    else:
        canonical_tag = canonical_tags[0]
        canonical_url = canonical_tag.get("href", "").strip()
        
        if not canonical_url:
            canonical_issues.append("❌ Empty canonical tag - Add valid URL")
            canonical_status = "Empty"
        else:
            # Parse canonical URL
            canonical_parsed = urlparse(canonical_url)
            
            # Check 1: Relative vs Absolute URL
            if not canonical_parsed.scheme:
                canonical_issues.append("⚠️ Relative canonical URL - Use absolute URL with https://")
                canonical_url = urljoin(root, canonical_url)
            
            # Check 2: Self-referencing validation
            current_clean = final_url.rstrip('/').lower()
            canonical_clean = canonical_url.rstrip('/').lower()
            
            if current_clean != canonical_clean:
                canonical_issues.append(f"⚠️ Non-self-referencing canonical: {canonical_url}")
                canonical_status = "Different URL"
            else:
                canonical_status = "✅ Valid (Self-referencing)"
            
            # Check 3: HTTP vs HTTPS mismatch
            if canonical_parsed.scheme == "http" and parsed.scheme == "https":
                canonical_issues.append("❌ HTTPS page has HTTP canonical - Update to HTTPS")
                canonical_status = "Protocol Mismatch"
            
            # Check 4: Cross-domain canonical
            if canonical_parsed.netloc and canonical_parsed.netloc != parsed.netloc:
                canonical_issues.append(f"⚠️ Cross-domain canonical: {canonical_parsed.netloc}")
                canonical_status = "Cross-domain"
    
    # ========== ROBOTS.TXT & SITEMAP ==========
    robots_url = urljoin(root, "/robots.txt")
    robots_exists = False
    robots_content = None
    try:
        import httpx
        with httpx.Client(timeout=10) as client:
            robots_resp = client.get(robots_url)
            robots_exists = robots_resp.status_code == 200
            if robots_exists:
                robots_content = robots_resp.text[:500]  # First 500 chars
    except:
        robots_exists = False
    
    sitemap_url = urljoin(root, "/sitemap.xml")
    sitemap_exists = False
    try:
        import httpx
        with httpx.Client(timeout=10) as client:
            sitemap_exists = client.get(sitemap_url).status_code == 200
    except:
        sitemap_exists = False
    
    # ========== META ROBOTS / NOINDEX ==========
    noindex_meta = soup.find("meta", attrs={"name": "robots"})
    noindex = False
    robots_directive = "Not Set"
    if noindex_meta:
        content = (noindex_meta.get("content") or "").lower()
        robots_directive = content
        noindex = "noindex" in content
    
    # ========== SSL CHECK ==========
    ssl_enabled = final_url.startswith("https://")
    
    return {
        # Canonical Analysis
        "canonical_status": canonical_status,
        "canonical_url": canonical_url,
        "canonical_issues": canonical_issues,
        "canonical_count": len(canonical_tags),
        
        # Technical Checks
        "robots_txt_found": robots_exists,
        "robots_txt_url": robots_url,
        "robots_txt_preview": robots_content,
        "sitemap_found": sitemap_exists,
        "sitemap_url": sitemap_url,
        "noindex": noindex,
        "robots_directive": robots_directive,
        "ssl_enabled": ssl_enabled,
    }



def check_onpage_seo(soup):
    """On-page checks: title, meta, headings, images, word count"""
    # Title
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    title_len = len(title)
    title_status = "Optimal" if 50 <= title_len <= 60 else ("Too Long" if title_len > 60 else "Too Short")
    
    # Meta description
    meta_desc_tag = soup.find("meta", attrs={"name": "description"})
    meta_desc = meta_desc_tag.get("content", "").strip() if meta_desc_tag else ""
    meta_len = len(meta_desc)
    meta_status = "Optimal" if 120 <= meta_len <= 160 else ("Too Long" if meta_len > 160 else "Too Short")
    
    # Headings
    h1_count = len(soup.find_all("h1"))
    h2_count = len(soup.find_all("h2"))
    h3_count = len(soup.find_all("h3"))
    h4_count = len(soup.find_all("h4"))
    h5_count = len(soup.find_all("h5"))
    h6_count = len(soup.find_all("h6"))
    
    
    # Images + Alt
    images = soup.find_all("img")
    total_imgs = len(images)
    imgs_without_alt = sum(1 for img in images if not img.get("alt"))
    
    # Word count
    text_soup = BeautifulSoup(str(soup), "html.parser")
    for script in text_soup(["script", "style", "noscript"]):
        script.decompose()
    text = text_soup.get_text(separator=" ")
    words = [w for w in text.split() if w.strip()]
    word_count = len(words)
    
    return {
        "title": title,
        "title_length": title_len,
        "title_status": title_status,
        "meta_description": meta_desc,
        "meta_length": meta_len,
        "meta_status": meta_status,
        "h1_count": h1_count,
        "h2_count": h2_count,
        "h3_count": h3_count,
        "total_images": total_imgs,
        "images_without_alt": imgs_without_alt,
        "word_count": word_count,
    }


def check_performance(response_obj):
    """Performance: page size, resource counts"""
    size_bytes = len(response_obj.content)
    size_mb = round(size_bytes / (1024 * 1024), 2)
    
    soup = BeautifulSoup(response_obj.text, "html.parser")
    scripts = soup.find_all("script", src=True)
    links_css = soup.find_all("link", rel=lambda v: v and "stylesheet" in v.lower())
    imgs = soup.find_all("img")
    
    return {
        "page_size_mb": size_mb,
        "page_size_status": "Good" if size_mb < 5 else "Large",
        "total_resources": 1 + len(scripts) + len(links_css) + len(imgs),
        "js_count": len(scripts),
        "css_count": len(links_css),
        "image_count": len(imgs),
    }

def validate_schema_markup(soup, url):
    """Validate and analyze structured data (JSON-LD, Microdata, RDFa)"""
    
    schema_data = {
        "has_schema": False,
        "schema_types": [],
        "schema_count": 0,
        "validation_issues": [],
        "recommendations": [],
        "json_ld_scripts": []
    }
    
    # ========== JSON-LD Detection ==========
    json_ld_scripts = soup.find_all('script', type='application/ld+json')
    
    if json_ld_scripts:
        schema_data["has_schema"] = True
        schema_data["schema_count"] = len(json_ld_scripts)
        
        for idx, script in enumerate(json_ld_scripts):
            try:
                # Parse JSON-LD
                json_content = json.loads(script.string)
                
                # Extract @type
                schema_type = None
                if isinstance(json_content, dict):
                    schema_type = json_content.get('@type')
                    if isinstance(schema_type, list):
                        schema_data["schema_types"].extend(schema_type)
                    elif schema_type:
                        schema_data["schema_types"].append(schema_type)
                
                # Store parsed data
                schema_data["json_ld_scripts"].append({
                    "index": idx + 1,
                    "type": schema_type or "Unknown",
                    "valid": True,
                    "data": json_content
                })
                
            except json.JSONDecodeError as e:
                schema_data["validation_issues"].append(
                    f"❌ JSON-LD #{idx + 1}: Invalid JSON syntax - {str(e)}"
                )
                schema_data["json_ld_scripts"].append({
                    "index": idx + 1,
                    "valid": False,
                    "error": str(e)
                })
    
    # ========== MICRODATA Detection ==========
    microdata_items = soup.find_all(attrs={"itemtype": True})
    if microdata_items:
        schema_data["has_schema"] = True
        schema_data["schema_count"] += len(microdata_items)
        for item in microdata_items:
            item_type = item.get('itemtype', '').split('/')[-1]
            if item_type:
                schema_data["schema_types"].append(f"{item_type} (Microdata)")
    
    # ========== Validation & Recommendations ==========
    if not schema_data["has_schema"]:
        schema_data["recommendations"].append(
            "⚠️ No structured data found - Add Schema.org markup for better search visibility"
        )
    
    # Check for common schema types based on page content
    page_text = soup.get_text().lower()
    
    if not schema_data["schema_types"]:
        # Suggest schema based on content
        if any(word in page_text for word in ['product', 'price', 'buy', 'shop']):
            schema_data["recommendations"].append("💡 Consider adding Product schema")
        
        if any(word in page_text for word in ['article', 'blog', 'posted', 'author']):
            schema_data["recommendations"].append("💡 Consider adding Article schema")
        
        if any(word in page_text for word in ['review', 'rating', 'stars']):
            schema_data["recommendations"].append("💡 Consider adding Review schema")
        
        if any(word in page_text for word in ['event', 'date', 'location', 'venue']):
            schema_data["recommendations"].append("💡 Consider adding Event schema")
    
    # Remove duplicates from types
    schema_data["schema_types"] = list(set(schema_data["schema_types"]))
    
    return schema_data


def analyze_internal_links(soup, base_url):
    """Analyze internal linking structure"""
    ...

    from urllib.parse import urlparse, urljoin
    
    parsed_base = urlparse(base_url)
    base_domain = parsed_base.netloc
    
    internal_links = []
    external_links = []
    broken_links = []
    
    all_links = soup.find_all('a', href=True)
    
    for link in all_links:
        href = link.get('href', '').strip()
        
        if not href or href.startswith('#') or href.startswith('javascript:') or href.startswith('mailto:'):
            continue
        
        # Convert to absolute URL
        absolute_url = urljoin(base_url, href)
        parsed_link = urlparse(absolute_url)
        
        link_info = {
            "url": absolute_url,
            "anchor_text": link.get_text().strip()[:100],  # First 100 chars
            "has_nofollow": 'nofollow' in link.get('rel', []),
            "opens_new_tab": link.get('target') == '_blank'
        }
        
        # Classify as internal or external
        if parsed_link.netloc == base_domain or parsed_link.netloc == '':
            internal_links.append(link_info)
        else:
            external_links.append(link_info)
    
    # Calculate statistics
    total_links = len(all_links)
    internal_count = len(internal_links)
    external_count = len(external_links)
    
    internal_ratio = round((internal_count / total_links * 100), 2) if total_links > 0 else 0
    
    # Recommendations
    recommendations = []
    
    if internal_count < 3:
        recommendations.append("⚠️ Very few internal links - Add more internal linking for better SEO")
    
    if internal_ratio < 70:
        recommendations.append(f"⚠️ Internal link ratio is {internal_ratio}% - Aim for 70-80% internal links")
    
    nofollow_count = sum(1 for link in internal_links if link['has_nofollow'])
    if nofollow_count > 0:
        recommendations.append(f"⚠️ {nofollow_count} internal links have nofollow - Remove nofollow from internal links")
    
    # Check for anchor text quality
    empty_anchors = sum(1 for link in internal_links if not link['anchor_text'])
    if empty_anchors > 0:
        recommendations.append(f"❌ {empty_anchors} links have empty anchor text - Add descriptive anchor text")
    
    return {
        "total_links": total_links,
        "internal_count": internal_count,
        "external_count": external_count,
        "internal_ratio": internal_ratio,
        "internal_links": internal_links[:20],  # First 20 for response size
        "external_links": external_links[:10],  # First 10
        "nofollow_internal_count": nofollow_count,
        "empty_anchor_count": empty_anchors,
        "recommendations": recommendations
    }
    # ========== NEW: BACKLINK ANALYZER ==========
async def analyze_backlinks(url: str, soup: BeautifulSoup) -> Dict[str, Any]:
    """Analyze backlinks, external links, and referrer potential"""
    from urllib.parse import urlparse, urljoin
    
    parsed_url = urlparse(url)
    base_domain = parsed_url.netloc
    
    backlink_data = {
        "total_external_links": 0,
        "dofollow_count": 0,
        "nofollow_count": 0,
        "unique_domains": 0,
        "top_linked_domains": [],
        "link_quality_score": 0,
        "recommendations": [],
        "external_link_details": []
    }
    
    all_links = soup.find_all('a', href=True)
    external_links = []
    domain_count = {}
    
    for link in all_links:
        href = link.get('href', '').strip()
        
        if not href or href.startswith('#') or href.startswith('javascript:') or href.startswith('mailto:'):
            continue
        
        absolute_url = urljoin(url, href)
        parsed_link = urlparse(absolute_url)
        
        # Only external links
        if parsed_link.netloc and parsed_link.netloc != base_domain:
            is_nofollow = 'nofollow' in link.get('rel', [])
            
            link_info = {
                "url": absolute_url,
                "domain": parsed_link.netloc,
                "anchor_text": link.get_text().strip()[:100],
                "is_dofollow": not is_nofollow,
                "is_nofollow": is_nofollow,
                "opens_new_tab": link.get('target') == '_blank'
            }
            
            external_links.append(link_info)
            domain = parsed_link.netloc
            domain_count[domain] = domain_count.get(domain, 0) + 1
    
    # Calculate statistics
    backlink_data["total_external_links"] = len(external_links)
    backlink_data["dofollow_count"] = sum(1 for link in external_links if link['is_dofollow'])
    backlink_data["nofollow_count"] = sum(1 for link in external_links if link['is_nofollow'])
    backlink_data["unique_domains"] = len(domain_count)
    
    # Top linked domains
    sorted_domains = sorted(domain_count.items(), key=lambda x: x[1], reverse=True)
    backlink_data["top_linked_domains"] = [
        {"domain": domain, "link_count": count, "estimated_authority": estimate_domain_authority(domain)}
        for domain, count in sorted_domains[:10]
    ]
    
    backlink_data["external_link_details"] = external_links[:20]
    
    # Calculate link quality score (0-100)
    quality_score = 0
    if backlink_data["total_external_links"] > 0:
        dofollow_ratio = backlink_data["dofollow_count"] / backlink_data["total_external_links"]
        quality_score += dofollow_ratio * 40
    
    if backlink_data["unique_domains"] >= 5:
        quality_score += 30
    elif backlink_data["unique_domains"] >= 3:
        quality_score += 20
    
    high_authority = ['wikipedia.org', 'github.com', 'stackoverflow.com', 'medium.com', 'linkedin.com']
    authority_links = sum(1 for link in external_links if any(auth in link['domain'] for auth in high_authority))
    quality_score += min(authority_links * 5, 30)
    
    backlink_data["link_quality_score"] = min(round(quality_score), 100)
    
    # Recommendations
    if backlink_data["total_external_links"] == 0:
        backlink_data["recommendations"].append("⚠️ No external links - Add 3-5 quality outbound links")
    
    if backlink_data["unique_domains"] < 3:
        backlink_data["recommendations"].append("💡 Link to more diverse sources (5-10 domains)")
    
    if backlink_data["link_quality_score"] < 50:
        backlink_data["recommendations"].append("📈 Add more dofollow links to high-authority domains")
    
    backlink_data["recommendations"].append("💡 Reach out to linked domains for reciprocal backlinks")
    
    return backlink_data


def estimate_domain_authority(domain: str) -> str:
    """Estimate domain authority"""
    high_authority = [
        'wikipedia.org', 'github.com', 'stackoverflow.com', 'medium.com', 
        'linkedin.com', 'forbes.com', 'nytimes.com'
    ]
    
    if any(auth in domain.lower() for auth in high_authority):
        return "High (DA 80-100)"
    
    if domain.endswith('.edu') or domain.endswith('.gov') or domain.endswith('.org'):
        return "Medium-High (DA 60-80)"
    
    if domain.endswith('.com') or domain.endswith('.net'):
        return "Medium (DA 40-60)"
    
    return "Unknown"


# Web Scraping Function
async def scrape_website(url: str) -> Dict[str, Any]:
    """Scrape website and extract SEO-relevant data"""
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            response = await client.get(str(url), headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            response.raise_for_status()
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # ✅ FIX: Convert response.url to string
        final_url = str(response.url)
        
        technical_seo = check_technical_seo(soup, final_url)
        onpage_seo = check_onpage_seo(soup)
        performance = check_performance(response)
        schema_analysis = validate_schema_markup(soup, str(url))
        linking_analysis = analyze_internal_links(soup, str(url))
        backlink_analysis = await analyze_backlinks(str(url), soup)  # NEW!

        # Extract title
        title = soup.find('title')
        title_text = title.get_text().strip() if title else None
        
        # ... rest of the code

        
        # Extract meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        meta_description = meta_desc.get('content', '').strip() if meta_desc else None
        
        # Extract headings
        h1_tags = [h1.get_text().strip() for h1 in soup.find_all('h1')]
        h2_tags = [h2.get_text().strip() for h2 in soup.find_all('h2')]
        h3_tags = [h3.get_text().strip() for h3 in soup.find_all('h3')]
        
        # Extract images and count missing alt attributes
        images = soup.find_all('img')
        total_images = len(images)
        images_without_alt = len([img for img in images if not img.get('alt') or not img.get('alt').strip()])
        
        # Extract all text content for word count
        text_content = soup.get_text()
        words = re.findall(r'\w+', text_content)
        word_count = len(words)
        
        # Extract meta keywords if present
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        keywords = meta_keywords.get('content', '') if meta_keywords else ''
        
        # Check for Open Graph tags
        og_title = soup.find('meta', property='og:title')
        og_description = soup.find('meta', property='og:description')
        
        # Check for canonical URL
        canonical = soup.find('link', rel='canonical')
        canonical_url = canonical.get('href') if canonical else None
        
        # Extract structured data (JSON-LD)
        structured_data = []
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                structured_data.append(json.loads(script.string))
            except:
                pass
        
        return {
            'title': title_text,
            'meta_description': meta_description,
            'h1_tags': h1_tags,
            'h2_tags': h2_tags,
            'h3_tags': h3_tags,
            'word_count': word_count,
            'total_images': total_images,
            'images_without_alt': images_without_alt,
            'meta_keywords': keywords,
            'og_title': og_title.get('content') if og_title else None,
            'og_description': og_description.get('content') if og_description else None,
            'canonical_url': canonical_url,
            'has_structured_data': len(structured_data) > 0,
            'full_html': response.text[:10000],  # First 10k chars for AI analysis
            'status_code': response.status_code,
            'technical_seo': technical_seo,  # Complete technical SEO object
            'canonical_issues': technical_seo['canonical_issues'],
            'robots_txt_found': technical_seo['robots_txt_found'],
            'sitemap_found': technical_seo['sitemap_found'],
            'schema_analysis': schema_analysis,
            'has_schema': schema_analysis['has_schema'],
            'schema_types': schema_analysis['schema_types'],
            'linking_analysis': linking_analysis,
            'total_links': linking_analysis['total_links'],
            'internal_links_count': linking_analysis['internal_count'],
             'backlink_analysis': backlink_analysis, 
             'external_links_count': backlink_analysis['total_external_links'],
             'link_quality_score': backlink_analysis['link_quality_score'],
        }
        
    except Exception as e:
        logger.error(f"Error scraping website {url}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to scrape website: {str(e)}")


# AI SEO Analysis Function
async def analyze_with_ai(url: str, scraped_data: Dict[str, Any]) -> SEOReport:
    """Use OpenAI to analyze scraped data and generate comprehensive SEO report"""
    
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")
    
    # Calculate exact character counts
    title_length = len(scraped_data.get('title', '')) if scraped_data.get('title') else 0
    meta_length = len(scraped_data.get('meta_description', '')) if scraped_data.get('meta_description') else 0
    
    # Extract nested data safely
    technical_seo = scraped_data.get('technical_seo', {})
    schema_analysis = scraped_data.get('schema_analysis', {})
    linking_analysis = scraped_data.get('linking_analysis', {})
    backlink_analysis = scraped_data.get('backlink_analysis', {})
    
    # Create enhanced analysis prompt with ALL metrics
    analysis_prompt = f"""You are a senior SEO consultant analyzing a website. Provide a comprehensive, data-driven SEO audit with SPECIFIC METRICS and ACTIONABLE recommendations.

Website URL: {url}

Current Website Metrics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TITLE TAG Priority:
- ✅ LOW/Success: 50-60 characters (OPTIMAL - no issue needed)
- ⚠️ MEDIUM: 45-49 or 61-70 characters (needs minor optimization)
- 🔴 HIGH: <45 or >70 characters (critical issue)

📝 META DESCRIPTION Priority:
- ✅ LOW/Success: 150-160 characters (OPTIMAL - no issue needed)
- ⚠️ MEDIUM: 120-149 or 161-180 characters (acceptable but can improve)
- 🔴 HIGH: <120 or >180 characters (critical issue)

🏷️ HEADINGS Priority:
- ✅ LOW: Exactly 1 H1 + 3-6 H2s (OPTIMAL)
- ⚠️ MEDIUM: 1 H1 but <3 or >6 H2s (needs structure improvement)
- 🔴 HIGH: 0 H1s, Multiple H1s (>1), or zero H2s (critical)

📄 CONTENT Priority:
- ✅ LOW: 1000-2500 words (OPTIMAL for most pages)
- ⚠️ MEDIUM: 500-999 or 2501-3000 words (acceptable)
- 🔴 HIGH: <300 words (thin content - critical issue)

🖼️ IMAGES Priority:
- ✅ LOW/Success: 0 missing alt texts (OPTIMAL)
- ⚠️ MEDIUM: 1-3 missing alt texts (needs attention)
- 🔴 HIGH: >3 missing alt texts or >50% without alt (critical accessibility issue)

🔧 TECHNICAL SEO (ENHANCED!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 Canonical Tag Analysis:
- Status: {technical_seo.get('canonical_status', 'Not Checked')}
- URL: {technical_seo.get('canonical_url', 'Not set')}
- Issues Found: {len(technical_seo.get('canonical_issues', []))} issues
- Details: {'; '.join(technical_seo.get('canonical_issues', [])) or 'No issues'}

🤖 Crawlability:
- Robots.txt: {'✓ Found' if technical_seo.get('robots_txt_found') else '✗ Missing'}
- Sitemap.xml: {'✓ Found' if technical_seo.get('sitemap_found') else '✗ Missing'}
- Meta Robots: {technical_seo.get('robots_directive', 'Not set')}
- Noindex Status: {'⚠️ YES (Page is noindexed!)' if technical_seo.get('noindex') else '✓ No'}

🔒 Security:
- SSL/HTTPS: {'✓ Enabled' if technical_seo.get('ssl_enabled') else '❌ DISABLED (Critical!)'}

📋 STRUCTURED DATA (NEW!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Schema Markup Present: {'✓ YES' if schema_analysis.get('has_schema') else '✗ NO'}
- Schema Types Found: {', '.join(schema_analysis.get('schema_types', [])) or 'None'}
- Total Schema Items: {schema_analysis.get('schema_count', 0)}
- Validation Issues: {len(schema_analysis.get('validation_issues', []))} errors
- Error Details: {'; '.join(schema_analysis.get('validation_issues', [])) or 'No errors'}
- Recommendations: {'; '.join(schema_analysis.get('recommendations', [])) or 'None'}

🔗 INTERNAL LINKING (NEW!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Total Links: {linking_analysis.get('total_links', 0)}
- Internal Links: {linking_analysis.get('internal_count', 0)}
- External Links: {linking_analysis.get('external_count', 0)}
- Internal Link Ratio: {linking_analysis.get('internal_ratio', 0)}% (Target: 70-80%)
- Nofollow Internal Links: {linking_analysis.get('nofollow_internal_count', 0)} (Should be 0)
- Empty Anchor Text: {linking_analysis.get('empty_anchor_count', 0)} links (Should be 0)
- Issues: {'; '.join(linking_analysis.get('recommendations', [])) or 'No issues'}

📱 SOCIAL & RICH SNIPPETS
- Open Graph Tags: {'✓ Present' if scraped_data.get('og_title') else '✗ Missing'}
- OG Title: {scraped_data.get('og_title', 'Not set')}
- OG Description: {scraped_data.get('og_description', 'Not set')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL INSTRUCTIONS:
You MUST provide DETAILED, SPECIFIC recommendations following this format.

For each recommendation, include:
1. ❌ Current State: [exact current value with numbers]
2. ✅ Target State: [specific target with numbers]
3. 📋 Example: '[ready-to-use example that can be directly implemented]'
4. 📈 Impact: [measurable expected improvement like "+15-20% CTR" or "+50 monthly visitors"]

Pay special attention to:
- Canonical tag issues (if any are present)
- Missing or invalid structured data
- Internal linking problems (low ratio, nofollow on internal links, empty anchors)
- SSL/HTTPS issues (critical for rankings)
- Noindex pages (critical - page won't be indexed!)

Provide analysis in this EXACT JSON format:

{{
  "seo_score": <number 0-100>,
  "analysis_summary": "<2-3 sentence executive summary mentioning 2-3 key metrics that need immediate attention>",
  "seo_issues": [
    {{
      "priority": "High|Medium|Low",
      "category": "Title Tag|Meta Description|Content|Images|Technical SEO|Structured Data|Internal Linking|Canonical|Security",
      "issue": "<specific issue with current metric>",
      "recommendation": "CURRENT: [exact current state with numbers]\\\\nTARGET: [specific target with numbers]\\\\nEXAMPLE: '[ready-to-use optimized text]'\\\\nIMPACT: [measurable improvement estimate]"
    }}
  ],
  "keyword_strategy": {{
    "primary_keyword": "<best primary keyword based on page content>",
    "long_tail_keywords": ["<specific keyword 1>", "<specific keyword 2>", "<specific keyword 3>"],
    "keyword_intent": {{
      "<keyword>": "informational|commercial|transactional|navigational"
    }}
  }},
  "competitor_analysis": {{
    "assumed_competitors": ["<competitor1.com>", "<competitor2.com>", "<competitor3.com>"],
    "content_gaps": ["<specific gap: e.g., 'Missing comparison tables with specs'>", "<gap 2>"],
    "opportunities": ["<specific opportunity with numbers: e.g., 'Target long-tail keywords with 500+ monthly searches'>", "<opportunity 2>"]
  }},
  "content_recommendations": [
    {{
      "page_type": "Blog Post|Landing Page|Product Page|Service Page|Homepage",
      "topic": "<specific topic with target word count: e.g., 'Complete Guide to X (1500 words)'>",
      "target_keywords": ["<primary keyword>", "<secondary keyword>", "<LSI keyword>"],
      "structure": {{
        "h1": ["<exact ready-to-use H1 example>"],
        "h2": ["<exact H2 example 1>", "<exact H2 example 2>", "<exact H2 example 3>"],
        "h3": ["<exact H3 example 1>", "<exact H3 example 2>"]
      }}
    }}
  ],
  "action_plan_30_days": [
    {{
      "week": "Week 1",
      "priority": "High",
      "action": "<specific action with exact steps: e.g., 'Fix canonical tag: Change from HTTP to HTTPS version'>",
      "expected_impact": "<measurable impact: e.g., '+15-20% CTR improvement, estimated +100 clicks/month'>"
    }},
    {{
      "week": "Week 2",
      "priority": "High|Medium",
      "action": "<specific action: e.g., 'Add Schema.org Article markup with author, datePublished, and headline'>",
      "expected_impact": "<measurable impact: e.g., 'Rich snippets in search results, +10-15% CTR'>"
    }},
    {{
      "week": "Week 3",
      "priority": "Medium",
      "action": "<specific action: e.g., 'Increase internal linking from 45% to 75% by adding 8-10 contextual links'>",
      "expected_impact": "<measurable impact: e.g., 'Better crawlability, improved PageRank distribution'>"
    }},
    {{
      "week": "Week 4",
      "priority": "Medium|Low",
      "action": "<specific action>",
      "expected_impact": "<measurable impact>"
    }}
  ]
}}

REMEMBER - EVERY recommendation must include:
✓ Exact current numbers
✓ Specific target numbers  
✓ Ready-to-use examples
✓ Measurable impact estimates

Be professional, specific, and client-ready. Focus on high-impact optimizations, especially the new technical SEO findings (canonical, schema, internal links)."""

    try:
        openai_client = AsyncOpenAI(api_key=api_key)
        
        response = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert SEO consultant providing professional, data-driven SEO audits with specific metrics, exact numbers, and actionable examples. Always respond with valid JSON only. EVERY recommendation MUST include: current state with numbers, target state with numbers, ready-to-use examples, and measurable impact estimates. Never give generic advice. Pay special attention to technical SEO issues like canonical tags, structured data, and internal linking."
                },
                {"role": "user", "content": analysis_prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        response_text = response.choices[0].message.content
        ai_analysis = json.loads(response_text)
        
        # Build SEO report
        report = SEOReport(
            url=url,
            title=scraped_data.get('title'),
            meta_description=scraped_data.get('meta_description'),
            h1_tags=scraped_data.get('h1_tags', []),
            h2_tags=scraped_data.get('h2_tags', []),
            word_count=scraped_data.get('word_count', 0),
            total_images=scraped_data.get('total_images', 0),
            images_without_alt=scraped_data.get('images_without_alt', 0),
            canonical_url=technical_seo.get('canonical_url'),
            canonical_issues=technical_seo.get('canonical_issues', []),
            robots_txt_found=technical_seo.get('robots_txt_found', False),
            sitemap_found=technical_seo.get('sitemap_found', False),
            ssl_enabled=technical_seo.get('ssl_enabled', False),
            
            technical_seo=technical_seo,
            schema_analysis=schema_analysis,
            linking_analysis=linking_analysis,
            backlink_analysis=backlink_analysis,
            seo_score=ai_analysis.get('seo_score'),
            analysis_summary=ai_analysis.get('analysis_summary'),
            seo_issues=[SEOIssue(**issue) for issue in ai_analysis.get('seo_issues', [])],
            keyword_strategy=KeywordStrategy(**ai_analysis.get('keyword_strategy', {})) if ai_analysis.get('keyword_strategy') else None,
            competitor_analysis=ai_analysis.get('competitor_analysis', {}),
            content_recommendations=[ContentRecommendation(**rec) for rec in ai_analysis.get('content_recommendations', [])],
            action_plan_30_days=ai_analysis.get('action_plan_30_days', [])
        )
        
        return report
        
    except Exception as e:
        logger.error(f"Error in AI analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")



# API Routes
@api_router.get("/")
async def root():
    return {"message": "SEO Genius API - AI-Powered SEO Analysis"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


@api_router.post("/seo/analyze", response_model=SEOReportResponse)
async def analyze_seo(request: SEOAnalysisRequest):
    """Analyze a website and generate comprehensive SEO report"""
    
    url = str(request.url)
    logger.info(f"Starting SEO analysis for: {url}")
    
    # Scrape website
    scraped_data = await scrape_website(url)
    
    # AI analysis
    report = await analyze_with_ai(url, scraped_data)
    
    # Save to database
    doc = report.model_dump()
    doc['analyzed_at'] = doc['analyzed_at'].isoformat()
    
    await db.seo_reports.insert_one(doc)
    
    logger.info(f"SEO analysis completed for: {url}")
    return report


@api_router.get("/seo/reports", response_model=List[SEOReportResponse])
async def get_seo_reports():
    """Get all SEO reports"""
    reports = await db.seo_reports.find({}, {"_id": 0}).sort("analyzed_at", -1).to_list(100)
    
    for report in reports:
        if isinstance(report['analyzed_at'], str):
            report['analyzed_at'] = datetime.fromisoformat(report['analyzed_at'])
    
    return reports


@api_router.get("/seo/reports/{report_id}", response_model=SEOReportResponse)
async def get_seo_report(report_id: str):
    """Get specific SEO report by ID"""
    report = await db.seo_reports.find_one({"id": report_id}, {"_id": 0})
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if isinstance(report['analyzed_at'], str):
        report['analyzed_at'] = datetime.fromisoformat(report['analyzed_at'])
    
    return report


@api_router.delete("/seo/reports/{report_id}")
async def delete_seo_report(report_id: str):
    """Delete SEO report"""
    result = await db.seo_reports.delete_one({"id": report_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"message": "Report deleted successfully"}
@api_router.post("/seo/backlinks")
async def analyze_backlinks_endpoint(request: SEOAnalysisRequest):
    """Dedicated endpoint for backlink analysis"""
    url = str(request.url)
    logger.info(f"Starting backlink analysis for: {url}")
    
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            response = await client.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        backlink_data = await analyze_backlinks(url, soup)
        
        return {
            "url": url,
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
            "backlink_analysis": backlink_data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed: {str(e)}")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
# ========== NEW FEATURES: Add these helper functions ==========




# For Railway deployment
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
