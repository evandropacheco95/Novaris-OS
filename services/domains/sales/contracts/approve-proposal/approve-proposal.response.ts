export interface ApproveProposalResponse {
  readonly id: string;
  readonly status: "pending" | "approved";
  readonly createdAt: string;
  readonly updatedAt: string;
}
