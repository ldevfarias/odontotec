export interface AnamnesisData {
  history?: string;
  medications?: string;
  allergies?: string;
  [key: string]: unknown; // Allow for future expansion
}
