export const dynamic = "force-dynamic";

import { DashboardShell, Section } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < Math.min(n, arr.length)) {
    const i = randInt(0, copy.length - 1);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

export default function FeedbackPage() {
  const overall = randInt(68, 94);
  const stars = Math.max(3, Math.min(5, Math.round(overall / 20)));
  const strengths = sample(
    [
      "Clear problem decomposition and step-by-step reasoning.",
      "Strong communication of approach and trade-offs.",
      "Clean, readable code with meaningful names.",
      "Good use of time and iterative testing.",
      "Edge cases identified proactively.",
      "Efficient algorithm choice with sound complexity.",
    ],
    3
  );
  const improvements = sample(
    [
      "Add more inline test cases before final run.",
      "Explain space/time complexity earlier.",
      "Validate inputs and handle extreme bounds.",
      "Reduce small pauses by narrating thought process.",
      "Consider alternative data structures.",
      "Refactor to smaller helper functions.",
    ],
    3
  );
  const metrics = [
    { label: "Problem Solving", value: randInt(70, 95) },
    { label: "Code Quality", value: randInt(65, 92) },
    { label: "Communication", value: randInt(72, 96) },
    { label: "Speed", value: randInt(60, 90) },
  ];
  const suggestions = sample(
    [
      "Two Sum Variants",
      "Valid Parentheses",
      "Merge Intervals",
      "Binary Search Applications",
      "Top-K Elements",
      "Graph Traversal Basics",
      "Dynamic Programming: 1D",
    ],
    4
  );

  return (
    <DashboardShell title="Interview Feedback" actions={
      <div className="flex gap-2">
        <ButtonLink href="/student" size="sm">Back to Dashboard</ButtonLink>
      </div>
    }>
      <Section title="Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-white/15 bg-card/40">
            <CardHeader>
              <CardTitle>Overall Score</CardTitle>
              <CardDescription>Based on code, reasoning, and communication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-semibold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                {overall}
                <span className="text-xl align-top text-foreground/80">/100</span>
              </div>
              <div className="mt-3 text-yellow-400 text-lg">
                {"★".repeat(stars)}
                <span className="text-foreground/40">{"☆".repeat(5 - stars)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-card/40 md:col-span-2">
            <CardHeader>
              <CardTitle>Key Takeaways</CardTitle>
              <CardDescription>Highlights and areas to improve</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm uppercase tracking-wide text-foreground/70 mb-2">Strengths</div>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/90">
                    {strengths.map((s, i) => (<li key={i}>{s}</li>))}
                  </ul>
                </div>
                <div>
                  <div className="text-sm uppercase tracking-wide text-foreground/70 mb-2">Improvements</div>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/90">
                    {improvements.map((s, i) => (<li key={i}>{s}</li>))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Detailed Metrics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <Card key={i} className="border-white/15 bg-card/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{m.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-foreground/80">Score</span>
                  <span className="font-medium">{m.value}%</span>
                </div>
                <div className="h-2 w-full bg-white/10">
                  <div className="h-full bg-blue-600" style={{ width: `${m.value}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Suggested Next Steps">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-white/15 bg-card/40 lg:col-span-2">
            <CardHeader>
              <CardTitle>Practice Problems</CardTitle>
              <CardDescription>Handpicked based on today’s performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestions.map((t, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="text-sm">{t}</div>
                    <span className="text-xs text-muted-foreground">Difficulty: {["Easy","Medium","Medium","Hard"][randInt(0,3)]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-card/40">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Quick wins to level up</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 border border-white/10">Narrate your approach upfront, then refine details while coding.</div>
              <div className="p-3 border border-white/10">Write a few unit-style checks before the final run.</div>
              <div className="p-3 border border-white/10">Note complexity for each iteration or refactor.</div>
              <div className="pt-2">
                <div className="flex gap-2">
                  <ButtonLink href="/student" size="sm">Review Dashboard</ButtonLink>
                  <ButtonLink href="/student/interview" variant="outline" size="sm">Try Another Round</ButtonLink>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </DashboardShell>
  );
}