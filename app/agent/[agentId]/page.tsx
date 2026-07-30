import { notFound } from "next/navigation";
import { getAgent, type AgentId } from "@/lib/agents";
import { AgentProfile } from "@/components/AgentProfile";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  if (!getAgent(agentId)) {
    notFound();
  }

  return <AgentProfile agentId={agentId as AgentId} />;
}
