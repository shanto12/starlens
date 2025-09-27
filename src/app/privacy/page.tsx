import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const policySections = [
  {
    title: "What we collect",
    points: [
      "Birth details, names, focus areas, and optional boosters you provide.",
      "Usage analytics in aggregate (no personal identifiers).",
      "Support conversations if you contact us directly.",
    ],
  },
  {
    title: "How we use it",
    points: [
      "Generate your reading and optional boosters in-memory.",
      "Return results to your browser session and allow export.",
      "Improve accuracy through anonymized patterns (opt in only).",
    ],
  },
  {
    title: "How we store it",
    points: [
      "We do not persist readings by default. Session data clears automatically.",
      "If you opt into saved readings, we encrypt at rest with rotating keys.",
      "We never share data with advertisers or data brokers.",
    ],
  },
  {
    title: "Your controls",
    points: [
      "Delete a reading in one click. No backups retained.",
      "Download a machine-readable JSON copy any time.",
      "Contact privacy@starlens.app for questions or full account removal.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 pb-24 pt-16" id="main-content">
      <header className="space-y-4 text-balance">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Privacy first</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Your data, your choice</h1>
        <p className="text-base text-muted-foreground">
          Starlens is built for private, short-lived guidance. We only process the details you
          volunteer and secure every request with modern encryption in transit.
        </p>
      </header>

      <section className="flex flex-col gap-6">
        {policySections.map((section) => (
          <Card key={section.title} className="px-6 py-6">
            <CardTitle>{section.title}</CardTitle>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {section.points.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>

      <Card className="bg-primary/10 px-6 py-6 text-sm text-foreground">
        <CardTitle>Data deletion</CardTitle>
        <CardDescription className="mt-2 text-muted-foreground">
          Use the in-app Delete my data button to clear your reading and session history instantly.
          We propagate deletion requests to optional storage within 24 hours.
        </CardDescription>
        <CardDescription className="mt-4 text-muted-foreground">
          Need help? Email <a className="underline" href="mailto:privacy@starlens.app">privacy@starlens.app</a>.
        </CardDescription>
      </Card>
    </main>
  );
}
