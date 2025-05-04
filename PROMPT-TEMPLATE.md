# Gym Tracker - Prompt Template for New Chat Sessions

This document provides a template prompt that you can use to start new chat sessions with an AI assistant. This prompt will help the assistant understand the project context, history, and how to use the documentation files.

## Prompt Template

```
I'm working on a Gym Tracker application that helps users track their workouts, exercises, and fitness progress. The application has a React frontend and a Node.js/Express backend with MongoDB.

Please review the following documentation files to understand the project context and history:

1. CHANGES.md - Contains a chronological log of all significant changes made to the application, organized by date and category.

2. CHANGES-CHAT-LOG.md - Documents all previous interactions with AI assistants, including:
   - The original request
   - The assistant's understanding of the request
   - Actions taken by the assistant
   - Files that were edited

I'd like you to continue development on this project, maintaining the same code style, architecture, and documentation practices. When making changes:

1. Always update the CHANGES.md file with any significant modifications, following the established format. Make sure to:
   - Add changes under the current date (YYYY-MM-DD)
   - Create a new date section if one doesn't exist for today
   - Categorize changes appropriately (UI, Backend, Database, etc.)

2. Update the CHANGES-CHAT-LOG.md file for each interaction we have, documenting:
   - Add each new request under the current date (YYYY-MM-DD)
   - Create a new date section if one doesn't exist for today
   - What I asked
   - Your understanding of what I asked
   - The actions you took
   - Every file you edited

The application uses the following technologies and patterns:
- Frontend: React with Material-UI components
- Backend: Node.js/Express
- Database: MongoDB with Mongoose
- State Management: React hooks (useState, useEffect, useCallback)
- API Communication: Axios
- Soft Deletion: For preserving historical data while allowing "deletion"

My current task is: [DESCRIBE YOUR CURRENT TASK HERE]

Please help me with this task while maintaining the established documentation practices.
```

## How to Use This Template

1. Copy the template above.

2. Replace `[DESCRIBE YOUR CURRENT TASK HERE]` with a specific description of what you're working on.

3. Paste the modified prompt at the beginning of a new chat session with an AI assistant.

4. The assistant will use the CHANGES.md and CHANGES-CHAT-LOG.md files to understand the project history and continue development in a consistent manner.

## Example Task Descriptions

Here are some example task descriptions you might use:

- "Implementing authentication and user login functionality using JWT tokens."

- "Adding a statistics dashboard to visualize workout progress over time with charts and graphs."

- "Creating a mobile-responsive design for the workout tracking interface."

- "Implementing data export functionality to allow users to download their workout history as CSV or PDF."

- "Adding unit and integration tests for the backend API endpoints."

- "Optimizing database queries to improve application performance."

## Best Practices

1. Be specific about your current task and what you're trying to achieve.

2. Reference specific files or components if your task involves modifying existing code.

3. Mention any constraints or requirements that the assistant should be aware of.

4. If continuing a previous conversation, briefly summarize what was accomplished in the previous session.

5. Regularly review and clean up the documentation files to ensure they remain useful and manageable.

6. Ensure all changes are properly dated in both documentation files to maintain a clear chronological record.

By following this approach, you'll maintain a comprehensive record of your project's development and ensure consistent progress across different chat sessions.
