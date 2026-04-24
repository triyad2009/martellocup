import { createFileRoute } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/contact")({
  component: () => (
    <PagePlaceholder titleBn="যোগাযোগ" titleEn="Contact" icon={<Phone className="h-10 w-10" />} />
  ),
});
