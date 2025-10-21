'use client'

import { DocumentGenerator } from '@/components/ai/DocumentGenerator'

interface DocumentGeneratorWrapperProps {
  emneId: string
}

export function DocumentGeneratorWrapper({ emneId }: DocumentGeneratorWrapperProps) {
  const handleDocumentGenerated = (docId: string) => {
    // Refresh page to show new document
    window.location.reload()
  }

  return (
    <DocumentGenerator 
      emneId={emneId}
      onDocumentGenerated={handleDocumentGenerated}
    />
  )
}
