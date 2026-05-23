import { requireAuth } from "@/lib/actions-auth";
import ChatApp from "@/app/chat/ChatApp";

export default async function ChatPage() {
  const session = await requireAuth();

  const authUser = {
    id: session.user.id,
    name: session.user.name ?? session.user.email,
    email: session.user.email,
    avatar: session.user.image ?? "",
  };

  return <ChatApp authUser={authUser} />;
}
