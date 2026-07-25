export interface SubmitProposalResponse {
  readonly id: string;
  readonly status: "pending" | "approved";
  readonly createdAt: string;
  readonly updatedAt: string;
}
