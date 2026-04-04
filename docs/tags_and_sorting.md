# Tags and Sorting Feature

Keeping your notes organized is easy with tags and smart sorting. Labels help you quickly group and sort through your notes.

## How it works

You can add one or more labels (tags) to any note. These labels are displayed in a sidebar for easy filtering.

## Key Features

1. **Easy Labels**: Fast input for adding or removing tags.
2. **Global View**: See all your unique tags in the left sidebar.
3. **Smart Sorting**: Organizes your notes by most recently modified or newest first.
4. **Quick Filter**: Click any tag to only show notes with that label.

## Technical Details

- **Location**: `apps/web/components/note-editor-sidebar.tsx` and `sidebar-content.tsx`.
- **Backend API**: Uses `useUpdateNote` from `lib/api.ts` to save tag changes to the database.
- **Organization**: Tags are stored as a string array inside the `Note` database model.
