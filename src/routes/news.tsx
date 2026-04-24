import { createFileRoute } from "@tanstack/react-router";
import { Newspaper } from "lucide-react";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/news")({
  component: () => (
    <PagePlaceholder titleBn="সংবাদ" titleEn="News" icon={<Newspaper className="h-10 w-10" />} />
  ),
});
