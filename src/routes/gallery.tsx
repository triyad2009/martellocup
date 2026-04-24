import { createFileRoute } from "@tanstack/react-router";
import { Image } from "lucide-react";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/gallery")({
  component: () => (
    <PagePlaceholder titleBn="গ্যালারি" titleEn="Gallery" icon={<Image className="h-10 w-10" />} />
  ),
});
