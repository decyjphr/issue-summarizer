# Issue Summarizer GitHub Action

This GitHub Action summarizes the 10 most recently updated issues in a repository using the [GitHub Copilot API](https://api.githubcopilot.com). The summaries include key information such as title, owner/assignee, status, description, a concise summary, and pending items.

## Required Permissions

The GitHub token requires the following permissions:
- `issues: read` - To access issue content
- `id-token: write` - To authenticate with the GitHub Copilot API

## Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `token` | GitHub token with repository read access and Copilot permission | Yes | `${{ github.token }}` |
| `repo` | Repository name in the format "owner/repo" | No | Current repository |
| `limit` | Number of recent issues to summarize | No | `10` |
| `model` | GitHub Copilot model to use for summarization | No | `gpt-4o` |
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
        default: 'gpt-4o'

jobs:
  summarize:
    runs-on: ubuntu-latest
    permissions:
      issues: read
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

## Local Testing with Nektos Act

You can test this Action locally using [Nektos Act](https://github.com/nektos/act), which simulates GitHub Actions workflows on your machine.

### Prerequisites

1. Install Act by following the [installation instructions](https://nektosact.com/installation/index.html).
2. Have a GitHub personal access token (PAT) with `repo` scope available.

### Running locally

```bash
# Run the demo workflow locally
act workflow_dispatch -W .github/workflows/demo.yml \
  --secret GITHUB_TOKEN=<your-github-pat>
```

Use the `.actrc` file in the repository root for default Act configuration (platform, secrets file, etc.).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.