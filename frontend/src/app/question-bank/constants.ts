export const SUBJECTS_LIST = [
  "All",
  "AWS",
  "Terraform",
  "Docker",
  "Kubernetes",
  "Linux",
  "Jenkins",
  "Ansible",
  "Git",
  "CI/CD",
  "Python",
  "Microservices",
];

export const DIFFICULTY_MAP: Record<string, { bg: string; text: string; border: string }> = {
  easy: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  hard: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
  },
};
