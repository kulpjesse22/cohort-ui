import { notFound } from "next/navigation";
import { getChannel } from "@/lib/agents";
import { Workspace } from "@/components/Workspace";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;
  if (!getChannel(channelId)) {
    notFound();
  }

  return <Workspace channelId={channelId} />;
}
