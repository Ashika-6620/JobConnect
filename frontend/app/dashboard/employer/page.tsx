"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const jobViews = [
  { name: "Jan", Frontend: 24, Backend: 20, Design: 12, Marketing: 4 },
  { name: "Feb", Frontend: 30, Backend: 25, Design: 15, Marketing: 10 },
  { name: "Mar", Frontend: 42, Backend: 32, Design: 20, Marketing: 15 },
  { name: "Apr", Frontend: 50, Backend: 40, Design: 22, Marketing: 18 },
  { name: "May", Frontend: 65, Backend: 45, Design: 30, Marketing: 25 },
  { name: "Jun", Frontend: 70, Backend: 55, Design: 35, Marketing: 30 },
];

const applicationData = [
  { name: "Jan", Applications: 18, Interviews: 4, Hires: 1 },
  { name: "Feb", Applications: 25, Interviews: 8, Hires: 2 },
  { name: "Mar", Applications: 32, Interviews: 12, Hires: 3 },
  { name: "Apr", Applications: 40, Interviews: 15, Hires: 2 },
  { name: "May", Applications: 48, Interviews: 20, Hires: 4 },
  { name: "Jun", Applications: 55, Interviews: 22, Hires: 5 },
];

const sourceData = [
  { name: "Company Website", value: 45 },
  { name: "LinkedIn", value: 30 },
  { name: "Indeed", value: 15 },
  { name: "Referrals", value: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AnalyticsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your recruitment performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="last30days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last90days">Last 90 days</SelectItem>
              <SelectItem value="lastyear">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Job Views</CardTitle>
                <CardDescription>All job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2,487</div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-green-500">↑ 12%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Applications</CardTitle>
                <CardDescription>Across all jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">218</div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-green-500">↑ 8%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Cost per Hire</CardTitle>
                <CardDescription>Average</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$1,842</div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-red-500">↑ 3%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Time to Hire</CardTitle>
                <CardDescription>Average days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24</div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-green-500">↓ 2 days</span> from last
                  month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Job Views Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Job Views by Department</CardTitle>
              <CardDescription>
                Number of views per job category over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={jobViews}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Frontend" fill="#8884d8" />
                    <Bar dataKey="Backend" fill="#82ca9d" />
                    <Bar dataKey="Design" fill="#ffc658" />
                    <Bar dataKey="Marketing" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Application Funnel */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Recruitment Funnel</CardTitle>
              <CardDescription>
                Track your recruitment pipeline performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={applicationData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Applications"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Interviews"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Hires"
                      stroke="#ffc658"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Job Performance</CardTitle>
              <CardDescription>
                Compare performance metrics across job postings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      {
                        name: "Frontend Developer",
                        views: 1245,
                        applications: 87,
                        interviews: 24,
                        hired: 2,
                      },
                      {
                        name: "Backend Developer",
                        views: 980,
                        applications: 65,
                        interviews: 18,
                        hired: 1,
                      },
                      {
                        name: "UI/UX Designer",
                        views: 875,
                        applications: 42,
                        interviews: 12,
                        hired: 1,
                      },
                      {
                        name: "Product Manager",
                        views: 650,
                        applications: 34,
                        interviews: 8,
                        hired: 1,
                      },
                      {
                        name: "Marketing Specialist",
                        views: 550,
                        applications: 25,
                        interviews: 5,
                        hired: 0,
                      },
                    ]}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 100,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" name="Views" fill="#8884d8" />
                    <Bar
                      dataKey="applications"
                      name="Applications"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
              <CardDescription>
                Current status of all applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "New", value: 25 },
                        { name: "Screening", value: 35 },
                        { name: "Interview", value: 22 },
                        { name: "Offer", value: 8 },
                        { name: "Hired", value: 10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {sourceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Application Sources</CardTitle>
              <CardDescription>
                Where your candidates are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {sourceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
