import { ResultsDashboard } from "./components/results-dashboard";

export default function ResultsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-16" id="main-content">
      <ResultsDashboard />
    </main>
  );
}
