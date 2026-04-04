# PDF Export Feature

Sometimes you need your notes outside the app. The export feature lets you convert your notes into high-quality PDF documents.

## How it works

This feature takes your note's title and content and reformats everything into a layout that looks good on paper.

## Key Features

1. **Full Content**: Exports headings, paragraphs, and lists as you see them.
2. **Clean Layout**: High readability for offline viewing or printing.
3. **Instant Preview**: See how the document will look before you save it.

## Technical Details

- **Location**: `apps/web/components/pdf-document.tsx` and `export-modal.tsx`.
- **Library**: Built using `@react-pdf/renderer`, a tool that creates PDFs inside React.
- **Conversion**: Uses a set of styles defined in the code to match the editor's look.
