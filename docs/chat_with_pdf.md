# Chat with PDF

The Chat with PDF feature allows you to upload existing documents into your note and use the AI Assistant to discuss the PDF's content.

## How it works

Inside any note, you can click the "Chat / Import PDF" button. This uploads your file directly to our secure server, and the AI Assistant reads the document to understand it.

## Key Features

1. **Instant Import**: Upload any PDF to add its text into your current note.
2. **AI Question & Answer**: Ask the AI questions about the PDF (e.g., "Summarize this PDF" or "What are the main points?").
3. **Multi-Document Support**: Chat with multiple PDFs to find connections between them.

## Technical Details

- **Location**: `apps/web/components/note-editor-sidebar.tsx` (Upload UI) and `api/ai/chat` (AI Logic).
- **Processing**: We use a specialized PDF parser to extract high-quality text from the file.
- **AI Integration**: The extracted text is sent to Google Gemini 1.5 Pro with your specific questions.

## Note for others

To add support for other file types (like Word or Images), you can expand the `accept` attribute in the `input` tag in `NoteEditorSidebar` and add a new parser inside the AI chat route logic.
