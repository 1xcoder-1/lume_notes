# Prebuilt Templates

Lume Notes provides a library of professional prebuilt templates to help you structure your notes quickly. These templates include predefined titles, content, tags, and icons.

## Features

### 1. **Categorized Library**

Templates are organized into high-level categories for better organization:

- **Professional**: Templates for meetings, project plans, and team syncs.
- **Personal**: Daily journaling and reflection spaces.
- **Technical**: Structured formats for bug reports and documentation.
- **General**: Fast and messy brainstorm spaces.

### 2. **Automatic Tagging**

Each template comes with its own set of pre-assigned tags. When a note is created using a template, these tags (e.g., `["technical", "qa"]` for a Bug Report) are automatically injected and persisted, keeping your knowledge base organized from day one.

### 3. **Responsive Grid UI**

The template selection screen utilizes a responsive grid layout:

- **1 Column**: Mobile view for easy selecting on the go.
- **3 Columns**: Tablet and Desktop views for wide scannability and fast selection.

## Implementation Details

### Data Model

The template library is located at `apps/web/lib/templates.ts`. Each template follows the `Template` interface:

```typescript
export interface Template {
  id: string;
  title: string;
  description: string;
  icon: string; // Navigated via a mapping in page.tsx
  tags: string[];
  content: any; // Standard Tiptap JSON document structure
  category: "Professional" | "Personal" | "Technical" | "General";
}
```

### Persistence

The note creation process in `api/notes/route.ts` (POST) is configured to handle the `tags` array sent from the template. This ensures that the tags are saved in the Prisma database immediately upon creation.

## Extending the Library

### Adding a New Template

1. Create your template content in Tiptap format (or copy from an existing one).
2. Open `apps/web/lib/templates.ts` and add your new object to the `NOTE_TEMPLATES` array.
3. Assign a `category` and a supported `icon` name.

### Supported Icons

The `page.tsx` file handles the mapping of template strings to Lucide icons. Current supported icons include:

- `ClipboardList`
- `Calendar`
- `Briefcase`
- `Zap`
- `BookOpen`
- `FileText`
- `Bug`
- `Info`
- `Target`
- `ListTodo`
- `Rocket`
