import { IntakeWizard } from "./intake-wizard";

export default function IntakePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 pb-24 pt-16" id="main-content">
      <header className="space-y-4 text-balance">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Intake</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Tell us the essentials</h1>
        <p className="text-base text-muted-foreground">
          Complete three quick steps so Starlens can personalize your reading. Progress saves locally
          and you can edit any step before submitting.
        </p>
      </header>

      <IntakeWizard />
    </main>
  );
}
