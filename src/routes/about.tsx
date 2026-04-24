import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/about")({
  component: () => (
    <PagePlaceholder titleBn="আমাদের সম্পর্কে" titleEn="About Us" icon={<Info className="h-10 w-10" />} />
  ),
});
