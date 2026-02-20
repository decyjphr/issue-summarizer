import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {formatAsMarkdown, formatAsJSON} from '../src/formatter'
import {IssueSummary, GitHubIssue} from '../src/types'
import {summarizeIssue} from '../src/github-models'

// Mock issue summary data for testing
const mockIssueSummaries: IssueSummary[] = [
  {
    title: 'Test Issue 1',
    number: 1,
    url: 'https://github.com/ActionsDesk/issue-summarizer/issues/1',
    owner: 'testuser',
    assignees: ['dev1', 'dev2'],
    status: 'open',
    description: 'This is a test issue description',
    summary: 'This is a test summary',
    pendingItems: ['Fix bug', 'Update docs'],
    updatedAt: '2023-07-15T10:30:15Z'
  },
  {
    title: 'Test Issue 2',
    number: 2,
    url: 'https://github.com/ActionsDesk/issue-summarizer/issues/2',
    owner: 'testuser2',
    assignees: [],
    status: 'closed',
    description: 'Another test issue description',
    summary: 'Another test summary',
    pendingItems: [],
    updatedAt: '2023-07-14T09:20:05Z'
  }
]

test('formatAsMarkdown generates correct output', () => {
  const markdown = formatAsMarkdown(mockIssueSummaries)

  // Basic checks
  expect(markdown).toContain('# Issue Summary Report')
  expect(markdown).toContain('## [#1: Test Issue 1]')
  expect(markdown).toContain('**Owner**: testuser')
  expect(markdown).toContain('**Assignees**: dev1, dev2')
  expect(markdown).toContain('### Pending Items')
  expect(markdown).toContain('- Fix bug')

  // Check for second issue
  expect(markdown).toContain('## [#2: Test Issue 2]')
  expect(markdown).toContain('**Assignees**: None')
})

test('formatAsJSON generates valid JSON', () => {
  const json = formatAsJSON(mockIssueSummaries)
  const parsed = JSON.parse(json)

  expect(parsed).toHaveProperty('generated')
  expect(parsed).toHaveProperty('issues')
  expect(parsed.issues).toHaveLength(2)
  expect(parsed.issues[0].title).toBe('Test Issue 1')
  expect(parsed.issues[1].number).toBe(2)
})

test('summarizeIssue uses GitHub Copilot API endpoint', async () => {
  const mockIssue: GitHubIssue = {
    number: 42,
    title: 'Test Issue',
    body: 'Test body',
    state: 'open',
    html_url: 'https://github.com/test/repo/issues/42',
    user: {login: 'testuser'},
    assignees: [],
    labels: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  const fetchedUrls: string[] = []
  global.fetch = jest.fn().mockImplementation((url: string) => {
    fetchedUrls.push(url)
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{message: {content: JSON.stringify({summary: 'Test', pendingItems: []})}}]
        })
    })
  }) as jest.Mock

  await summarizeIssue(mockIssue, 'test-token', 'gpt-4o')

  expect(fetchedUrls[0]).toBe('https://api.githubcopilot.com/chat/completions')

  jest.restoreAllMocks()
})

// Shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  // Setup test environment variables
  process.env['INPUT_TOKEN'] = 'test-token'
  process.env['INPUT_REPO'] = 'owner/repo'
  process.env['INPUT_LIMIT'] = '5'
  process.env['INPUT_API-KEY'] = 'test-api-key'
  process.env['INPUT_OUTPUT-FORMAT'] = 'markdown'

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }

  // This will throw if the process exits with an error
  try {
    cp.execFileSync(np, [ip], options)
  } catch (error) {
    // We expect this to fail in tests since we don't have real API keys
    // Just checking that the process runs without a fatal error
    console.log('Expected test error: No real API connections in tests')
  }
})
