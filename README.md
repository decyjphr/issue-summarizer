# Issue Summarizer GitHub Action

This GitHub Action summarizes the 10 most recently updated issues in a repository using GitHub Models API. The summaries include key information such as title, owner/assignee, status, description, a concise summary, and pending items.

## Required Permissions

The GitHub token requires the following permissions:
- `issues: read` - To access issue content
- `id-token: write` - To authenticate with the GitHub Models API

## Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `token` | GitHub token with repository read access and models permission | Yes | `${{ github.token }}` |
| `repo` | Repository name in the format "owner/repo" | No | Current repository |
| `limit` | Number of recent issues to summarize | No | `10` |
| `model` | GitHub Model to use for summarization | No | `openai/gpt-4o` |
| `output-format` | Format of the output summary (`markdown` or `json`) | No | `markdown` |

## Outputs

| Name | Description |
|------|-------------|
| `summary` | The generated summary of issues |

## Usage

### Basic Usage

```yaml
name: Summarize Issues

on:
  workflow_dispatch:
  schedule:
    - cron: '0 8 * * 1' # Run every Monday at 8:00 AM

jobs:
  summarize:
    runs-on: ubuntu-latest
    permissions:
      issues: read
      models: write
    steps:
      - name: Summarize Recent Issues
        id: summarize
        uses: ActionsDesk/issue-summarizer@v1
          
      - name: Create Summary Issue
        uses: peter-evans/create-issue-from-file@v4
        with:
          title: 'Weekly Issue Summary'
          content-filepath: ${{ steps.summarize.outputs.summary }}
          labels: |
            report
            automated
```

### Advanced Usage

```yaml
name: Detailed Issue Summary

on:
  workflow_dispatch:
    inputs:
      limit:
        description: 'Number of issues to summarize'
        required: false
        default: '20'
      model:
        description: 'Model to use for summarization'
        required: false
        default: 'openai/gpt-4o'

jobs:
  summarize:
    runs-on: ubuntu-latest
    permissions:
      issues: read
      models: write
    steps:
      - name: Generate Issue Summary
        id: summary
        uses: ActionsDesk/issue-summarizer@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          repo: 'myorg/repo'
          limit: ${{ github.event.inputs.limit }}
          model: ${{ github.event.inputs.model }}
          output-format: 'json'
          
      - name: Archive Summary
        uses: actions/upload-artifact@v3
        with:
          name: issue-summary
          path: ${{ steps.summary.outputs.summary }}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.