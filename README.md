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

Each document contains `answer`, `bookId`, `chapter`, `section`,
`exerciseLabel`, and `updatedAt`. The app creates a document with an empty
answer the first time an exercise is opened, then saves edits after three
seconds without typing. Saves compare the stored answer to the version loaded
in the current session. If another session has changed it, the user can choose
the saved version or keep their local version; choosing local performs another
transactional comparison before overwriting.

Deploy the owner-scoped Firestore rules in `firestore.rules` before using the
database in a deployed app:

```sh
npx firebase-tools deploy --only firestore:rules
```

The rules allow only authenticated users to access their own answer documents,
validate the document shape and answer size, prevent exercise metadata changes,
and deny all other reads, writes, and deletes. Review the rules for your
production needs before deployment.
