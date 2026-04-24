import { createFileRoute } from "@tanstack/react-router";
import { Ticket } from "lucide-react";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/tickets")({
  component: () => (
    <PagePlaceholder
      titleBn="টিকিট"
      titleEn="Tickets"
      descBn="টিকিট বিক্রয় শীঘ্রই শুরু হবে।"
      descEn="Ticket sales will open soon."
      icon={<Ticket className="h-10 w-10" />}
    />
  ),
});
