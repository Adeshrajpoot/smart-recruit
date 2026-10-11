# Candidate interview data persistence fix

## Why the recruiter page showed zero

The personalized interview's previous `handleFinalSubmit` only stored a small completion summary in browser `localStorage`. It never sent the questions, selected answers, or monitoring values to the backend. The recruiter candidates endpoint reads MongoDB, so it had no record to show.

## New behavior

1. Candidate submission calls `POST /api/profile/interview/submit` with a session id, the questions and selected answers, and aggregate proctoring values.
2. The backend verifies the candidate token/role and saves the result to MongoDB as `CandidateInterviewResult`.
3. The candidate is sent to the completion page only after the backend save succeeds. If saving fails, the candidate sees an error and can retry.
4. Recruiter dashboard and candidates page retrieve saved submissions through `/api/recruiter/dashboard` and `/api/recruiter/candidates`. They refresh every 15 seconds.
5. Selecting a candidate opens their saved answers and proctoring summary; recruiters can save a decision and note. Automated scoring is not added by this change, so score fields remain empty instead of inventing a score.

## Previously completed test

The old frontend stored only a summary. When the candidate opens/reloads the old completion page on this updated project while still logged in, the page calls `POST /api/profile/interview/submit-summary` and imports that summary into MongoDB. Individual answers cannot be restored from that old summary because they were never saved. To get a complete answer-by-answer record, the candidate must submit a test using the updated frontend.

## Setup / verification

Update the frontend and backend together, configure `backend/.env` with `MONGO_URI` and `JWT_SECRET`, install dependencies, then restart the backend and frontend. Confirm the candidate has a valid login token and submit the test. The backend must be connected to the same MongoDB database used by the recruiter dashboard. The local source checks passed, but a live MongoDB test was not possible here.

## Multi-recruiter scope note

The current personalized-interview flow has no drive/recruiter assignment field, so the new results are surfaced in the shared recruiter workspace. Before deploying to multiple unrelated recruiter tenants, link each test to a drive/invitation and enforce ownership checks in the result and review endpoints.
