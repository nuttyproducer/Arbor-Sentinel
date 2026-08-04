export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export const mainNavItems: NavItem[] = [
  { label: "Gaza Dossier", href: "/gaza-dossier" },
  { label: "Legal Tracker", href: "/legal-tracker" },
  { label: "Countries", href: "/countries" },
  { label: "Methodology", href: "/methodology" },
  { label: "Contribute", href: "/contribute" },
];

export const githubLink: NavItem = {
  label: "GitHub",
  href: "https://github.com/nuttyproducer/accountability-atlas",
  external: true,
};
