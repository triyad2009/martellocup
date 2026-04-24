import { createFileRoute } from "@tanstack/react-router";
import { ListOrdered } from "lucide-react";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/points-table")({
  component: () => (
    <PagePlaceholder titleBn="পয়েন্ট তালিকা" titleEn="Points Table" icon={<ListOrdered className="h-10 w-10" />} />
  ),
});
