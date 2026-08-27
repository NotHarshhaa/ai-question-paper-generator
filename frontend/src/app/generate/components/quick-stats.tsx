import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { quickStats } from "../constants";

export const QuickStats: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {quickStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-l-4 border-l-primary">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
                <Icon className="h-6 w-6 text-primary/20 flex-shrink-0" />
              </div>
              <div className="flex items-center mt-1 text-xs">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-500">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
