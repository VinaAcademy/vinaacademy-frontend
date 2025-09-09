import { AppSidebar } from "@/components/student/profile/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar-shadcn";
import { Divide } from "lucide-react";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="">{children}</div>;
}
