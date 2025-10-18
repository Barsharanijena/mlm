import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { AIRecommendation } from "@shared/schema";

interface AIInsightCardProps {
  recommendation: AIRecommendation;
  onAction?: () => void;
}

export function AIInsightCard({ recommendation, onAction }: AIInsightCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "product":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "pricing":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "sales":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "lead":
        return "bg-chart-4/10 text-chart-4 border-chart-4/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <Card className="border-l-4 border-l-primary hover-elevate">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">{recommendation.title}</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={getTypeColor(recommendation.type)}
          >
            {recommendation.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {recommendation.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Confidence:</span>
            <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${recommendation.confidence}%` }}
              />
            </div>
            <span className="text-xs font-medium font-mono">
              {recommendation.confidence}%
            </span>
          </div>
          {recommendation.action && onAction && (
            <Button size="sm" variant="outline" onClick={onAction}>
              {recommendation.action}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
