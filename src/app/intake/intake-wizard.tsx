'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { goals as goalValues, horizonSchema, readingRequestSchema } from "@/lib/schemas/reading";
import type { Goal } from "@/lib/types/reading";
import { useIntakeStore } from "@/store/intake-store";
import { useReadingStore } from "@/store/results-store";

const steps = [
  { id: 0, label: "Birth", description: "Birth details and current location" },
  { id: 1, label: "Names", description: "Birth certificate and current name" },
  { id: 2, label: "Focus", description: "Goals, horizon, optional boosters" },
] as const;

type BirthFormValues = {
  birthDate: string;
  birthTime?: string;
  timeUnknown: boolean;
  birthCity: string;
  birthCountry: string;
  currentCity: string;
  currentCountry?: string;
  timezone?: string;
};

const birthSchema = z
  .object({
    birthDate: z.string().min(1, "Birth date is required"),
    birthTime: z.string().optional(),
    timeUnknown: z.boolean().default(false),
    birthCity: z.string().min(1, "Birth city is required"),
    birthCountry: z.string().min(1, "Birth country is required"),
    currentCity: z.string().min(1, "Current city is required"),
    currentCountry: z.string().optional(),
    timezone: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.timeUnknown && !value.birthTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide a birth time or select time unknown",
        path: ["birthTime"],
      });
    }
  });

type NameFormValues = {
  birthName?: string;
  currentName?: string;
};

const nameSchema = z.object({
  birthName: z.string().optional(),
  currentName: z.string().optional(),
});

type FocusFormValues = {
  goals: Goal[];
  horizonMonths: z.infer<typeof horizonSchema>;
  datePicks: boolean;
  relocationEnabled: boolean;
  relocationInput: string;
  relocationList: string[];
  questionEnabled: boolean;
  question: string;
  homeEnabled: boolean;
  facingDegrees: string;
  moveInYear: string;
};

const focusSchema = z
  .object({
    goals: z.array(z.enum(goalValues)).min(1, "Select at least one goal").max(3, "Select up to three goals"),
    horizonMonths: horizonSchema,
    datePicks: z.boolean().default(false),
    relocationEnabled: z.boolean().default(false),
    relocationInput: z.string().optional(),
    relocationList: z.array(z.string()).max(3),
    questionEnabled: z.boolean().default(false),
    question: z.string().max(280, "Keep questions under 280 characters").optional(),
    homeEnabled: z.boolean().default(false),
    facingDegrees: z.string().optional(),
    moveInYear: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.relocationEnabled && value.relocationList.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one city",
        path: ["relocationInput"],
      });
    }
    if (value.questionEnabled && !value.question) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter your question",
        path: ["question"],
      });
    }
    if (value.homeEnabled && !value.facingDegrees) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a compass facing",
        path: ["facingDegrees"],
      });
    }
      if (value.homeEnabled && value.facingDegrees) {
        const degrees = Number(value.facingDegrees);
        if (Number.isNaN(degrees) || degrees < 0 || degrees > 359) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Enter a value between 0 and 359",
            path: ["facingDegrees"],
          });
        }
      }
      if (value.homeEnabled && value.moveInYear) {
        const moveYear = Number(value.moveInYear);
        if (Number.isNaN(moveYear) || moveYear < 1900 || moveYear > 2200) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Enter a year between 1900 and 2200",
            path: ["moveInYear"],
          });
        }
      }
  });

function detectedTimezone() {
  if (typeof Intl !== "undefined") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return undefined;
}

