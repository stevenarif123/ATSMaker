import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImportWorkflowPage from '../ImportWorkflowPage.jsx'
import { ResumeProvider } from '../../../../store/resumeStore.js'

function renderPage() {
  return render(
    <ResumeProvider>
      <ImportWorkflowPage />
    </ResumeProvider>,
  )
}

describe('Import workflow', () => {
  it('shows parsed sections inside the review drawer for a happy path import', async () => {
    renderPage()
    const file = new File(['Professional Summary:\nI build products\n\nSkills:\nReact, Leadership'], 'resume.txt', {
      type: 'text/plain',
    })

    const input = screen.getByTestId('import-file-input')
    await userEvent.upload(input, file)

    const drawer = await screen.findByRole('dialog', { name: /review parsed sections/i })
    expect(drawer).toBeInTheDocument()
    expect(screen.getByText(/Professional Summary/i)).toBeInTheDocument()
  })

  it('surfaces actionable messaging for image-based PDFs', async () => {
    renderPage()
    const pdf = new File([''], 'scan.pdf', { type: 'application/pdf' })

    await userEvent.upload(screen.getByTestId('import-file-input'), pdf)

    await screen.findByText(/scanned image/i)
    expect(screen.getByText(/upload txt/i)).toBeInTheDocument()
  })

  it('merges accepted sections into the resume store', async () => {
    renderPage()
    const file = new File(['Summary:\nShipping wins'], 'resume.txt', { type: 'text/plain' })
    await userEvent.upload(screen.getByTestId('import-file-input'), file)

    await screen.findByRole('dialog', { name: /review parsed sections/i })

    await userEvent.click(screen.getByRole('button', { name: /accept & merge/i }))

    await screen.findByText(/resume updated with/i)
  })
})
