import { callDeepSeek } from "./deepseek";

export interface TripInput {
  destination: string;
  days: number;
  budget: number;
  interests: string[];
  numberOfTravelers?: number;
  availablePackages: Array<{
    id: string;
    title: string;
    price: number;
    duration: { days: number; nights: number };
    highlights?: string[];
    includedServices: string[];
  }>;
}

export interface GeneratedItinerary {
  recommendedPackageIds: string[];
  itinerary: Array<{
    day: number;
    title: string;
    activities: string[];
    restaurants?: string[];
    accommodation?: string;
    estimatedCost?: number;
  }>;
  packingChecklist: string[];
  travelTips: string[];
  totalEstimatedCost: number;
  highlights: string[];
}

export async function generateItinerary(input: TripInput): Promise<GeneratedItinerary> {
  const packagesInfo = input.availablePackages
    .map(
      (p) =>
        `- ID: ${p.id}, Title: "${p.title}", Price: $${p.price}, Duration: ${p.duration.days} days/${p.duration.nights} nights, Highlights: ${p.highlights?.join(", ") || "N/A"}, Services: ${p.includedServices.join(", ")}`
    )
    .join("\n");

  const systemPrompt = `You are an expert travel planner for a tour company. Your job is to create detailed travel itineraries using ONLY the company's available packages listed below. You MUST recommend packages from this list and use their IDs exactly.

Available Packages:
${packagesInfo}

Respond ONLY with a valid JSON object matching this exact structure:
{
  "recommendedPackageIds": ["packageId1", "packageId2"],
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": ["activity1", "activity2"],
      "restaurants": ["restaurant1"],
      "accommodation": "Hotel name",
      "estimatedCost": 50
    }
  ],
  "packingChecklist": ["item1", "item2"],
  "travelTips": ["tip1", "tip2"],
  "totalEstimatedCost": 350,
  "highlights": ["highlight1"]
}`;

  const userPrompt = `Plan a ${input.days}-day trip to ${input.destination} for ${input.numberOfTravelers || 1} traveler(s).
Budget: $${input.budget}
Interests: ${input.interests.join(", ")}
Please recommend the best matching company packages and create a detailed day-by-day itinerary.`;

  const response = await callDeepSeek([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  // Strip markdown code fences if present
  const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as GeneratedItinerary;
}
