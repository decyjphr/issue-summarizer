export interface GitHubIssue {
  title: string
  html_url: string
  number: number
  state: string
  created_at: string
  updated_at: string
  body: string
  user: {
    login: string
  }
  assignees: Array<{
    login: string
  }>
  labels: Array<{
    name: string
  }>
}

export interface IssueSummary {
  title: string
  number: number
  url: string
  owner: string
  assignees: string[]
  status: string
  description: string
  summary: string
  pendingItems: string[]
  updatedAt: string
}

export interface ActionInputs {
  token: string
  repo: string
  limit: number
  model: string
  outputFormat: 'markdown' | 'json'
}
