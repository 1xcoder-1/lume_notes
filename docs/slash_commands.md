# Slash Commands & Note Linking

Slash commands provide a fast way to perform actions and link content without leaving your keyboard. By typing `/` inside the editor, you can access a menu of available commands.

## How it works

When you type `/` at the start of a new line or after a space, a command menu appears. This menu allows you to search for existing notes in your organization and insert a direct link to them.

## Key Features

1. **Note Linking**: Search for any note by title and insert a reference link.
2. **Instant Navigation**: Clicking a note link in the editor instantly redirects you to the linked note.
3. **Smart Formatting**: Linked notes are highlighted with a distinct style (indigo background and underline) to make them stand out.
4. **Member Mentions**: Use `@` to mention team members and keep them in the loop.

## Export support

Note links are fully supported when exporting your notes:

- **PDF**: Linked notes appear as `[Note: Title]` with professional formatting.
- **HTML**: Rendered as styled links that maintain their visual identity.
- **Markdown**: Converted to bold references like `**[Note: Title]**`.

## Technical Details

- **Location**: `apps/web/components/note-editor-inner.tsx` (FileLink extension and logic).
- **Extension**: Built as a custom Tiptap extension extending the standard `Mention` functionality.
- **Redirection**: Managed by a global click handler in the editor component that detects `.file-link` interactions.
