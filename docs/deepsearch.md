# Deep Search Feature

Our search helps you find exactly what you need, even if you have hundreds of notes. It scans through your titles and content to find matches.

## How it works
The search bar at the top of the app listens as you type and instantly shows you matching notes based on keywords.

## Key Features
1. **Realtime**: Results update as you type.
2. **Deep Look**: Searches not just note titles, but also the text inside them.
3. **Recent Results**: Shows your most recently opened notes by default.
4. **Quick Navigation**: Open any note instantly with one click.

## Technical Details
- **Location**: `apps/web/components/search-bar.tsx`.
- **Backend API**: Connects to the `/api/notes/search` route.
- **Database**: Uses Prisma's text search capabilities to scan the SQL database.

## Note for others
To improve the search, you can add filters (like by date) to the search input. You can update the `SearchBar` component to include options for filtering by tags or organizations.
