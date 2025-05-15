import * as core from '@actions/core'
import * as github from '@actions/github'
import { ActionInputs, IssueSummary } from './types'
import { getRecentIssues } from './github'
import { summarizeIssue } from './github-models'
import { formatAsMarkdown, formatAsJSON } from './formatter'

async function run(): Promise<void> {
  try {
    const inputs: ActionInputs = {
      token: core.getInput('token'),
      repo: core.getInput('repo'),
      limit: parseInt(core.getInput('limit'), 10),
      model: core.getInput('model'),
      outputFormat: core.getInput('output-format') as 'markdown' | 'json'
    }

    // Validate inputs
    if (isNaN(inputs.limit) || inputs.limit <= 0) {
      throw new Error('Invalid limit: must be a positive integer')
    }

    if (!inputs.token) {
      throw new Error('GitHub token with models permission is required')
    }

    core.debug(`Fetching ${inputs.limit} recent issues from ${inputs.repo}...`)
    const issues = await getRecentIssues(inputs.token, inputs.repo, inputs.limit)
    
    if (issues.length === 0) {
      core.info('No issues found')
      core.setOutput('summary', '')
      return
    }

    core.info(`Found ${issues.length} issues. Generating summaries...`)
    
    // Process issues in parallel with a concurrency limit
    const concurrencyLimit = 3
    const summaries: IssueSummary[] = []
    
    // Process issues in batches to respect concurrency limit
    for (let i = 0; i < issues.length; i += concurrencyLimit) {
      const batch = issues.slice(i, i + concurrencyLimit)
      const batchPromises = batch.map(issue => {
        core.debug(`Summarizing issue #${issue.number}: ${issue.title}`)
        return summarizeIssue(issue, inputs.token, inputs.model)
      })
      
      const batchResults = await Promise.all(batchPromises)
      summaries.push(...batchResults)
    }
    
    // Format the summaries based on the requested output format
    let output: string
    if (inputs.outputFormat === 'json') {
      output = formatAsJSON(summaries)
    } else {
      output = formatAsMarkdown(summaries)
    }
    
    core.info('Issue summaries generated successfully')
    core.info(JSON.stringify(summaries, null, 2))
    core.setOutput('summary', output)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('An unknown error occurred')
    }
  }
}

run()
