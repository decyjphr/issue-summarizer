// filepath: /Users/decyjphr/projects/actions/issue-summarizer/src/github-models.ts
import { GitHubIssue, IssueSummary } from './types'

export async function summarizeIssue(
  issue: GitHubIssue, 
  token: string,
  model: string = 'openai/gpt-4o'
): Promise<IssueSummary> {
  const systemPrompt = `
    You are a GitHub issue summarizer referred to as SYSTEM.
    Your task is to summarize GitHub issues and their comments for software engineers to review.
    You will be provided with the content of a GitHub issue and its comments.
    Use all relevant URLs and links in the issue and comments.
    Always reference the users based on their GitHub usernames.
    You should not alter the facts.
    If you are provided with system instructions !!SYSTEM INSTRUCTIONS!!: <text>, you should follow them while generating the summary.
    Your goal is to generate a comprehensive summary in JSON format.
    Format your response as JSON with the following fields:
    {
      "summary": "<PLACEHOLDER: an executive summary of the issue, and the outcomes of the investigations so far>",
      "investigationDetails": "<PLACEHOLDER: a breakdown of all the investigation steps taken so far, include the users who conducted the investigations (comment authors), and the outcome of each. Use bulleted lists of necessary>",
      "nextSteps": "<PLACEHOLDER: outcomes of the investigations and next steps needed to move the investigation forward or wrap up the work>",
      "pendingItems": ["item1", "item2", ...]
    }

    If there are no pending items, return an empty array.

    Replace all the placeholders like <PLACEHOLDER: output expectation> with your generated data:

    Make sure to include the following comment in all summaries generated and ignore all the comments that have the following comment:
    <!-- IGNORE THIS SUMMARY IN FUTURE PROMPTS -->
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
      investigationDetails: parsedContent.investigationDetails || 'No investigation details provided',
      nextSteps: parsedContent.nextSteps || 'No next steps provided',
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
