import {
  Award,
  BookOpen,
  LayoutDashboard,
  Target,
  BarChart,
} from "lucide-react";

export const skills = [
  {
    id: 1,
    name: "Product Design",
    category: "Design",
    level: "Advanced",
    progress: 82,
    color: "#6956e7",
    next: "Design systems workshop",
  },
  {
    id: 2,
    name: "React Development",
    category: "Development",
    level: "Intermediate",
    progress: 68,
    color: "#24a47f",
    next: "State management patterns",
  },
  {
    id: 3,
    name: "Data Storytelling",
    category: "Analytics",
    level: "Beginner",
    progress: 44,
    color: "#ef8b45",
    next: "Build a dashboard narrative",
  },
  {
    id: 4,
    name: "Public Speaking",
    category: "Leadership",
    level: "Intermediate",
    progress: 59,
    color: "#d6547d",
    next: "Practice product demo",
  },
];

export const goals = [
  {
    id: 1,
    title: "Ship your portfolio refresh",
    description: "Publish two polished case studies before the next review.",
    progress: 72,
    priority: "High",
    due: "Jun 28",
  },
  {
    id: 2,
    title: "Complete React pathway",
    description: "Finish the advanced components and hooks learning path.",
    progress: 58,
    priority: "Medium",
    due: "Jul 12",
  },
  {
    id: 3,
    title: "Lead a team demo",
    description: "Present the Q2 release at the all-hands meeting.",
    progress: 100,
    priority: "Low",
    due: "Jun 05",
    completed: true,
  },
];

export const chartData = [
  { month: "Jan", progress: 38 },
  { month: "Feb", progress: 46 },
  { month: "Mar", progress: 51 },
  { month: "Apr", progress: 59 },
  { month: "May", progress: 64 },
  { month: "Jun", progress: 71 },
];

export const resources = [
  {
    title: "Design systems: the practical guide",
    source: "Design Lab",
    category: "Design",
    time: "2h 10m",
    progress: 64,
    tint: "violet",
  },
  {
    title: "React patterns for resilient UIs",
    source: "Frontend Masters",
    category: "Development",
    time: "3h 20m",
    progress: 31,
    tint: "green",
  },
  {
    title: "Communicate with data",
    source: "Coursera",
    category: "Analytics",
    time: "1h 45m",
    progress: 0,
    tint: "orange",
  },
  {
    title: "Influence without authority",
    source: "Leadership Hub",
    category: "Leadership",
    time: "55m",
    progress: 0,
    tint: "rose",
  },
];

export const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/skills", label: "My skills", icon: Award },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/learning", label: "Learning", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart },
];
export const names = {
  "/dashboard": "Dashboard",
  "/skills": "My skills",
  "/goals": "Goals",
  "/learning": "Learning library",
  "/analytics": "Analytics",
  "/profile": "Profile",
};