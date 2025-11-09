export type SkillCategory = "action" | "recipient" | "currency" | "amount";

export type LoyalSkill = {
  id: string;
  label: string;
  description?: string;
  category: SkillCategory;
};

export type SkillInvocation = {
  skill: LoyalSkill;
  startIndex: number;
  endIndex: number;
};

export const AVAILABLE_SKILLS: LoyalSkill[] = [
  {
    id: "send",
    label: "Send",
    description: "Send assets on blockchain",
    category: "action",
  },
  {
    id: "recipient-chris",
    label: "@chris",
    category: "recipient",
  },
  {
    id: "recipient-vlad",
    label: "@vlad",
    category: "recipient",
  },
  {
    id: "recipient-eden",
    label: "@eden",
    category: "recipient",
  },
  {
    id: "currency-sol",
    label: "SOL",
    category: "currency",
  },
  {
    id: "currency-usd",
    label: "USD",
    category: "currency",
  },
];
