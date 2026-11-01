# Algebraic Geometry Grinder

A single-page React app for practising algebraic geometry. Signed-out visitors
see the landing page; signed-in users see their workspace.

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

The login dialog supports email/password account creation and sign-in, plus
Google and GitHub popup sign-in. The dashboard currently provides the layout
and empty states; problem sets and progress tracking are not implemented yet.
