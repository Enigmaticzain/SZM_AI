interface GitHubFile {
  name: string;
  path: string;
  content: string;
  download_url: string;
}

interface GitHubSkill {
  id: string;
  name: string;
  description: string;
  content: string;
  source: string;
  timestamp: Date;
}

export async function fetchGitHubRepository(repoUrl: string): Promise<{ success: boolean; skills: GitHubSkill[]; error?: string }> {
  try {
    // Parse GitHub URL to get owner and repo
    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!urlMatch) {
      throw new Error('Invalid GitHub repository URL');
    }

    const [, owner, repo] = urlMatch;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SZM-AI-Assistant/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const files = await response.json();
    const skills: GitHubSkill[] = [];

    // Process files and extract skills
    for (const file of files) {
      if (file.type === 'file' && (file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.json'))) {
        try {
          const contentResponse = await fetch(file.download_url);
          if (contentResponse.ok) {
            const content = await contentResponse.text();
            
            skills.push({
              id: `github-${owner}-${repo}-${file.name}`,
              name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
              description: `Skill from ${owner}/${repo}`,
              content,
              source: `GitHub: ${owner}/${repo}/${file.path}`,
              timestamp: new Date(),
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch content for ${file.name}:`, error);
        }
      }
    }

    return {
      success: true,
      skills,
    };
  } catch (error) {
    console.error('GitHub repository fetch error:', error);
    return {
      success: false,
      skills: [],
      error: error instanceof Error ? error.message : 'Unknown GitHub error',
    };
  }
}

export async function searchGitHubRepositories(query: string): Promise<{ success: boolean; repositories: Array<{ name: string; full_name: string; description: string; html_url: string }>; error?: string }> {
  try {
    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query + ' AI skills training')}&sort=stars&order=desc&per_page=10`;

    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SZM-AI-Assistant/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub search error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      repositories: data.items || [],
    };
  } catch (error) {
    console.error('GitHub search error:', error);
    return {
      success: false,
      repositories: [],
      error: error instanceof Error ? error.message : 'Unknown search error',
    };
  }
}