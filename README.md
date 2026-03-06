# 🚀 AI SEO Web Analyzer

> AI-powered comprehensive SEO audit tool with real-time analysis, actionable insights, and professional reporting.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 devloper info
name = abhishek kumar
linkdin id = https://www.linkedin.com/in/abhishek-dey-19aa47360/

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Architecture](#-architecture)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core SEO Analysis

- **Technical SEO Audit**
  - ✅ Canonical tag validation and analysis
  - ✅ Robots.txt and Sitemap.xml detection
  - ✅ SSL/HTTPS security check
  - ✅ Meta robots and indexing status
  - ✅ Noindex detection and warnings

- **On-Page SEO**
  - 📝 Title tag optimization (length, keywords)
  - 📄 Meta description analysis
  - 🏷️ Heading structure validation (H1-H6)
  - 🖼️ Image alt text checker
  - 📊 Content length and word count analysis

- **Structured Data & Rich Snippets**
  - 🔍 JSON-LD schema detection
  - ✔️ Microdata validation
  - 🎨 Schema.org markup analysis
  - 📱 Open Graph tags checker

### 📈 Advanced Analytics

- **Readability Metrics**
  - Flesch Reading Ease Score
  - Flesch-Kincaid Grade Level
  - Gunning Fog Index
  - Estimated reading time

- **Keyword Analysis**
  - Keyword density calculation
  - Top keywords extraction
  - 2-word phrase analysis
  - Keyword stuffing detection
  - Lexical diversity scoring

- **Performance Monitoring**
  - ⚡ Page load time measurement
  - 📦 Page size analysis (MB/KB)
  - 🔧 Resource count (JS, CSS, images)
  - 🗜️ Compression detection (GZIP/Brotli)
  - 🔄 Browser caching validation
  - 🚫 Render-blocking resources detection

### 🔗 Link Analysis

- **Internal Linking**
  - Total link count
  - Internal vs external ratio
  - Nofollow link detection
  - Empty anchor text identification
  - Link distribution analysis

- **Backlink Analysis**
  - External link quality scoring
  - Dofollow/nofollow ratio
  - Unique domain counting
  - Domain authority estimation
  - Top linked domains

### 🤖 AI-Powered Insights

- **OpenAI GPT-4 Integration**
  - Intelligent SEO scoring (0-100)
  - Priority-based issue identification
  - Category-specific recommendations
  - Ready-to-use optimization examples
  - Measurable impact estimates

- **Strategic Planning**
  - Primary keyword identification
  - Long-tail keyword suggestions
  - Competitor analysis insights
  - Content recommendations
  - 30-day action plan with weekly priorities

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB with Motor (async driver)
- **Web Scraping**: BeautifulSoup4, httpx
- **AI/ML**: OpenAI GPT-4o-mini
- **NLP**: NLTK, textstat
- **Server**: Uvicorn (ASGI)

### Frontend
- **Framework**: React 18+
- **Styling**: Tailwind CSS / Custom CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks

### Infrastructure
- **Deployment**: Railway / Heroku
- **CORS**: Configurable origins
- **Environment**: python-dotenv

## 📦 Installation

### Prerequisites

- Python 3.11 or higher
- Node.js 18+ (for frontend)
- MongoDB instance (local or cloud)
- OpenAI API key

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/aby-a11y/ai-seo-web-analyzer.git
cd ai-seo-web-analyzer







