import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/request-service/confirmation")({
  head: () => ({
    meta: [
      { title: "Request Received | CEVON'S Guyana" },
      { name: "description", content: "Your CEVON'S service request has been received. We'll be in touch shortly." },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-xl mx-auto text-center rounded-2xl border border-border bg-card p-10 shadow-sm animate-fade-in">
          <div className="mx-auto size-16 rounded-full bg-[#006B35]/10 flex items-center justify-center">
            <CheckCircle2 className="size-9 text-[#006B35]" />
          </div>
          <h1 className="mt-6 text-3xl md:text-4xl font-bold">Request Received</h1>
          <p className="mt-3 text-muted-foreground">
            Thank you for choosing CEVON'S. A team member will contact you shortly to confirm your service details.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#contact" className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[10px] bg-[#006B35] text-white hover:bg-[#003F27] font-semibold transition-colors">
              <MessageCircle className="size-4" /> WhatsApp Us
            </a>
            <Button asChild variant="outline" className="h-11">
              <Link to="/services">Back to Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
