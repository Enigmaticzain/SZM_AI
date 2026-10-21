import { useState } from 'react';
import { GitBranch, Download, Search, ExternalLink } from 'lucide-react';
import { fetchGitHubRepository, searchGitHubRepositories } from '@/utils/githubSkills';
import { createTrainingEntry, TrainingData } from '@/utils/localLanguageModel';

interface GitHubSkillsImporterProps {
  onTrain: (data: TrainingData) => void;
}

export default function GitHubSkillsImporter({ onTrain }: GitHubSkillsImporterProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleImportRepository = async (url: string) => {
    if (!url.trim()) {
      alert('Please enter a GitHub repository URL');
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchGitHubRepository(url);
      
      if (result.success && result.skills.length > 0) {
        // Convert skills to training data
        result.skills.forEach(skill => {
          const trainingData = createTrainingEntry({
            type: 'text',
            content: `# ${skill.name}\n\n${skill.description}\n\n${skill.content}`,
            fileName: `${skill.name}.md`,
            mimeType: 'text/markdown',
          });
          onTrain(trainingData);
        });
        
        alert(`Successfully imported ${result.skills.length} skills from the repository!`);
        setRepoUrl('');
      } else {
        alert(`Failed to import skills: ${result.error || 'No skills found'}`);
      }
    } catch (error) {
      alert(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchRepositories = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchGitHubRepositories(searchQuery);
      
      if (result.success) {
        setSearchResults(result.repositories);
      } else {
        alert(`Search failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Search error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Direct Repository Import */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <GitBranch className="h-5 w-5 text-slate-700" />
          Import from GitHub Repository
        </h3>
        
        <p className="mb-4 text-sm text-slate-600">
          Enter a GitHub repository URL to import all markdown, text, and JSON files as training skills.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            disabled={isLoading}
          />
          <button
            onClick={() => handleImportRepository(repoUrl)}
            disabled={isLoading || !repoUrl.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                Importing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Import Skills
              </>
            )}
          </button>
        </div>
      </div>

      {/* Repository Search */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Search className="h-5 w-5 text-green-600" />
          Search GitHub Repositories
        </h3>
        
        <p className="mb-4 text-sm text-slate-600">
          Search for repositories containing AI skills, training data, or knowledge bases.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for AI skills, training data, knowledge base..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            disabled={isSearching}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchRepositories()}
          />
          <button
            onClick={handleSearchRepositories}
            disabled={isSearching || !searchQuery.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSearching ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            )}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <h4 className="font-medium text-slate-900">Search Results:</h4>
            {searchResults.map((repo) => (
              <div
                key={repo.full_name}
                className="flex items-start justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-slate-900">{repo.name}</h5>
                  <p className="text-sm text-slate-600 mb-2">{repo.description || 'No description'}</p>
                  <p className="text-xs text-slate-500">{repo.full_name}</p>
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => window.open(repo.html_url, '_blank')}
                    className="inline-flex items-center gap-1 rounded bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View
                  </button>
                  <button
                    onClick={() => handleImportRepository(repo.html_url)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700 disabled:bg-slate-300"
                  >
                    <Download className="h-3 w-3" />
                    Import
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Repositories */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Popular AI Training Repositories</h3>
        
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              name: 'Awesome AI',
              url: 'https://github.com/owainlewis/awesome-artificial-intelligence',
              description: 'Curated list of AI resources and tools'
            },
            {
              name: 'Machine Learning Yearning',
              url: 'https://github.com/ajaymache/machine-learning-yearning',
              description: 'Andrew Ng\'s ML strategy guide'
            },
            {
              name: 'AI Cheat Sheets',
              url: 'https://github.com/kailashahirwar/cheatsheets-ai',
              description: 'Essential AI and ML cheat sheets'
            },
            {
              name: 'Deep Learning Papers',
              url: 'https://github.com/floodsung/Deep-Learning-Papers-Reading-Roadmap',
              description: 'Roadmap for deep learning papers'
            }
          ].map((repo) => (
            <button
              key={repo.url}
              onClick={() => handleImportRepository(repo.url)}
              disabled={isLoading}
              className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <h4 className="font-medium text-slate-900">{repo.name}</h4>
              <p className="text-sm text-slate-600">{repo.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}