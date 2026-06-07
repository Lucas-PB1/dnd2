import type {
  Campaign,
  CampaignDetail,
  CampaignErrorResponse,
  CampaignListResponse,
  CreateCampaignPayload,
} from "@/features/campaign/types/campaign.types";

async function parseResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json();
  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as CampaignErrorResponse).error === "string"
        ? (data as CampaignErrorResponse).error
        : "Ocorreu um erro. Tente novamente.";
    throw new Error(message);
  }
  return data as T;
}

const fetchOptions: RequestInit = { credentials: "include" };

export async function fetchCampaigns(): Promise<Campaign[]> {
  const response = await fetch("/api/campaigns", fetchOptions);
  const data = await parseResponse<CampaignListResponse>(response);
  return data.campaigns;
}

export async function fetchCampaign(id: number): Promise<CampaignDetail> {
  const response = await fetch(`/api/campaigns/${id}`, fetchOptions);
  const data = await parseResponse<{ campaign: CampaignDetail }>(response);
  return data.campaign;
}

export async function createCampaign(
  payload: CreateCampaignPayload,
): Promise<Campaign> {
  const response = await fetch("/api/campaigns", {
    ...fetchOptions,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse<{ campaign: Campaign }>(response);
  return data.campaign;
}
