# Backend: keep the CRM in step with new newsletter subscribers

**Repo:** `d5_management_system` · **Effort:** ~20 min · **Status:** not started

> **Most of this already exists.** `submitLeadMagnet()` in
> `contact-requests.service.ts` already does the find-or-create-contact half
> correctly. Do not write this from scratch — extract that half and reuse it.
> See "Reuse what is already there" below.

The existing 72 subscribers from engjellrraklli.com have been imported as a
one-off. 65 active ones are attached to a container Lead:

```
Lead  9003ac33-f841-4f24-b9eb-6f12842ce2b3
      title                "engjellrraklli.com Newsletter"
      source               "Newsletter"
      isProspect           true
      processingRestricted true
      contacts             65
```

New subscribers currently go only to the site database and Sender.net, so that
list starts drifting from the day of the import. This endpoint closes the gap.

The site side is already written and deployed. It sits inert until
`D5_SUBSCRIBER_SYNC_PATH` is set, so nothing posts into a 404 in the meantime.

---

## What the site will send

```http
POST /api/v1/contact-requests/public/newsletter
X-API-Key: <the existing PUBLIC_API_KEY>

{
  "email":  "reader@example.com",
  "source": "engjellrraklli.com newsletter"
}
```

Response: `201 { "success": true }`. Two fields only — the subscribe form
collects nothing else.

---

## What it should do

1. **Find or create the container Lead** by `title` + `source` as above. Do not
   create a Lead per subscriber; that would put 65 fake companies in the list.
   Reuse the existing row.

2. **Skip if the email is already a Contact.** Two of the original 72 already
   belonged to real leads, and re-pointing an existing contact at the newsletter
   container would destroy a real relationship to record a newsletter signup.
   Existing contact wins, always.

3. **Otherwise create the Contact** attached to that lead:

| Field | Value |
|---|---|
| `email` | lowercased |
| `firstName` / `lastName` | derived from the email local part (see below) |
| `leadId` | the container lead |
| `processingRestricted` | **`true`** |
| `notes` | `Imported from the engjellrraklli.com newsletter (subscribed <date>). Name inferred from the email address, not confirmed. Newsletter consent only, not sales outreach.` |

---

## Reuse what is already there

`submitLeadMagnet()` and this endpoint want the same contact behaviour and
different lead behaviour. Three differences, and each one is a reason the
newsletter cannot simply post to `public/lead-magnet`:

| | `submitLeadMagnet` today | newsletter needs |
|---|---|---|
| Lead | creates one per submission, titled after `company` | attach every subscriber to the single container lead |
| `isProspect` | `false`, appears in the main leads list | `true`, stays in the prospecting pool |
| `processingRestricted` | not set | `true` |

Reusing it unchanged would put one Lead per subscriber into your main leads
list, all sharing a title, none consent-guarded. That is worse than no sync.

The tidy version is to pull the shared part out into one private helper and let
the two public methods differ only where they should:

```ts
/** Find-or-create a contact by email and attach it to a lead. Shared by the
 *  lead-magnet download and the newsletter sync, which differ only in which
 *  lead they attach to and whether processing is restricted. */
private async attachContactToLead(opts: {
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  notes: string;
  leadId: string;
  restricted: boolean;
}) {
  const existing = await this.prisma.contact.findUnique({ where: { email: opts.email } });
  if (existing) return existing;      // never re-point an existing relationship
  return this.prisma.contact.create({
    data: {
      firstName: opts.firstName,
      lastName: opts.lastName,
      email: opts.email,
      companyName: opts.companyName,
      notes: opts.notes,
      leadId: opts.leadId,
      processingRestricted: opts.restricted,
    },
  });
}
```

`submitLeadMagnet` then keeps its current lead logic and calls the helper with
`restricted: false`. `submitNewsletter` finds-or-creates the container lead once
and calls the helper with `restricted: true`.

One thing not to do: take `restricted` from the request body. A public caller
must not be able to decide whether a consent guard applies. The route decides.

---

## `processingRestricted` is the part that matters

Set it to `true` on every contact this endpoint creates.

These people subscribed to a personal newsletter. They did not consent to
outreach from an agency, and this CRM runs cold campaigns and Linked Helper
prospecting. `processingRestricted` is documented in the schema as GDPR Art. 18
restriction and is genuinely enforced — `campaigns.service.ts` filters those
rows out of every send. It is the difference between a safeguard and a comment.

Note the trap: `isProspect: true` hides the lead from the main leads list, but
the schema also documents cold campaigns as *targeting* `isProspect=true`
segments. Hiding them is not protecting them. The restriction flag is what
protects them.

If consent is ever obtained, the existing privacy toggle in
`privacy.controller.ts` flips it back for a given email.

---

## Name derivation

The subscribe form collects an email and nothing else, so names are a guess.
Match what the import did so old and new rows look the same:

```ts
function deriveName(email: string) {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  const parts = email.split('@')[0]
    .split(/[._\-+]+/)
    // Digits are a birth year or a uniquifier, not part of a name. Leaving them
    // in produces "Jasmine0907", which reads as scraped junk.
    .map((t) => t.replace(/\d+/g, ''))
    .filter(Boolean);
  if (parts.length === 0) return { firstName: cap(email.split('@')[0]), lastName: '(unknown)' };
  if (parts.length === 1) return { firstName: cap(parts[0]), lastName: '(unknown)' };
  return { firstName: cap(parts[0]), lastName: parts.slice(1).map(cap).join(' ') };
}
```

29 of the 65 imported contacts have `(unknown)` as a surname. That is honest
rather than tidy, and the notes on every row say the name was inferred.

**Worth fixing at the source instead.** If the playbook gate asked for a first
name alongside the email, every subscriber from that point on would have a real
one. It is a high-intent action, so one extra field costs little. Say the word
and I will add it to the form on my side.

---

## Also

Same exposure as the other public write routes: API-key only, and it writes
rows. Give it the same throttle as `public/contact`, `public/staff-augmentation`
and `public/lead-magnet` — and see the note in `backend-playbook-leads.md` about
1000/min not being a meaningful limit on an unauthenticated endpoint.

---

## When it is live

Set `D5_SUBSCRIBER_SYNC_PATH` on the engjellrraklli.com container to
`contact-requests/public/newsletter` and redeploy. The site already has
`PUBLIC_API_BASE_URL` and `PUBLIC_API_KEY`, so nothing else is needed.

The call is best-effort by design: five second timeout, failures logged and
swallowed. A CRM briefly out of date is a small problem; a signup form that
errors because a downstream system is down is a real one.
