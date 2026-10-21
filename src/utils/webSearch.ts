interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  timestamp: Date;
}

interface WebSearchResponse {
  success: boolean;
  results: SearchResult[];
  error?: string;
}

export async function performWebSearch(query: string): Promise<WebSearchResponse> {
  try {
    // Using DuckDuckGo Instant Answer API (no API key required)
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = [];
    
    // Add instant answer if available
    if (data.Answer) {
      results.push({
        title: 'Instant Answer',
        url: data.AnswerURL || '#',
        snippet: data.Answer,
        timestamp: new Date(),
      });
    }

    // Add abstract if available
    if (data.Abstract) {
      results.push({
        title: data.Heading || 'Abstract',
        url: data.AbstractURL || '#',
        snippet: data.Abstract,
        timestamp: new Date(),
      });
    }

    // Add related topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || 'Related Topic',
            url: topic.FirstURL,
            snippet: topic.Text,
            timestamp: new Date(),
          });
        }
      });
    }

    return {
      success: true,
      results,
    };
  } catch (error) {
    console.error('Web search error:', error);
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : 'Unknown search error',
    };
  }
}

export async function fetchWebContent(url: string): Promise<{ success: boolean; content: string; error?: string }> {
  try {
    // For security and CORS reasons, we'll use a simple fetch
    // In a real implementation, you might want to use a proxy service
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'SZM-AI-Assistant/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const content = await response.text();
    
    // Basic text extraction from HTML
    const textContent = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      success: true,
      content: textContent.substring(0, 5000), // Limit content size
    };
  } catch (error) {
    console.error('Web content fetch error:', error);
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown fetch error',
    };
  }
}