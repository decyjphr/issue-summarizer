// filepath: /Users/decyjphr/projects/actions/issue-summarizer/src/github-models.ts
import { GitHubIssue, IssueSummary } from './types'

export async function summarizeIssue(
  issue: GitHubIssue, 
  token: string,
  model: string = 'openai/gpt-4o'
): Promise<IssueSummary> {
  const systemPrompt = `
    You are a helpful assistant that summarizes GitHub issues.
    Extract the following information from the GitHub issue:
    1. A concise summary (up to 7 bullet points with key details)
    2. A list of pending items or action points (if any)
    
    Format your response as JSON with the following fields:
    {
      "summary": "The summary text",
      "pendingItems": ["item1", "item2", ...]
    }
    
    If there are no pending items, return an empty array.
  `
  
  const issueContent = `
    Title: ${issue.title}
    Description: ${issue.body || 'No description provided'}
    State: ${issue.state}
    Labels: ${issue.labels.map(label => label.name).join(', ')}
  `
  
  try {
    const response = await fetch('https://models.github.ai/inference/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: issueContent }
        ],
        model: model,
        response_format: { type: 'json_object' }
      })
    })
    
    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`GitHub Models API responded with status: ${response.status}`)
    }
    
    // Parse the JSON response
    const responseData = await response.json()
    const content = responseData.choices[0]?.message?.content || '{}'
    const parsedContent = JSON.parse(content)

    return {
      title: issue.title,
      number: issue.number,
      url: issue.html_url,
      owner: issue.user.login,
      assignees: issue.assignees.map(assignee => assignee.login),
      status: issue.state,
      description: issue.body || 'No description provided',
      summary: parsedContent.summary || 'No summary generated',
      pendingItems: parsedContent.pendingItems || [],
      updatedAt: issue.updated_at
    }
  } catch (error) {
    console.error(`Error summarizing issue #${issue.number}:`, error)
    return {
      title: issue.title,
      number: issue.number,
      url: issue.html_url,
      owner: issue.user.login,
      assignees: issue.assignees.map(assignee => assignee.login),
      status: issue.state,
      description: issue.body || 'No description provided',
      summary: 'Error generating summary',
      pendingItems: [],
      updatedAt: issue.updated_at
    }
  }
}
