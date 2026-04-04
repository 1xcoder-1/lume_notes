# Nested Folders and Folder Organization

Lucide Note supports a robust, hierarchical folder organization system. This allows you to organize your notes into folders and sub-folders to any level of depth.

## Key Features

1. **Deep Hierarchies**: Create unlimited sub-folders to manage complex projects or subjects.
2. **Proper Dialog UI**: A clean, modern dialog for naming and creating sub-folders.
3. **Folder Dropdown Menus**: Access all folder actions (New Sub-folder, Delete) via the `...` menu on κάθε folder element.
4. **Smart Drag & Drop**: Move notes seamlessly between any folders or sub-folders by dragging them directly in the sidebar.
5. **ID-Based Relationship**: Folders are uniquely identified by ID (not just name), ensuring data integrity when using same-named folders in different branches.

## How to use

### Creating Folders
- Use the **Plus (+)** icon in the Explorer header to create a root-level folder.
- Use the **Plus (+)** icon inside a folder's dropdown menu to create a **sub-folder** inside it.

### Organizing Notes
- Drag any note from the sidebar and drop it onto a folder to move it.
- Use the **Folder Selection** menu within the Note Editor to change a note's location.

### Managing Folders
- **Expand/Collapse**: Click the folder name or arrow to toggle its children.
- **Delete**: Use the trash icon in the folder dropdown menu. Note: Deleting a folder will also permanently delete all notes inside it.

## Technical Details

### Database Schema
We use a self-referencing relationship in the `Folder` model:
```prisma
model Folder {
  id         String   @id @default(cuid())
  name       String
  parentId   String?
  parent     Folder?  @relation("SubFolders", fields: [parentId], references: [id])
  children   Folder[] @relation("SubFolders")
  notes      Note[]
}
```

### UI Implementation
- **Recursive Rendering**: The `SidebarContent` component uses a recursive `renderFolderItem` function to build the tree.
- **Optimized Tree Building**: A flat list of folders is transformed into a tree structure client-side for maximum performance.
- **Live Sync**: Changes to folder hierarchies are synced in real-time between users.

---

*Updated: April 2, 2026*
