import { render, screen, fireEvent } from '@testing-library/react'
import { NotesSection } from '../NotesSection'
import type { Note } from '@/types/database'

// Mock Supabase client to avoid database calls
jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({})
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({})
}))

// Sample note data
const mockNote: Note = {
  id: '1',
  user_id: 'user-1',
  title: 'Test Note',
  content: 'Test content',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

describe('NotesSection', () => {
  
  it('shows form when "Nytt Notat" button is clicked', () => {
    render(<NotesSection notes={[]} />)
    
    // Initially form should not be visible
    expect(screen.queryByPlaceholderText('Skriv tittel på notatet...')).not.toBeInTheDocument()
    
    // Click the "Nytt Notat" button
    const newNoteButton = screen.getByText('Nytt Notat')
    fireEvent.click(newNoteButton)
    
    // Now form should be visible (setShowForm(true) worked)
    expect(screen.getByPlaceholderText('Skriv tittel på notatet...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Skriv notatinnhold her...')).toBeInTheDocument()
  })

  it('disables "Nytt Notat" button when form is shown', () => {
    render(<NotesSection notes={[]} />)
    
    const newNoteButton = screen.getByText('Nytt Notat')
    
    // Button should be enabled initially
    expect(newNoteButton).not.toBeDisabled()
    
    // Click to show form
    fireEvent.click(newNoteButton)
    
    // Button should now be disabled
    expect(newNoteButton).toBeDisabled()
  })

  it('displays existing notes correctly', () => {
    render(<NotesSection notes={[mockNote]} />)
    
    // Should display the note title and content
    expect(screen.getByText('Test Note')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
    
    // Should show edit and delete buttons
    expect(screen.getByText('✏️ Rediger')).toBeInTheDocument()
    expect(screen.getByText('🗑️ Slett')).toBeInTheDocument()
  })

})