export function IntakeWizard() {
  const router = useRouter();
  const { data, activeStep, update, setGoals, setActiveStep } = useIntakeStore((state) => ({
    data: state.data,
    activeStep: state.activeStep,
    update: state.update,
    setGoals: state.setGoals,
    setActiveStep: state.setActiveStep,
  }));
  const setReading = useReadingStore((state) => state.setReading);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const birthForm = useForm<BirthFormValues>({
    resolver: zodResolver(birthSchema),
    mode: "onBlur",
    defaultValues: {
      birthDate: data.birth.date,
      birthTime: data.birth.time,
      timeUnknown: data.birth.timeUnknown,
      birthCity: data.birth.city,
      birthCountry: data.birth.country,
      currentCity: data.current.city,
      currentCountry: data.current.country,
      timezone: data.timezone ?? detectedTimezone(),
    },
  });

  const nameForm = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    mode: "onBlur",
    defaultValues: {
      birthName: data.names.birthName,
      currentName: data.names.currentName,
    },
  });

  const focusForm = useForm<FocusFormValues>({
    resolver: zodResolver(focusSchema),
    mode: "onChange",
    defaultValues: {
      goals: data.goals,
      horizonMonths: data.horizonMonths,
      datePicks: data.options.datePicks,
      relocationEnabled: data.options.relocation.length > 0,
      relocationInput: "",
      relocationList: data.options.relocation,
      questionEnabled: Boolean(data.options.question),
      question: data.options.question ?? "",
      homeEnabled: Boolean(data.options.home.facingDegrees || data.options.home.moveInYear),
      facingDegrees: data.options.home.facingDegrees?.toString() ?? "",
      moveInYear: data.options.home.moveInYear?.toString() ?? "",
    },
  });

  const selectedGoals = focusForm.watch('goals');
  const selectedHorizon = focusForm.watch('horizonMonths');
  const relocationEnabled = focusForm.watch('relocationEnabled');
  const relocationList = focusForm.watch('relocationList');
  const questionEnabled = focusForm.watch('questionEnabled');
  const homeEnabled = focusForm.watch('homeEnabled');

  const currentStep = steps[activeStep] ?? steps[0];
  const progress = ((activeStep + 1) / steps.length) * 100;

  const handleBirthSubmit = birthForm.handleSubmit((values) => {
    update({
      birth: {
        date: values.birthDate,
        time: values.timeUnknown ? "" : values.birthTime,
        timeUnknown: values.timeUnknown,
        city: values.birthCity,
        country: values.birthCountry,
      },
      current: {
        city: values.currentCity,
        country: values.currentCountry ?? "",
      },
      timezone: values.timezone,
    });
    setActiveStep(1);
  });

  const handleNamesSubmit = nameForm.handleSubmit((values) => {
    update({
      names: {
        birthName: values.birthName ?? "",
        currentName: values.currentName ?? "",
      },
    });
    setActiveStep(2);
  });

  const handleSkipNames = () => {
    update({
      names: {
        birthName: "",
        currentName: "",
      },
    });
    setActiveStep(2);
  };

  const handleFocusSubmit = focusForm.handleSubmit(async (values) => {
    setSubmitError(null);
    setGoals(values.goals);
    update({
      horizonMonths: values.horizonMonths,
      options: {
        datePicks: values.datePicks,
        relocation: values.relocationEnabled ? values.relocationList : [],
        question: values.questionEnabled ? values.question : "",
        home: {
          facingDegrees: values.homeEnabled && values.facingDegrees
            ? Number(values.facingDegrees)
            : undefined,
          moveInYear: values.homeEnabled && values.moveInYear
            ? Number(values.moveInYear)
            : undefined,
        },
      },
    });

    try {
      setSubmitting(true);
      const payload = readingRequestSchema.parse({
        birth: {
          date: birthForm.getValues("birthDate"),
          time: birthForm.getValues("timeUnknown") ? undefined : birthForm.getValues("birthTime"),
          timeUnknown: birthForm.getValues("timeUnknown"),
          city: birthForm.getValues("birthCity"),
          country: birthForm.getValues("birthCountry"),
        },
        current: {
          city: birthForm.getValues("currentCity"),
          country: birthForm.getValues("currentCountry") ?? "",
        },
        names: {
          birthName: nameForm.getValues("birthName") || undefined,
          currentName: nameForm.getValues("currentName") || undefined,
        },
        goals: values.goals,
        horizonMonths: values.horizonMonths,
        options: {
          datePicks: values.datePicks,
          relocation: values.relocationEnabled ? values.relocationList : [],
          question: values.questionEnabled ? values.question : undefined,
          home: values.homeEnabled
            ? {
                facingDegrees: values.facingDegrees ? Number(values.facingDegrees) : undefined,
                moveInYear: values.moveInYear ? Number(values.moveInYear) : undefined,
              }
            : undefined,
        },
        timezone: birthForm.getValues("timezone"),
        locale: typeof navigator !== "undefined" ? navigator.language : undefined,
      });

      const response = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body?.message ?? "Unable to generate reading");
      }

      const reading = await response.json();
      setReading(reading);
      setSubmitting(false);
      router.push("/results");
    } catch (error) {
      setSubmitting(false);
      setSubmitError(error instanceof Error ? error.message : "Something went wrong");
    }
  });

  const addRelocationCity = () => {
    const value = focusForm.getValues("relocationInput").trim();
    const list = focusForm.getValues("relocationList");
    if (!value || list.includes(value) || list.length >= 3) return;
    focusForm.setValue("relocationList", [...list, value]);
    focusForm.setValue("relocationInput", "");
  };

  const removeRelocationCity = (city: string) => {
    const list = focusForm.getValues("relocationList");
    focusForm.setValue(
      "relocationList",
      list.filter((item) => item !== city),
    );
  };

  return (
    <Card className="px-6 py-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{currentStep.label}</CardTitle>
            <CardDescription>{currentStep.description}</CardDescription>
          </div>
          <span className="text-sm text-muted-foreground">
            Step {activeStep + 1} of {steps.length}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-foreground/10">
          <div
            className="h-1 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {activeStep === 0 && (
        <form className="mt-6 space-y-4" onSubmit={handleBirthSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Birth date
              <input
                type="date"
                {...birthForm.register("birthDate")}
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              />
              {birthForm.formState.errors.birthDate && (
                <span className="text-xs text-primary">
                  {birthForm.formState.errors.birthDate.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Birth time
              <input
                type="time"
                {...birthForm.register("birthTime")}
                disabled={birthForm.watch("timeUnknown")}
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              />
              {birthForm.formState.errors.birthTime && (
                <span className="text-xs text-primary">
                  {birthForm.formState.errors.birthTime.message}
                </span>
              )}
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" {...birthForm.register("timeUnknown")} />
            I do not know my birth time
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Birth city
              <input
                type="text"
                {...birthForm.register("birthCity")}
                placeholder="City, Country"
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              />
              {birthForm.formState.errors.birthCity && (
                <span className="text-xs text-primary">
                  {birthForm.formState.errors.birthCity.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Birth country
              <input
                type="text"
                {...birthForm.register("birthCountry")}
                placeholder="Country"
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              />
              {birthForm.formState.errors.birthCountry && (
                <span className="text-xs text-primary">
                  {birthForm.formState.errors.birthCountry.message}
                </span>
              )}
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Current city
              <input
                type="text"
                {...birthForm.register("currentCity")}
                placeholder="City"
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              />
              {birthForm.formState.errors.currentCity && (
                <span className="text-xs text-primary">
                  {birthForm.formState.errors.currentCity.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Current country (optional)
              <input
                type="text"
                {...birthForm.register("currentCountry")}
                placeholder="Country"
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Time zone
            <input
              type="text"
              {...birthForm.register("timezone")}
              placeholder="Auto detected"
              className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
            />
          </label>
          <div className="flex justify-between pt-4">
            <span className="text-sm text-muted-foreground">Autosaves to this device.</span>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      )}

      {activeStep === 1 && (
        <form className="mt-6 space-y-4" onSubmit={handleNamesSubmit}>
          <div className="grid gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Full birth name (as on certificate)
              <input
                type="text"
                {...nameForm.register("birthName")}
                placeholder="Firstname Middlename Lastname"
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Current or preferred name
              <input
                type="text"
                {...nameForm.register("currentName")}
                placeholder="Preferred name"
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              />
            </label>
          </div>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" onClick={() => setActiveStep(0)}>
              Back
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={handleSkipNames}>
                Skip names for now
              </Button>
              <Button type="submit">Continue</Button>
            </div>
          </div>
        </form>
      )}

      {activeStep === 2 && (
        <form className="mt-6 space-y-6" onSubmit={handleFocusSubmit}>
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Focus areas</h3>
              <p className="text-sm text-muted-foreground">Choose up to three priorities.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {goalValues.map((goal) => {
                const selected = selectedGoals.includes(goal);
                return (
                  <label
                    key={goal}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm ${selected ? "border-primary bg-primary/10" : "border-border bg-surface"}`}
                  >
                    <span className="capitalize">{goal}</span>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => {
                        const goals = focusForm.getValues("goals");
                        if (event.target.checked) {
                          if (goals.length >= 3) return;
                          focusForm.setValue("goals", [...goals, goal], { shouldValidate: true });
                        } else {
                          focusForm.setValue(
                            "goals",
                            goals.filter((item) => item !== goal),
                            { shouldValidate: true },
                          );
                        }
                      }}
                    />
                  </label>
                );
              })}
            </div>
            {focusForm.formState.errors.goals && (
              <p className="text-xs text-primary">{focusForm.formState.errors.goals.message}</p>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Horizon</h3>
            <div className="flex flex-wrap gap-3">
              {[3, 6, 12, 24].map((value) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm ${selectedHorizon === value ? "border-primary bg-primary/10" : "border-border"}`}
                >
                  <input
                    type="radio"
                    value={value}
                    checked={selectedHorizon === value}
                    onChange={() => focusForm.setValue("horizonMonths", value, { shouldValidate: true })}
                  />
                  {value} months
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Optional boosters</h3>
              <p className="text-sm text-muted-foreground">Toggle the extras you want.</p>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
                <span>Date picks this quarter</span>
                <input type="checkbox" {...focusForm.register("datePicks")} />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
                <span>Relocation-lite (up to three cities)</span>
                <input type="checkbox" {...focusForm.register("relocationEnabled")} />
              </label>
              {relocationEnabled && (
                <div className="space-y-3 rounded-2xl border border-border bg-foreground/5 px-4 py-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      {...focusForm.register("relocationInput")}
                      placeholder="Add city"
                      className="flex-1 rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
                    />
                    <Button type="button" onClick={addRelocationCity}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {relocationList.map((city) => (
                      <span
                        key={city}
                        className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                      >
                        {city}
                        <button
                          type="button"
                          onClick={() => removeRelocationCity(city)}
                          className="text-primary"
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                  {focusForm.formState.errors.relocationInput && (
                    <p className="text-xs text-primary">
                      {focusForm.formState.errors.relocationInput.message}
                    </p>
                  )}
                </div>
              )}

              <label className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
                <span>One Tarot or I Ching question</span>
                <input type="checkbox" {...focusForm.register("questionEnabled")} />
              </label>
              {questionEnabled && (
                <textarea
                  {...focusForm.register("question")}
                  placeholder="What should we ask?"
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
                  rows={3}
                />
              )}

              <label className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
                <span>Home-lite (front door facing)</span>
                <input type="checkbox" {...focusForm.register("homeEnabled")} />
              </label>
              {homeEnabled && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                    Front door compass facing (degrees)
                    <input
                      type="number"
                      min={0}
                      max={359}
                      {...focusForm.register("facingDegrees")}
                      className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                    Move in year
                    <input
                      type="number"
                      min={1900}
                      max={2200}
                      {...focusForm.register("moveInYear")}
                      className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
                    />
                  </label>
                </div>
              )}
            </div>
          </section>

          {submitError && <p className="text-sm text-primary">{submitError}</p>}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" onClick={() => setActiveStep(1)}>
              Back
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Generating..." : "Generate reading"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

