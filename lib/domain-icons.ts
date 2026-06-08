import {
  Cpu, Code2, Terminal, Database, Cloud, GitBranch, Wrench,
  Monitor, Laptop, Server, Wifi, Bluetooth, Plug, Shield, Rocket,
  Sigma, FlaskConical, Atom, Calculator, Microscope, Brain, Dna, Telescope,
  ScrollText, BookOpen, Globe, Languages, Scale, Landmark,
  Library, GraduationCap, Pencil,
  Building2, ChartLine, Briefcase, Wallet, TrendingUp, Target,
  Palette, Music, Camera, Heart, Home, Coffee, Sun, MoonStar,
  type LucideIcon,
} from "lucide-react";

export const iconRegistry: Record<string, LucideIcon> = {
  // 技术
  cpu: Cpu, code2: Code2, terminal: Terminal, database: Database,
  cloud: Cloud, "git-branch": GitBranch, wrench: Wrench,
  monitor: Monitor, laptop: Laptop, server: Server,
  wifi: Wifi, bluetooth: Bluetooth, plug: Plug, shield: Shield, rocket: Rocket,
  // 科学
  sigma: Sigma, "flask-conical": FlaskConical, atom: Atom,
  calculator: Calculator, microscope: Microscope,
  brain: Brain, dna: Dna, telescope: Telescope,
  // 人文
  "scroll-text": ScrollText, "book-open": BookOpen, globe: Globe,
  languages: Languages, scale: Scale, landmark: Landmark,
  library: Library, "graduation-cap": GraduationCap, pencil: Pencil,
  // 商业
  building2: Building2, "chart-line": ChartLine, briefcase: Briefcase,
  wallet: Wallet, "trending-up": TrendingUp, target: Target,
  // 生活
  palette: Palette, music: Music, camera: Camera, heart: Heart,
  home: Home, coffee: Coffee, sun: Sun, "moon-star": MoonStar,
};

export function getDomainIcon(iconName: string): LucideIcon {
  return iconRegistry[iconName] ?? Code2;
}
