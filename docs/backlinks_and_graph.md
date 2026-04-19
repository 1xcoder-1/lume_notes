# Backlinks & Graph View

Lume Notes features a powerful knowledge mapping system that visualizes how your notes are interconnected, helping you discover relationships between different ideas.

## 🔗 Backlinks

Backlinks show you every note that mentions or links to the current note you are viewing. This creates a bi-directional knowledge web where you can see not just what you are linking _to_, but what is linking _to you_.

### **How to see Backlinks**

1.  Open any note.
2.  Open the **Note Details & Tags** sidebar (click the sidebar icon in the top right of the editor).
3.  Scroll to the bottom of the sidebar to find the **Backlinks** section.
4.  Each backlink shows the note title, its tags, and when it was last modified. Click a backlink to jump directly to that note.

---

## 🕸️ Graph View

The Graph View provides a global, interactive visual map of your entire knowledge base. It uses force-directed physics to organize notes into logical clusters based on their connections.

### **Launching the Graph**

- **Dashboard**: Click the **Graph View** button in the main topbar.
- **Editor**: Click the **Graph** button in the note editor toolbar for a quick contextual view.

### **Interacting with the Graph**

- **Nodes**: Each circle represents a note. The size of the node reflects the length of the note content.
  - <span style="color: #3b82f6;">●</span> **Blue**: Standard notes.
  - <span style="color: #10b981;">●</span> **Green**: Task notes (notes with `task` or `todo` tags).
  - <span style="color: #f59e0b;">●</span> **Amber**: Important notes (notes with the `important` tag).
- **Edges**: Lines represent a link from one note to another. Moving particles show the direction of the relationship.
- **Search**: Use the built-in search bar inside the graph to find and focus on specific notes.
- **Zoom/Pan**: Use mouse controls or the dedicated UI buttons to navigate the knowledge map.
- **Navigation**: Click on any node to immediately open that note in the editor.

---

## 🛠️ Technical Background

- **Link Discovery**: The system scans your Tiptap JSON content for "File Links" created using the `/` command.
- **Visualization Engine**: Built using `react-force-graph-2d` with custom canvas rendering for premium performance and glow effects.
- **Real-time**: The graph updates automatically as you add links, tags, or create new notes.
