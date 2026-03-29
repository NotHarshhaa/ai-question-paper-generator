"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Calendar,
  Download,
  Brain,
  Star,
  Activity,
  PieChart,
  ArrowUp,
  ArrowDown,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const analyticsData = {
  overview: {
    totalPapers: 1284,
    activeUsers: 342,
    avgGenerationTime: 2.3,
    successRate: 98.5,
    monthlyGrowth: 12.4,
  },
  subjectStats: [
    { subject: "Data Structures", papers: 156, avgRating: 4.8, trend: "+15%" },
    { subject: "Computer Networks", papers: 142, avgRating: 4.6, trend: "+8%" },
    { subject: "Operating Systems", papers: 128, avgRating: 4.7, trend: "+12%" },
    { subject: "Database Systems", papers: 115, avgRating: 4.5, trend: "+5%" },
    { subject: "Machine Learning", papers: 98, avgRating: 4.9, trend: "+22%" },
  ],
  usagePatterns: [
    { day: "Mon", papers: 45, users: 23 },
    { day: "Tue", papers: 52, users: 28 },
    { day: "Wed", papers: 48, users: 25 },
    { day: "Thu", papers: 61, users: 32 },
    { day: "Fri", papers: 58, users: 30 },
    { day: "Sat", papers: 38, users: 18 },
    { day: "Sun", papers: 42, users: 20 },
  ],
  difficultyDistribution: [
    { difficulty: "Easy", percentage: 35, color: "bg-green-500" },
    { difficulty: "Medium", percentage: 45, color: "bg-yellow-500" },
    { difficulty: "Hard", percentage: 20, color: "bg-red-500" },
  ],
  recentActivity: [
    { id: 1, user: "Prof. Kumar", subject: "Data Structures", time: "2 mins ago", status: "completed" },
    { id: 2, user: "Dr. Smith", subject: "Computer Networks", time: "5 mins ago", status: "completed" },
    { id: 3, user: "Prof. Lee", subject: "Machine Learning", time: "8 mins ago", status: "processing" },
    { id: 4, user: "Dr. Johnson", subject: "Operating Systems", time: "12 mins ago", status: "completed" },
    { id: 5, user: "Prof. Chen", subject: "Database Systems", time: "15 mins ago", status: "failed" },
  ],
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <TrendingUp className="h-3 w-3" />;
      case "processing": return <Clock className="h-3 w-3" />;
      case "failed": return <ArrowDown className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Monitor usage patterns, performance metrics, and user insights.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Total Papers</p>
                <p className="text-xl font-bold">{analyticsData.overview.totalPapers}</p>
                <div className="flex items-center mt-1 text-xs text-green-600">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span className="truncate">{analyticsData.overview.monthlyGrowth}%</span>
                </div>
              </div>
              <FileText className="h-8 w-8 text-blue-500/20 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Active Users</p>
                <p className="text-xl font-bold">{analyticsData.overview.activeUsers}</p>
                <div className="flex items-center mt-1 text-xs text-green-600">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>+8% this week</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-green-500/20 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Avg. Time</p>
                <p className="text-xl font-bold">{analyticsData.overview.avgGenerationTime}m</p>
                <div className="flex items-center mt-1 text-xs text-green-600">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  <span>-18%</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-yellow-500/20 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-xl font-bold">{analyticsData.overview.successRate}%</p>
                <div className="flex items-center mt-1 text-xs text-green-600">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>+0.3%</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-purple-500/20 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="subjects" className="text-xs py-2 px-1">Subjects</TabsTrigger>
          <TabsTrigger value="usage" className="text-xs py-2 px-1">Usage</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs py-2 px-1">Activity</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs py-2 px-1">AI Insights</TabsTrigger>
        </TabsList>

        {/* Subject Statistics */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5" />
                  Top Subjects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.subjectStats.map((subject, index) => (
                  <div key={subject.subject} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{subject.subject}</p>
                        <p className="text-xs text-muted-foreground">{subject.papers} papers</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{subject.avgRating}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {subject.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PieChart className="h-5 w-5" />
                  Difficulty Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.difficultyDistribution.map((item) => (
                  <div key={item.difficulty} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.difficulty}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full transition-all duration-300`} 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
                <Separator className="my-3" />
                <div className="text-xs text-muted-foreground">
                  <p>Most users prefer balanced difficulty settings.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Patterns */}
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Weekly Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {analyticsData.usagePatterns.map((day) => (
                  <div key={day.day} className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-t-lg" style={{ height: `${Math.max(day.papers * 1.5, 15)}px` }}>
                        <div 
                          className="bg-primary rounded-t-lg transition-all duration-300" 
                          style={{ height: `${day.papers * 1.5}px` }}
                        />
                      </div>
                      <p className="text-xs font-medium mt-1">{day.papers}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">Peak Day</p>
                  <p className="text-sm font-bold text-green-700">Thursday</p>
                  <p className="text-xs text-green-600">61 papers</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Daily Avg</p>
                  <p className="text-sm font-bold text-blue-700">49 papers</p>
                  <p className="text-xs text-blue-600">All subjects</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium">Weekend</p>
                  <p className="text-sm font-bold text-purple-700">23%</p>
                  <p className="text-xs text-purple-600">of activity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyticsData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-full ${getStatusColor(activity.status)}`}>
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{activity.user}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.subject}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5" />
                  AI Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Question Quality</span>
                    <span className="text-xs font-medium">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-1.5" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Syllabus Coverage</span>
                    <span className="text-xs font-medium">87.8%</span>
                  </div>
                  <Progress value={87.8} className="h-1.5" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Pattern Matching</span>
                    <span className="text-xs font-medium">91.5%</span>
                  </div>
                  <Progress value={91.5} className="h-1.5" />
                </div>
                <Separator className="my-3" />
                <div className="text-xs text-muted-foreground">
                  <p>AI models performing optimally across all subjects.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Improvements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 text-xs mb-1">Model Optimization</h4>
                  <p className="text-xs text-blue-600">Fine-tune BERT for domain-specific terms.</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 text-xs mb-1">User Experience</h4>
                  <p className="text-xs text-green-600">Add more template options for popular subjects.</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 text-xs mb-1">Performance</h4>
                  <p className="text-xs text-purple-600">Implement caching for syllabus patterns.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
