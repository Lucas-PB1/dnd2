import type {
  Campaign,
  CampaignDetail,
  CampaignListResponse,
  CampaignMember,
  CampaignMembersResponse,
  CreateCampaignPayload,
  InviteMemberPayload,
} from "@/shared/campaign";

async function parseResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json();
  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: string }).error === "string"
        ? (data as { error: string }).error
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

export async function fetchCampaignMembers(
  campaignId: number,
): Promise<CampaignMember[]> {
  const response = await fetch(`/api/campaigns/${campaignId}/members`, fetchOptions);
  const data = await parseResponse<CampaignMembersResponse>(response);
  return data.members;
}

export async function inviteCampaignMember(
  campaignId: number,
  payload: InviteMemberPayload,
): Promise<CampaignMember> {
  const response = await fetch(`/api/campaigns/${campaignId}/members`, {
    ...fetchOptions,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse<{ member: CampaignMember }>(response);
  return data.member;
}

export async function removeCampaignMember(
  campaignId: number,
  playerId: string,
): Promise<void> {
  const response = await fetch(
    `/api/campaigns/${campaignId}/members/${playerId}`,
    { ...fetchOptions, method: "DELETE" },
  );
  await parseResponse<{ ok: boolean }>(response);
}
