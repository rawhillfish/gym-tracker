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

My current task is: 'Update Template' button on edit workout template does not do anything' Here is console log: 'WorkoutBuilder.js:86 ===== SAVE TEMPLATE DEBUG =====
WorkoutBuilder.js:87 Current selectedExercises: (4) [{…}, {…}, {…}, {…}]
WorkoutBuilder.js:101 Saving exercise: Deadlift, ID: temp-exercise-0-1746343268866, sets: 5, reps: 5
WorkoutBuilder.js:101 Saving exercise: Bench Press, ID: temp-exercise-1-1746343268867, sets: 5, reps: 10
WorkoutBuilder.js:101 Saving exercise: Seal Barbell Row, ID: temp-exercise-2-1746343268867, sets: 5, reps: 10
WorkoutBuilder.js:101 Saving exercise: Bulgarian Split Squat, ID: temp-exercise-3-1746343268867, sets: 5, reps: 10
WorkoutBuilder.js:110 Template data: {
  "name": "2DFB Deadlift",
  "description": "",
  "exercises": [
    {
      "_id": "temp-exercise-0-1746343268866",
      "name": "Deadlift",
      "category": "Back",
      "sets": 5,
      "reps": 5
    },
    {
      "_id": "temp-exercise-1-1746343268867",
      "name": "Bench Press",
      "category": "Chest",
      "sets": 5,
      "reps": 10
    },
    {
      "_id": "temp-exercise-2-1746343268867",
      "name": "Seal Barbell Row",
      "category": "Back",
      "sets": 5,
      "reps": 10
    },
    {
      "_id": "temp-exercise-3-1746343268867",
      "name": "Bulgarian Split Squat",
      "category": "Legs (Glutes)",
      "sets": 5,
      "reps": 10
    }
  ]
}
WorkoutBuilder.js:111 ===== END SAVE TEMPLATE DEBUG =====
WorkoutBuilder.js:114 Updating existing template: 681708c2dcb707deeba2f3fb
api.js:57 API Request [PUT]: /api/workout-templates/681708c2dcb707deeba2f3fb
api.js:154 
            
            
           PUT http://localhost:5000/api/workout-templates/681708c2dcb707deeba2f3fb 400 (Bad Request)
dispatchXhrRequest @ xhr.js:195
xhr @ xhr.js:15
dispatchRequest @ dispatchRequest.js:51
Promise.then
_request @ Axios.js:163
request @ Axios.js:40
httpMethod @ Axios.js:226
wrap @ bind.js:5
updateWorkoutTemplate @ api.js:154
handleSaveTemplate @ WorkoutBuilder.js:116
callCallback @ react-dom.development.js:4164
invokeGuardedCallbackDev @ react-dom.development.js:4213
invokeGuardedCallback @ react-dom.development.js:4277
invokeGuardedCallbackAndCatchFirstError @ react-dom.development.js:4291
executeDispatch @ react-dom.development.js:9041
processDispatchQueueItemsInOrder @ react-dom.development.js:9073
processDispatchQueue @ react-dom.development.js:9086
dispatchEventsForPlugins @ react-dom.development.js:9097
(anonymous) @ react-dom.development.js:9288
batchedUpdates$1 @ react-dom.development.js:26179
batchedUpdates @ react-dom.development.js:3991
dispatchEventForPluginEventSystem @ react-dom.development.js:9287
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ react-dom.development.js:6465
dispatchEvent @ react-dom.development.js:6457
dispatchDiscreteEvent @ react-dom.development.js:6430
api.js:112 API Client Error: {status: 400, data: {…}, url: '/api/workout-templates/681708c2dcb707deeba2f3fb', method: 'put'}
(anonymous) @ api.js:112
Promise.then
_request @ Axios.js:163
request @ Axios.js:40
httpMethod @ Axios.js:226
wrap @ bind.js:5
updateWorkoutTemplate @ api.js:154
handleSaveTemplate @ WorkoutBuilder.js:116
callCallback @ react-dom.development.js:4164
invokeGuardedCallbackDev @ react-dom.development.js:4213
invokeGuardedCallback @ react-dom.development.js:4277
invokeGuardedCallbackAndCatchFirstError @ react-dom.development.js:4291
executeDispatch @ react-dom.development.js:9041
processDispatchQueueItemsInOrder @ react-dom.development.js:9073
processDispatchQueue @ react-dom.development.js:9086
dispatchEventsForPlugins @ react-dom.development.js:9097
(anonymous) @ react-dom.development.js:9288
batchedUpdates$1 @ react-dom.development.js:26179
batchedUpdates @ react-dom.development.js:3991
dispatchEventForPluginEventSystem @ react-dom.development.js:9287
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ react-dom.development.js:6465
dispatchEvent @ react-dom.development.js:6457
dispatchDiscreteEvent @ react-dom.development.js:6430
WorkoutBuilder.js:143 Error saving workout template: AxiosError {message: 'Request failed with status code 400', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
handleSaveTemplate @ WorkoutBuilder.js:143
await in handleSaveTemplate
callCallback @ react-dom.development.js:4164
invokeGuardedCallbackDev @ react-dom.development.js:4213
invokeGuardedCallback @ react-dom.development.js:4277
invokeGuardedCallbackAndCatchFirstError @ react-dom.development.js:4291
executeDispatch @ react-dom.development.js:9041
processDispatchQueueItemsInOrder @ react-dom.development.js:9073
processDispatchQueue @ react-dom.development.js:9086
dispatchEventsForPlugins @ react-dom.development.js:9097
(anonymous) @ react-dom.development.js:9288
batchedUpdates$1 @ react-dom.development.js:26179
batchedUpdates @ react-dom.development.js:3991
dispatchEventForPluginEventSystem @ react-dom.development.js:9287
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ react-dom.development.js:6465
dispatchEvent @ react-dom.development.js:6457
dispatchDiscreteEvent @ react-dom.development.js:6430
WorkoutBuilder.js:144 Error details: {message: 'WorkoutTemplate validation failed: exercises.0._id…ises.3.exerciseId: Path `exerciseId` is required.'}
handleSaveTemplate @ WorkoutBuilder.js:144
await in handleSaveTemplate
callCallback @ react-dom.development.js:4164
invokeGuardedCallbackDev @ react-dom.development.js:4213
invokeGuardedCallback @ react-dom.development.js:4277
invokeGuardedCallbackAndCatchFirstError @ react-dom.development.js:4291
executeDispatch @ react-dom.development.js:9041
processDispatchQueueItemsInOrder @ react-dom.development.js:9073
processDispatchQueue @ react-dom.development.js:9086
dispatchEventsForPlugins @ react-dom.development.js:9097
(anonymous) @ react-dom.development.js:9288
batchedUpdates$1 @ react-dom.development.js:26179
batchedUpdates @ react-dom.development.js:3991
dispatchEventForPluginEventSystem @ react-dom.development.js:9287
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ react-dom.development.js:6465
dispatchEvent @ react-dom.development.js:6457
dispatchDiscreteEvent @ react-dom.development.js:6430
'

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
