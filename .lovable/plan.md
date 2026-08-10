# Admin users: where to add them, and fixing the invite flow

## Where you add people today

Admin > **People** (`/admin/people`), visible only to owners and admins. It has three parts:

- **Invite someone** — email + role (owner, admin, editor, contributor, viewer)
- **Accounts** — change anyone's role, or remove their access
- **Pending invitations** — resend or revoke

## Does the invite flow work?

Partly. Here is what actually happens today when you invite someone:

1. A row is written to the `invitations` table with their email and role. This part works.
2. The app then sends a **password-reset** email to that address.
3. On first sign-in, the database matches their email to the invitation and grants the role. This part works.

The break is step 2. A password reset only reaches people who **already have an account**. There is no sign-up screen anywhere in the app, so a brand-new colleague has no account, receives no usable email, and has no way to create one. The invitation just sits in "Pending" forever. Inviting someone who already has an account works fine — it behaves as a role grant plus a password reset.

Second issue: the reset email is sent from the browser, so a wrong or non-existent address still shows "Invitation sent". You get no signal that nothing arrived.

## The fix

Create the account server-side at invite time, using the backend's admin privileges, and send a real invitation email that lands on the existing "Set a new password" screen.

- New server function `inviteAdminUser` — verifies the caller is an owner/admin, then:
  - creates (or finds) the auth account for that email
  - sends the official invite email pointing to `/admin/reset-password`
  - writes/refreshes the `invitations` row with the chosen role
- **Resend** in Pending invitations uses the same path, so it also works for people who never signed in.
- The People screen reports real outcomes: a genuine error if the email cannot be sent, instead of an always-green toast.
- Once the recipient sets a password on `/admin/reset-password`, they sign in at `/admin/login` and their invited role is applied automatically on first load — no change needed there.

### Resulting experience for a new person

1. You invite `name@cevons.com` as, say, Editor.
2. They receive an email, click it, land on "Set a new password", choose one.
3. They are taken into the admin with Editor permissions already applied.

## Technical notes

- New file `src/lib/adminPeople.functions.ts` using `createServerFn` with `requireSupabaseAuth`; role check runs through `context.supabase` against `user_roles` before any privileged call, and the service-role client is imported inside the handler.
- Uses `auth.admin.inviteUserByEmail` with `redirectTo` = `<origin>/admin/reset-password`; falls back to a recovery link for addresses that already exist.
- `src/routes/admin.people.tsx`: the invite and resend mutations call the server function instead of `supabase.auth.resetPasswordForEmail`; direct client inserts into `invitations` are removed.
- No database migration required — `invitations`, `claim_invitation`, and the role RPCs already exist and are correct.

## One dependency

Invitation emails only actually send once the backend's email sending is active for your domain. If that is still pending, the flow will be correct but the emails will not leave until it is set up — worth confirming before we test end to end.
