export type BentoItemVisualKey =
  | "cardOne"
  | "cardTwo"
  | "cardThree"
  | "cardFour"
  | "cardFive";

export type BentoItemCopy = {
  visualKey: BentoItemVisualKey;
  title: string;
  description: string;
};

export type BentoTabContent = {
  label: string;
  items: BentoItemCopy[];
};

const sectionOneItmes: BentoItemCopy[] = [
  {
    visualKey: "cardOne",
    title: "Summarize your chats",
    description: "No more waking up to 600 unread messages.",
  },
  {
    visualKey: "cardTwo",
    title: "Group chat highlights",
    description: "Never miss important discussions in group chats.",
  },
  {
    visualKey: "cardThree",
    title: "Automated workflows",
    description: "Automated pipelines to close deals and save time.",
  },
  {
    visualKey: "cardFour",
    title: "Hands-off repetitive tasks",
    description:
      "Loyal makes sending money, paying invoices and managing your assets easy.",
  },
  {
    visualKey: "cardFive",
    title: "User-owned storage",
    description: "Talk directly to the data you own and control.",
  },
];

const sectionTwoItems: BentoItemCopy[] = [
  {
    visualKey: "cardOne",
    title: "Hybrid Inference",
    description:
      "Distribute workloads between edge devices and encrypted cloud runners for speed and privacy.",
  },
  {
    visualKey: "cardTwo",
    title: "Deterministic Pipelines",
    description:
      "Every automation step is versioned, reproducible, and observable for compliance and tuning.",
  },
  {
    visualKey: "cardThree",
    title: "Context Mesh",
    description:
      "Securely blend personal data sources into a unified context layer without centralizing raw data.",
  },
  {
    visualKey: "cardFour",
    title: "Signal Processing",
    description:
      "Real-time vector monitoring highlights user intent shifts to keep agents responsive.",
  },
  {
    visualKey: "cardFive",
    title: "Lossless Compression",
    description:
      "Reduce token usage with adaptive compression that preserves domain-specific meaning.",
  },
];

const sectionThreeItems: BentoItemCopy[] = [
  {
    visualKey: "cardOne",
    title: "End-to-End Encryption",
    description:
      "Conversations are sealed with per-session keys and never visible to Loyal staff.",
  },
  {
    visualKey: "cardTwo",
    title: "Redaction Engine",
    description:
      "Personally identifiable details are stripped automatically before model invocation.",
  },
  {
    visualKey: "cardThree",
    title: "Context Permissions",
    description:
      "Granular access policies keep workspaces, devices, and automations scoped correctly.",
  },
  {
    visualKey: "cardFour",
    title: "Tamper Alerts",
    description:
      "On-chain attestations and anomaly detection expose unauthorized changes instantly.",
  },
  {
    visualKey: "cardFive",
    title: "Data Retention Controls",
    description:
      "Set retention windows per workspace so sensitive information expires automatically.",
  },
];

export const bentoTabs: BentoTabContent[] = [
  { label: "Productivity", items: sectionOneItmes },
  { label: "Finance", items: sectionTwoItems },
  { label: "Privacy", items: sectionThreeItems },
];
