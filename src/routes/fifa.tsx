import { createFileRoute } from "@tanstack/react-router";
import { FifaHub } from "@/components/fifa/FifaHub";

export const Route = createFileRoute("/fifa")({
  head: () => ({
    meta: [
      { title: "FIFA World Cup 2026 — Martello Cup" },
      { name: "description", content: "Live World Cup scores, debate chat, quiz, predictions and games." },
      { property: "og:title", content: "FIFA World Cup 2026 Hub" },
      { property: "og:description", content: "Live scores, debate chat, quiz and games." },
    ],
  }),
  component: FifaHub,
});
