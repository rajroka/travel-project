import { callDeepSeek } from "./deepseek";

export interface RecommendationInput {
  searchQuery: string;
  interests?: string[];
  budget?: number;
  availablePackages: Array<{
    id: string;
    title: string;
    price: number;
    duration: { days: number; nights: number };
    highlights?: string[];
    difficultyLevel?: string;
  }>;
  limit?: number;
}

export interface RecommendedPackage {
  packageId: string;
  reason: string;
  matchScore: number; // 1-10
}

/**
 * Uses DeepSeek AI to rank and recommend packages based on a search query.
 * Only returns IDs from the provided availablePackages list.
 */
export async function recommendPackages(
  input: RecommendationInput
): Promise<RecommendedPackage[]> {
  const limit = input.limit ?? 5;
  const packagesInfo = input.availablePackages
    .map(
      (p) =>
        `ID: ${p.id} | "${p.title}" | $${p.price} | ${p.duration.days}D/${p.duration.nights}N | ${p.highlights?.slice(0, 3).join(", ") ?? "N/A"}`
    )
    .join("\n");

  const systemPrompt = `You are a travel recommendation engine. Given a search query and available tour packages, rank the most relevant ones.
Respond ONLY with a valid JSON array:
[{ "packageId": "id", "reason": "short reason", "matchScore": 8 }]
Only include packageIds from the provided list. Return at most ${limit} results.`;

  const userPrompt = `Query: "${input.searchQuery}"
${input.interests?.length ? `Interests: ${input.interests.join(", ")}` : ""}
${input.budget ? `Budget: $${input.budget}` : ""}

Available packages:
${packagesInfo}`;

  const response = await callDeepSeek([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ], "deepseek-chat", 0.3);

  const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned) as RecommendedPackage[];

  // Filter out any IDs the AI hallucinated
  const validIds = new Set(input.availablePackages.map((p) => p.id));
  return parsed.filter((r) => validIds.has(r.packageId)).slice(0, limit);
}
