# Folder Location and Smart Folders

Smart Folders help you keep your notes organized and easy to find. This system allows you to group related notes together.

## How it works

You can assign any note to a specific folder. A note can either be in the "Main" (root) location or inside a specific folder name.

## Key Features

1. **Folder Explorer**: Create, rename, or delete folders directly in the sidebar.
2. **Drag and Drop**: Simply grab a note and drop it on a folder to move it instantly.
3. **Editor Dropdown**: Use the "Folder Location" menu in the note editor to quickly switch folders.
4. **Automatic Sorting**: Folders are always grouped at the top of your sidebar for easy access.

## Technical Details

- **Database**: Uses the `folder` column in the `Note` table (Prisma).
- **Sidebar Logic**: The `SidebarContent` component handles the folder grouping and drag-and-drop state.
- **Real-time**: Folder changes are synced across all devices using Liveblocks.
