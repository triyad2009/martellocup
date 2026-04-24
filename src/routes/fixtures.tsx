import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/fixtures")({
  component: () => (
    <PagePlaceholder titleBn="ফিক্সচার" titleEn="Fixtures" icon={<Calendar className="h-10 w-10" />} />
  ),
});
