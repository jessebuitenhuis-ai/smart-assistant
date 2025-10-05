import { House, MessageCircleIcon } from "lucide-react";
import { FC } from "react";

interface MenuItem {
  title: string;
  url: string;
  icon: FC;
}

export const menuItems: MenuItem[] = [
  {
    title: "Home",
    url: "/",
    icon: House,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageCircleIcon,
  },
];
