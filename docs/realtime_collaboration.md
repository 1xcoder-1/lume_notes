# Realtime Collaboration Feature

Working with others should be smooth and fast. The collaboration feature lets multiple people edit the same note at once.

## How it works

This feature synchronizes the text for everyone in real-time. When one person types, every other user sees the change almost instantly.

## Key Features

1. **Multiuser Editing**: More than one person can type in different areas of the same note.
2. **Live Cursors**: See where other people are typing with their names and unique colors.
3. **Presence**: See who else is currently viewing the note.
4. **Collision Free**: No text is lost if two people type at the same time.

## Technical Details

- **Location**: `apps/web/components/note-editor-inner.tsx` and `providers.tsx`.
- **Infrastructure**: Uses **Liveblocks** for the connection and **Yjs** for the shared data model.
- **Extensions**: Includes `Collaboration` and `CollaborationCursor` for the editor.
