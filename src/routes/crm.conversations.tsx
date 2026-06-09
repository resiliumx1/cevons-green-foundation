import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/crm/conversations")({
  component: () => <Stub title="Conversations" desc="Unified inbox for WhatsApp, SMS, and email." />,
});

const threads = [
  { name: "Marlon Persaud", preview: "Confirmed delivery for Saturday morning.", time: "10:42", channel: "WhatsApp", unread: 2 },
  { name: "Marie Singh", preview: "Hi, is the 8 yard skip available next week?", time: "09:18", channel: "WhatsApp", unread: 1 },
  { name: "Linden Foods Ltd", preview: "Please send the updated quote.", time: "Yesterday", channel: "Email", unread: 0 },
  { name: "Berbice Hospital", preview: "Specialist review scheduled for Tuesday.", time: "Yesterday", channel: "SMS", unread: 0 },
  { name: "GT Construction", preview: "Driver arrived on site.", time: "2d", channel: "WhatsApp", unread: 0 },
];

function Stub({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-sm text-slate-400 mt-1">{desc}</p>
      </div>
      <div className="bg-[#121a26] border border-white/5 rounded-xl divide-y divide-white/5">
        {threads.map((t) => (
          <div key={t.name} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] cursor-pointer">
            <div className="h-10 w-10 rounded-full bg-emerald-700 grid place-items-center text-sm font-semibold text-white">
              {t.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-medium text-white truncate">{t.name}</div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 px-1.5 py-0.5 rounded bg-white/5">{t.channel}</span>
              </div>
              <div className="text-sm text-slate-400 truncate">{t.preview}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-xs text-slate-400">{t.time}</div>
              {t.unread > 0 && <span className="text-[10px] font-bold bg-[#FFC629] text-[#0a3622] px-1.5 rounded-full">{t.unread}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
