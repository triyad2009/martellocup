import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/sponsors")({
  component: () => (
    <PagePlaceholder titleBn="স্পনসর" titleEn="Sponsors" icon={<Star className="h-10 w-10" />} />
  ),
});
