import * as github from '@actions/github'
import { GitHubIssue } from './types'

export async function getRecentIssues(
  token: string, 
  repo: string, 
  limit: number
): Promise<GitHubIssue[]> {
  const [owner, repoName] = repo.split('/')
  const octokit = github.getOctokit(token)
  
  // const response = await octokit.rest.issues.listForRepo({
  //   owner,
  //   repo: repoName,
  //   state: 'all',
  //   //exclude labels:report
  //   labels: 'report',
  //   sort: 'updated',
  //   direction: 'desc',
  //   per_page: limit
  // })
  //  // Filter out pull requests (which are also returned by the issues API)
  //return response.data.filter(issue => !('pull_request' in issue)) as GitHubIssue[]
  const response = await octokit.rest.search.issuesAndPullRequests({
  q: `repo:${owner}/${repoName} -label:report is:issue`,
  sort: 'updated',
  direction: 'desc',
  per_page: limit
});

return response.data.items as GitHubIssue[]

}
