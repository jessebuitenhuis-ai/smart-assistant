import { getUser } from "@/lib/supabase/getUser";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { User2 } from "lucide-react";

export default async function UserAvatar(
  props: React.ComponentProps<typeof Avatar>
) {
  const user = await getUser();
  const avatarUrl = user?.user_metadata?.avatar_url || "";
  const name: string = user?.user_metadata?.name || "User";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <Avatar {...props}>
      <AvatarImage src={avatarUrl} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
