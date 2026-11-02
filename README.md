# Algebraic Geometry Grinder

A single-page React app for practising algebraic geometry. Visitors see the
landing page and can sign in to access the exercise workspace.

## Development

```sh
npm install
npm run dev
```

Check the frontend before deploying:

```sh
npm run lint
npm run build
```

The production build is written to `dist`, which is the Firebase Hosting public
directory.

## Firebase Authentication

The Firebase web app configuration is in `src/firebase.ts`. It is public client
configuration, not a server credential.

In Firebase Console, enable Email/Password, Google, and GitHub under
**Authentication → Sign-in method**. Configure the GitHub OAuth application
using the callback URL shown by Firebase, and add local and deployed app
domains under **Authentication → Settings → Authorized domains**. Provider
client secrets belong in the Firebase Console, never in this repository.

## Exercise workspace

Exercise content is loaded from `src/exercises` at build time. Add `.tex` files
using this directory structure:

```text
src/exercises/<book>/<chapter>/<section>/<exercise>.tex
```

The book directory must be `hartshorne` or `vakil`. Hartshorne exercise
filenames use underscores to separate the exercise number (for example
`1_1.tex` displays as exercise `1.1`). Vakil exercise filenames are shown
directly (for example `A.tex` displays as exercise `A`). Chapter, section, and
exercise selectors are populated from the available files.

The answer editor accepts prose with inline `$...$` and display `$$...$$`
math, rendered live with KaTeX. An authenticated user's answers are stored in
Firestore at `users/{uid}/exercises/{exerciseId}`, where `exerciseId` is the
URL-encoded exercise source path relative to `src/exercises`.

## Exercise sources and rights

The app is intended to remain noncommercial. Source and rights information is
shown next to each exercise statement, rather than relying only on a site-wide
footer.

Vakil exercise statements are attributed to Ravi Vakil's *The Rising Sea:
Foundations of Algebraic Geometry* notes, with a link to the cited notes version
and the CC BY-NC-ND 3.0 license. The statements are presented as unmodified
text. This license permits noncommercial sharing subject to its terms; it does
not permit distributing modified material.

Hartshorne exercise statements are identified by their book and exercise
reference. This project reproduces selected exercise statements only, not the
book's explanatory text, and does so for noncommercial educational purposes.

Each document contains `answer`, `bookId`, `chapter`, `section`,
`exerciseLabel`, and `updatedAt`. The app creates a document with an empty
answer the first time an exercise is opened, then saves edits after three
seconds without typing. Saves compare the stored answer to the version loaded
in the current session. If another session has changed it, the user can choose
the saved version or keep their local version; choosing local performs another
transactional comparison before overwriting.

### Exercise grading

The submit button is enabled only when the non-empty answer has finished saving.
It calls the authenticated `gradeExercise` callable in `europe-west1` with only
the exercise ID. The function resolves the prompt from a server-generated
manifest and reads the saved answer from the caller's own Firestore document.
It creates an isolated OpenAI Agents API session from the saved grader agent,
requests a structured verdict and feedback, validates the response, and then
checks transactionally that the answer did not change before storing the result.
The per-submission session is deleted after the grading run.

Latest grading state is stored on the answer document as `solved`,
`lastVerdict`, `lastFeedback`, `lastGradedAt`, and `gradingMode`. Client writes
cannot change these server-managed fields. The interface tells users that their
answer and the exercise prompt are sent to OpenAI for grading; AI verdicts may
be incorrect.

The OpenAI API key must be stored as a Firebase Functions secret, not committed
or bundled into the frontend. Set it at the secure CLI prompt, then build
Functions to regenerate the prompt manifest from `src/exercises`:

```sh
firebase functions:secrets:set OPENAI_API_KEY
npm --prefix functions run build
npm --prefix functions run lint
```

The grader uses the saved agent ID configured in `functions/src/index.ts`.
Create an API key with permission to read the saved agent and create agent
sessions, then deploy the callable and rules:

```sh
firebase deploy --only functions:gradeExercise,firestore:rules
```

The rules allow only authenticated users to access their own answer documents,
validate the document shape and answer size, prevent exercise metadata changes,
and deny all other reads, writes, and deletes. Review the rules for your
production needs before deployment.
