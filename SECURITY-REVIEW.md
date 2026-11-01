# Security Review

## Summary

The current scaffold contains no service-account key or environment-secret file in the files reviewed for the initial push. The Firebase web configuration in `src/firebase.ts` and the project ID in `.firebaserc` are client-visible configuration, not server credentials. Firebase web API keys are not authorization tokens; rely on Firebase security rules and appropriate API-key restrictions to protect services.

## Finding

### Medium: Firebase service-account secret is available to same-repository pull requests

**File:** `.github/workflows/firebase-hosting-pull-request.yml`  
**Lines:** 5, 12, 20

The `pull_request` workflow deploys a preview using `FIREBASE_SERVICE_ACCOUNT_ALG_GEO_GRINDER`. Its condition excludes fork pull requests but allows pull requests from branches in the same repository. A contributor able to modify a pull request can change workflow-controlled code and potentially expose or misuse the service account's permissions.

**Recommendation:** Do not provide privileged credentials to pull-request-controlled code. Require approval through a protected GitHub environment before deployment, or use a separate least-privilege credential and ensure untrusted pull-request changes cannot access it.

**Confidence:** 9/10
