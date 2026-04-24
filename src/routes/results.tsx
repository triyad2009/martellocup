import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/results")({
  component: () => (
    <PagePlaceholder titleBn="ফলাফল" titleEn="Results" icon={<Trophy className="h-10 w-10" />} />
  ),
});
