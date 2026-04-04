# Rich Text Editor Feature

The editor is the core of this application. It provides a clean and powerful interface for writing and formatting your notes.

## How it works

It uses a block-based system where every paragraph, heading, or list is a unique element. This makes it easy to format content without complex HTML.

## Toolbar Reference (All Features)

The top navbar provides access to all editing and collaboration tools:

### 1. Basic Formatting

- **Bold / Italic / Underline / Strikethrough**: Classic text styling.
- **Highlighter**: Color-coded text highlighting for emphasis.
- **Superscript / Subscript**: Small text above or below the line.

### 2. Document Structure

- **Headings**: H1, H2, and H3 for organizing content hierarchically.
- **Lists**:
  - **Bulleted / Numbered Lists**: Standard organization.
  - **Task Lists**: Interactive checklists for task management.
- **Quote Blocks**: Styled blocks for citations or important notes.
- **Code Blocks**: Inline code and multi-line code snippets with syntax-style boxes.
- **Horizontal Rule**: Inserts a separator line to divide sections.

### 3. Advanced Layout & Media

- **Text Alignment**: Align text or images to **Left, Center, Right, or Justify**.
- **Images**:
  - **Upload Image**: Selection from your local computer (stored as Base64 in DB).
  - **Image from URL**: Link to external online assets.
  - **7-Image Limit**: Enforced per-note to maintain performance.
- **Tables**:
  - Insert dynamic 3x3 tables.
  - Add/Delete rows and columns.
  - Fully resizable columns.

### 4. Smart Utilities

- **Auto-Format ("The Wand")**: Instantly cleans up whitespace and typography (`Shift + Alt + F`).
- **AI Assistant**: Intelligent writing assistance (Deep Search, Summary, etc.).
- **Links**: Add or remove hyperlinks to external websites.
- **Save**: Dedicated save button for manual persistence.
- **Undo / Redo**: Full history tracking of all document changes.

### 5. Collaboration & UI

- **Sidebar Toggle**: Open/Close the folder management sidebar.
- **User Presence**: Real-time list of collaborators currently in the note.
- **Invite**: Button to easily share the note with teammates.
- **Dirty State Indicator**: Visual cue showing if changes are unsaved.

---

## Technical Details

- **Location**: `apps/web/components/note-editor.tsx` and `note-editor-inner.tsx`.
- **Framework**: Built with **Tiptap**, a popular headless rich-text editor framework.
- **Extensions**: Includes custom `formatter`, `Image` (block-level), `TextAlign`, `StarterKit`, `Link`, `Placeholder`, and `TaskItem`.
