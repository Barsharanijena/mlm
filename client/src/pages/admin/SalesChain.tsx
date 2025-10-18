import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, TrendingUp, DollarSign } from "lucide-react";
import type { SalesChainNode } from "@shared/schema";

function ChainNode({ node, level = 0 }: { node: SalesChainNode; level?: number }) {
  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-4">
      <Card className="hover-elevate">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(node.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{node.name}</h3>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {node.role}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{node.downlineCount} downline</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <TrendingUp className="h-3 w-3" />
                    Total Sales
                  </div>
                  <p className="text-lg font-bold font-mono">
                    ${node.totalSales.toLocaleString()}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <DollarSign className="h-3 w-3" />
                    Commissions
                  </div>
                  <p className="text-lg font-bold font-mono text-chart-2">
                    ${node.totalCommissions.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {node.children && node.children.length > 0 && (
        <div className="ml-8 pl-4 border-l-2 border-border space-y-4">
          {node.children.map((child) => (
            <ChainNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SalesChain() {
  const { data: chain, isLoading } = useQuery<SalesChainNode[]>({
    queryKey: ["/api/sales-chain"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Chain Hierarchy</h1>
        <p className="text-muted-foreground mt-1">
          View the complete multi-level sales network structure
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      ) : chain && chain.length > 0 ? (
        <div className="space-y-6">
          {chain.map((node) => (
            <ChainNode key={node.id} node={node} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
            No sales chain data available
          </CardContent>
        </Card>
      )}
    </div>
  );
}
