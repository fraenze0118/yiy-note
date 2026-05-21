import {
  Cpu, Code2, Terminal, Database, Cloud, GitBranch, Wrench,
  Sigma, FlaskConical, Atom, Calculator, Microscope,
  ScrollText, BookOpen, Globe, Languages, Scale, Landmark,
  Building2, ChartLine, Briefcase,
  Palette, Music, Camera, Heart,
  type LucideIcon,
} from "lucide-react";

export const iconRegistry: Record<string, LucideIcon> = {
  // 技术
  cpu: Cpu, code2: Code2, terminal: Terminal, database: Database,
  cloud: Cloud, "git-branch": GitBranch, wrench: Wrench,
  // 科学/数学
  sigma: Sigma, "flask-conical": FlaskConical, atom: Atom,
  calculator: Calculator, microscope: Microscope,
  // 人文/社科
  "scroll-text": ScrollText, "book-open": BookOpen, globe: Globe,
  languages: Languages, scale: Scale, landmark: Landmark,
  // 商业
  building2: Building2, "chart-line": ChartLine, briefcase: Briefcase,
  // 艺术/生活
  palette: Palette, music: Music, camera: Camera, heart: Heart,
};

export function getDomainIcon(iconName: string): LucideIcon {
  return iconRegistry[iconName] ?? Code2;
}
