import { IssueSummary } from './types'
import { format } from 'date-fns'
import * as fs from 'fs'
import * as path from 'path'

export function formatAsMarkdown(summaries: IssueSummary[]): string {
  let markdown = '# Issue Summary Report\n\n'
  markdown += `Generated on: ${format(new Date(), 'PPP')}\n\n`
  markdown += '> [!IMPORTANT]\n> Copilot generated issue summary. Might contain invalid information.\n\n'
  
  for (const summary of summaries) {
    markdown += `## [#${summary.number}: ${summary.title}](${summary.url})\n\n`
    markdown += `- **Owner**: ${summary.owner}\n`
    markdown += `- **Assignees**: ${summary.assignees.length > 0 ? summary.assignees.join(', ') : 'None'}\n`
    markdown += `- **Status**: ${summary.status}\n`
    markdown += `- **Last Updated**: ${format(new Date(summary.updatedAt), 'PPP')}\n\n`
    
    markdown += `### Summary\n\n${summary.summary}\n\n`

    markdown += `### Investigation Details\n\n${summary.investigationDetails}\n\n`

    markdown += `### Next Steps\n\n${summary.nextSteps}\n\n`

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
      warning: "Copilot generated issue summary. Might contain invalid information.",
      generated: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
      issues: summaries
    },
    null,
    2
  )
}

/**
 * Writes the formatted content to a file and returns the file path
 * @param content The formatted content to write
 * @param format The format of the content ('markdown' or 'json')
 * @returns The path to the created file
 */
export function writeToFile(content: string, format: string): string {
  // Create the output directory in the GitHub workspace or current directory
  const workspaceDir = process.env.GITHUB_WORKSPACE || process.cwd();
  const outputDir = path.join(workspaceDir, 'issue-summary-output');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate a unique filename with timestamp
  const timestamp = Date.now();
  const extension = format === 'json' ? 'json' : 'md';
  const fileName = `issue-summary-${timestamp}.${extension}`;
  const filePath = path.join(outputDir, fileName);
  
  // Write the content to the file
  fs.writeFileSync(filePath, content);
  
  console.log(`Summary written to file: ${filePath}`);
  
  return filePath;
}
