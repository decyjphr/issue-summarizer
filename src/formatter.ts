import { IssueSummary } from './types'
import { format } from 'date-fns'

export function formatAsMarkdown(summaries: IssueSummary[]): string {
  let markdown = '# Issue Summary Report\n\n'
  markdown += `Generated on: ${format(new Date(), 'PPP')}\n\n`
  
  for (const summary of summaries) {
    markdown += `## [#${summary.number}: ${summary.title}](${summary.url})\n\n`
    markdown += `- **Owner**: ${summary.owner}\n`
    markdown += `- **Assignees**: ${summary.assignees.length > 0 ? summary.assignees.join(', ') : 'None'}\n`
    markdown += `- **Status**: ${summary.status}\n`
    markdown += `- **Last Updated**: ${format(new Date(summary.updatedAt), 'PPP')}\n\n`
    
    markdown += `### Summary\n\n${summary.summary}\n\n`
    
    if (summary.pendingItems && summary.pendingItems.length > 0) {
      markdown += '### Pending Items\n\n'
      for (const item of summary.pendingItems) {
        markdown += `- ${item}\n`
      }
      markdown += '\n'
    }
    
    markdown += '---\n\n'
  }
  
  return markdown
}

export function formatAsJSON(summaries: IssueSummary[]): string {
  return JSON.stringify(
    {
      generated: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
      issues: summaries
    },
    null,
    2
  )
}
