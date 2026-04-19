# Note Version History (Time Machine)

Lume Notes includes a professional-grade **Note Version History** system that allows users to track changes over time and restore previous versions of their work.

## ✨ Key Features

- **Automatic Snapshots**: The system automatically creates a snapshot every time a note is saved.
- **IDE-Style Diffing**: Visual highlights for every change:
  - <span style="background-color: #dcfce7; color: #166534; padding: 2px 4px; border-radius: 4px;">Green Background</span>: Newly added text.
  - <span style="background-color: #fee2e2; color: #991b1b; padding: 2px 4px; border-radius: 4px; text-decoration: line-through;">Red Background</span>: Removed text.
- **Instant Restore**: Revert to any previous version with a single click. The editor updates in real-time without requiring a page reload.
- **View Only Mode**: Organization members can view history, but "Restore" access can be restricted by admins to maintain data integrity.
- **Two-Pane Comparison**: A clean sidebar list of versions with a large, responsive preview pane.

## 🛠 How it Works

### 1. Snapshot Creation

Whenever a user triggers a save (manually via the Save button or via auto-save), the server creates a `NoteHistory` record in the database containing the full content of the note at that exact moment.

### 2. Intelligent Diffing

The history modal compares the selected historical version against the current editor content. It uses a word-level diffing algorithm that:

- Preserves all whitespace and newlines for accurate formatting.
- Identifies specific word changes rather than just block changes.
- Can be toggled on/off via the "Show Changes" button for a cleaner view.

### 3. Restoration Process

When you click **Restore**:

1. The server updates the main `Note` record with the historical content.
2. A new "Backup" snapshot of your _current_ state is created (so you never lose work).
3. The frontend editor (Tiptap/Liveblocks) is instantly updated using `editor.commands.setContent()`.

## 🎨 UI/UX Improvements

- **Ultra-Thin Scrollbars**: All scrollable areas in the history modal use minimal 4px scrollbars for a premium feel.
- **Responsive Design**: On mobile, the modal switches between a version list and a full-screen preview.
- **Permission Control**: Centered "View Only Mode" badge appears for users without restore permissions.

## 🚀 Performance

The history list is invalidated and refreshed automatically upon every save, ensuring that your most recent changes are always available in the version list without needing to refresh the browser.
