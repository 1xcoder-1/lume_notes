# Note Sharing Feature

The sharing feature lets you work with others by making your notes accessible to team members or outside users through secure, public links.

## How it works

Every note has its own shared settings. You can generate a unique public link that allows anyone to view the note in a beautiful, high-fidelity format.

## Key Actions

1.  **Invite Users**: Add another person's email to give them access to the editor.
2.  **Public Link**: Create a secure URL that anyone with the link can view.
3.  **Permissions**: Control who can read and who can edit your note within the team.
4.  **Premium Public View**: The public share page features a professional design with a sticky header, author info, and smart tags.

## New Sharing Features

- **Light & Dark Mode**: The public share page includes a toggle for viewers to switch between light, dark, and system themes.
- **Consistent Design**: We've updated the share page to use the exact same styling as the real editor. This means your notes will look identical to viewers, with perfect typography and formatting.
- **Improved Privacy**: Removed public view counts from the share menu for a more professional and private sharing experience.
- **Checklist Support**: Full support for checklists and complex formatting in the public view.

## Technical Details

- **Modal Component**: `apps/web/components/share-modal.tsx`
- **Public Route**: `apps/web/app/s/[token]/page.tsx`
- **HTML Generator**: `apps/web/lib/export-utils.ts` (using `jsonToHtml`)
- **Styles**: `apps/web/components/note-styles.css` (imported on the share page)
