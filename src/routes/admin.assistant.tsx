import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareText, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ASSISTANT_KNOWLEDGE_KEY,
  DEFAULT_ASSISTANT_KNOWLEDGE,
  normalizeAssistantKnowledge,
  type AssistantKnowledge,
} from "@/lib/assistantKnowledge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/assistant")({
  component: AdminAssistantPage,
});

const SECTIONS: Array<{
  key: keyof AssistantKnowledge;
  title: string;
  hint: string;
  rows: number;
}> = [
  {
    key: "contact",
    title: "Contact details",
    hint: "Offices, phone numbers, WhatsApp, email and hours. The assistant copies these digit-for-digit — anything not written here does not exist as far as it is concerned.",
    rows: 12,
  },
  {
    key: "services",
    title: "Services",
    hint: "The services the assistant may talk about, with the page path for each so it can link customers to the right page.",
    rows: 8,
  },
  {
    key: "policies",
    title: "Pages & rules",
    hint: "Key pages, where to send people, and the hard rules (no prices, no invented details, exact phone numbers only).",
    rows: 14,
  },
];

function AdminAssistantPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<AssistantKnowledge>(DEFAULT_ASSISTANT_KNOWLEDGE);
  const [dirty, setDirty] = useState(false);

  const knowledgeQuery = useQuery({
    queryKey: ["crm_settings", ASSISTANT_KNOWLEDGE_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_settings")
        .select("value")
        .eq("key", ASSISTANT_KNOWLEDGE_KEY)
        .maybeSingle();
      if (error) throw error;
      return normalizeAssistantKnowledge(data?.value);
    },
  });

  useEffect(() => {
    if (knowledgeQuery.data && !dirty) setDraft(knowledgeQuery.data);
  }, [knowledgeQuery.data, dirty]);

  const saveMutation = useMutation({
    mutationFn: async (value: AssistantKnowledge) => {
      const { error } = await supabase.from("crm_settings").upsert(
        { key: ASSISTANT_KNOWLEDGE_KEY, value, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm_settings"] });
      setDirty(false);
      toast.success("Assistant knowledge saved — the chat assistant uses it from its next message.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <header className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <MessageSquareText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Assistant knowledge</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The one approved source of facts for the website chat assistant. Edit these sections and
            save — the assistant reads them on every conversation and never guesses anything that
            isn't written here.
          </p>
        </div>
      </header>

      {knowledgeQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          {SECTIONS.map((s) => (
            <section key={s.key} className="rounded-2xl border border-border bg-card p-4 md:p-5">
              <h2 className="text-sm font-semibold text-foreground">{s.title}</h2>
              <p className="mb-3 mt-1 text-xs text-muted-foreground">{s.hint}</p>
              <Textarea
                value={draft[s.key]}
                rows={s.rows}
                className="font-mono text-xs leading-relaxed"
                onChange={(e) => {
                  setDraft((d) => ({ ...d, [s.key]: e.target.value }));
                  setDirty(true);
                }}
              />
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                onClick={() => {
                  setDraft((d) => ({ ...d, [s.key]: DEFAULT_ASSISTANT_KNOWLEDGE[s.key] }));
                  setDirty(true);
                }}
              >
                <RotateCcw className="h-3 w-3" /> Reset this section to the approved default
              </button>
            </section>
          ))}

          <div className="flex items-center gap-3">
            <Button
              onClick={() => saveMutation.mutate(draft)}
              disabled={!dirty || saveMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? "Saving…" : "Save assistant knowledge"}
            </Button>
            {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
          </div>
        </>
      )}
    </div>
  );
}
