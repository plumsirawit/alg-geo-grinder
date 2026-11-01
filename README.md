# Algebraic Geometry Grinder

A single-page React app for practising algebraic geometry. The app currently
opens directly to the workspace while authentication is being prototyped.

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

The answer editor renders LaTeX live with KaTeX. Answers currently remain in
memory only and are not saved to a database. The workspace is shown without
requiring authentication during this UI prototype.
