import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/players")({
  component: () => (
    <PagePlaceholder titleBn="খেলোয়াড়" titleEn="Players" icon={<Users className="h-10 w-10" />} />
  ),
});
