# AI Assistant Feature

The AI Assistant helps you write better and faster. It is a powerful tool integrated directly inside the note editor.

## How it works

The assistant uses artificial intelligence to analyze your text and perform actions like summarizing or re-writing. It works in real-time and shows you the results before you decide to keep them.

## Key Actions

1. **Improve Writing**: Fixes grammar and makes your sentences flow better.
2. **Summarize**: Takes a long selection of text and makes it short and clear.
3. **Professional Rewrite**: Changes the tone of your writing to sound more formal.
4. **Brainstorm**: Generates new ideas based on the context of your note.
5. **Auto Tag**: Analyzes your note and suggests relevant tags automatically.

## Technical Details

- **Location**: `apps/web/components/ai-assistant.tsx`
- **Backend**: It connects to a specialized AI route at `/api/ai/chat`.
- **Interface**: Uses a popover menu that appears when you click the "Ask AI" button.
- **Streaming**: The response from the AI is streamed word by word, so you don't have to wait for the whole result.

## Note for others

To add more AI features, look at the `handleAIAction` function. You can adding more cases to the `handleAIAction` and update the `CommandGroup` list with new icons and labels.
