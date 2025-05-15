import * as github from '@actions/github'
import { GitHubIssue } from './types'

export async function getRecentIssues(
  token: string, 
  repo: string, 
  limit: number
): Promise<GitHubIssue[]> {
  const [owner, repoName] = repo.split('/')
  const octokit = github.getOctokit(token)
  
  const response = await octokit.rest.issues.listForRepo({
    owner,
    repo: repoName,
    state: 'all',
    sort: 'updated',
    direction: 'desc',
    per_page: limit
  })

  // Filter out pull requests (which are also returned by the issues API)
  return response.data.filter(issue => !('pull_request' in issue)) as GitHubIssue[]
}
