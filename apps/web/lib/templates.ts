import {
  FileText,
  ClipboardList,
  Briefcase,
  Info,
  Calendar,
  Zap,
  BookOpen,
  Bug,
  Target,
  ListTodo,
  Rocket,
} from "lucide-react";

export interface Template {
  id: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  content: any;
  category: "Professional" | "Personal" | "Technical" | "General";
}

export const NOTE_TEMPLATES: Template[] = [
  {
    id: "meeting-notes",
    title: "Meeting Notes",
    description: "Structure for organized meeting summaries and action items.",
    icon: "ClipboardList",
    tags: ["meeting", "internal"],
    category: "Professional",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Meeting Notes: [Project Name]" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Date: ", marks: [{ type: "bold" }] },
            { type: "text", text: "[Insert Date]" },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Participants: ", marks: [{ type: "bold" }] },
            { type: "text", text: "[Names]" },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Objectives" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Objective 1" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Objective 2" }],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Discussion Points" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Summarize the key discussion points here...",
            },
          ],
        },
        { type: "horizontalRule" },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Action Items" }],
        },
        {
          type: "taskList",
          content: [
            {
              type: "taskItem",
              attrs: { checked: false },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Action item 1" }],
                },
              ],
            },
            {
              type: "taskItem",
              attrs: { checked: false },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Action item 2" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "weekly-sync",
    title: "Weekly Sync",
    description:
      "Keep track of team progress, blockers, and next week's focus.",
    icon: "Calendar",
    tags: ["sync", "weekly"],
    category: "Professional",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Weekly Sync: [Team Name]" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "✅ Last Week Recap" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Wins and accomplishments..." },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "🛑 Blockers" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Anything slowing the team down?" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "🎯 Next Week Focus" }],
        },
        {
          type: "taskList",
          content: [
            {
              type: "taskItem",
              attrs: { checked: false },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Priority item 1" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "project-plan",
    title: "Project Plan",
    description:
      "A comprehensive roadmap for your project goals and milestones.",
    icon: "Briefcase",
    tags: ["planning", "project"],
    category: "Professional",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Project Plan: [Project Name]" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "[Brief overview of the project and its goals]",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "🎯 Success Metrics" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Metric 1" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Metric 2" }],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "📅 Timeline & Milestones" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Phase 1: Research - [Date]" },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Phase 2: Development - [Date]" },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Phase 3: Launch - [Date]" }],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "🛠 Resources Needed" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "List tools, budget, and team members required...",
            },
          ],
        },
      ],
    },
  },
  {
    id: "brainstorm",
    title: "Quick Brainstorm",
    description: "A messy space for fast ideas and raw creative output.",
    icon: "Zap",
    tags: ["ideas", "creative"],
    category: "General",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Brainstorm: [Topic]" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Dumping ground for raw thoughts and inspirations...",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "💡 Crazy Ideas" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "No filter allowed here!" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "📌 Key Takeaways" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "..." }] },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "personal-journal",
    title: "Daily Journal",
    description: "Reflection space for daily thoughts and personal growth.",
    icon: "BookOpen",
    tags: ["personal", "reflection"],
    category: "Personal",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Journal: [Date]" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "How am I feeling today?" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Reflection on mood and energy..." }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "🙏 Gratitude" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "One thing I'm grateful for..." },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "🌟 Main Goal for Tomorrow" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "What's the one thing that will make tomorrow a win?",
            },
          ],
        },
      ],
    },
  },
  {
    id: "sop",
    title: "SOP / Procedure",
    description: "Step-by-step instructions for routine operations.",
    icon: "FileText",
    tags: ["sop", "process"],
    category: "Professional",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "SOP: [Procedure Name]" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Owner: ", marks: [{ type: "bold" }] },
            { type: "text", text: "[Department/Person]" },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Purpose" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Explain why this procedure exists..." },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Steps" }],
        },
        {
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Step 1: Description" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Step 2: Description" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "bug-report",
    title: "Bug Report",
    description: "A structured format for reporting software issues.",
    icon: "Bug",
    tags: ["technical", "qa"],
    category: "Technical",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Bug: [Brief Description]" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "📍 Environment" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "OS, Browser, App Version..." }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "🔄 Steps to Reproduce" }],
        },
        {
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Navigate to..." }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Click on..." }],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "❌ Expected vs. Actual" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Expected: [What should happen]\nActual: [What actually happened]",
            },
          ],
        },
      ],
    },
  },
  {
    id: "documentation",
    title: "Technical Docs",
    description: "Complete structure for features or systems.",
    icon: "Info",
    tags: ["docs", "technical"],
    category: "Technical",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Documentation: [Feature Name]" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Overview of the feature, its purpose, and its architecture.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "🚀 Getting Started" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Instructions for setup or usage..." },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "🧩 Architecture" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Description of components, data flow, and services.",
            },
          ],
        },
      ],
    },
  },
];
