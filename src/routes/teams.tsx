import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/teams")({
  component: () => (
    <PagePlaceholder titleBn="দল" titleEn="Teams" icon={<Shield className="h-10 w-10" />} />
  ),
});
