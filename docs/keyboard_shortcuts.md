# Keyboard Shortcuts Feature

This feature lets you perform common editor and application actions without using your mouse. It is designed to make you more productive.

## How it works

The app listens for "modifier" keys like `Ctrl` on Windows and `Command` on Mac. When you press these along with other keys, it triggers an action like saving or formatting.

## Key Shortcuts

1. **Save Note**: `Ctrl + S` or `Command + S`.
2. **Toggle Sidebar**: `Ctrl + \` or `Command + \`.
3. **Highlighter**: `Ctrl + Shift + H` or `Command + Shift + H`.
4. **Headings**: `Ctrl + Alt + 1` (or `2`, or `3`) to change heading levels.
5. **Text Align**: `Ctrl + Shift + L` (Left), `E` (Center), or `R` (Right).
6. **Format Document**: `Shift + Alt + F` (cleans up whitespace and typography).

## Technical Details

- **Location**: `apps/web/components/note-editor-inner.tsx`.
- **Keyboard Listener**: Uses a specialized `useEffect` hook to detect key presses.
- **Modifiers**: Uses `ctrlKey` and `metaKey` detectors to support both Windows and Mac.
  .
