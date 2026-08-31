import type { Metadata } from 'next'
import { EditorPageClient } from '@/components/editor/editor-page-client'

export const metadata: Metadata = {
  title: 'Visual Script Editor',
  description:
    'Preview of the upcoming k6 Builder IDE-style editor: a multi-file project explorer and code workbench for building Grafana k6 load testing scripts.',
  alternates: {
    canonical: 'https://k6builder.dev/editor',
  },
}

export default function EditorPage() {
  return <EditorPageClient />
}
