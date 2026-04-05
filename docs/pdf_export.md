# PDF Export Feature

Sometimes you need your notes outside the app. The export feature lets you convert your notes into high-quality PDF documents.

## How it works

This feature takes your note's title and content and reformats everything into a layout that looks good on paper.

## Key Features

1. **Full Content Hierarchy**: Exports all headings, paragraphs, lists, and formatting.
2. **Integrated Image Rendering**: All images (including local uploads and copy-pasted images) are fully exported with correct scaling and captions.
3. **Smart References**: Note links and member mentions are rendered as visually distinct elements.
4. **Dividers and Layout**: Horizontal rules and paragraph spacing are perfectly preserved.
5. **Clean Layout**: High readability for offline viewing or printing.

## Technical Details

- **Location**: `apps/web/components/pdf-document.tsx` and `export-modal.tsx`.
- **Library**: Built using `@react-pdf/renderer`, a tool that creates PDFs inside React.
- **Conversion**: Uses a set of styles defined in the code to match the editor's look.
