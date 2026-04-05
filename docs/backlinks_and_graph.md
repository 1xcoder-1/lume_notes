# Backlinks & Graph View

Lume Notes features a powerful knowledge mapping system that visualizes how your notes are interconnected.

## 🔗 Backlinks

Backlinks show you every note that mentions or links to the current note you are viewing.

### **How to see Backlinks**

1.  Open any note.
2.  Open the **Note Details & Tags** sidebar (click the sidebar icon in the top right of the editor).
3.  Scroll to the bottom of the sidebar to find the **Backlinks** section.
4.  Each backlink shows the note title, its tags, and when it was last modified. Click a backlink to jump directly to that note.

---

## 🕸️ Graph View

The Graph View provides a global, interactive visual map of your entire knowledge base.

### **Launching the Graph**

1.  In the main dashboard topbar, click the **Graph View** button (it has a pulsing primary indicator).
2.  A full-screen interactive visualization will open.

### **Interacting with the Graph**

- **Nodes**: Each circle represents a note.
  - **Blue nodes**: Standard notes.
  - **Green nodes**: Task notes (notes with a `status:` tag).
- **Edges**: Lines represent a link from one note to another.
- **Zooming**: Use your mouse wheel or the UI controls (Zoom In/Out) to navigate.
- **Panning**: Click and drag the background to move around.
- **Navigation**: Click on any node to immediately open that note in the editor.

---

## 🛠️ Technical Background

- **Link Discovery**: The system scans your note content for "File Links" created using the `/` command.
- **Visualization**: Built using `react-force-graph-2d` for smooth, physics-based interactions.
- **Real-time**: The graph updates automatically as you add links or create new notes.
