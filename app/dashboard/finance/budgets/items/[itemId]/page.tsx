"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  DollarSign,
  PieChart,
  BarChart2,
  Activity,
  FileText,
  User,
  CreditCard,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { formatCurrencyCompact } from "@/lib/currency-utils";
import { useGetBudgetItemByIdQuery } from "@/redux/features/finance/budget-items";
import { BudgetItem } from "@/types/finance";

const BudgetItemDetailPage = () => {
  const params = useParams();
  const itemId = params.itemId as string;
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, error } = useGetBudgetItemByIdQuery(Number(itemId));

  if (isLoading) return <PageSkeleton />;
  if (error) return <div>Error: {error.message}</div>;

  const item: BudgetItem = data;

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({item.expenses_count})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>{item.category} - {item.subcategory}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Description:</strong> {item.description}</p>
              <p><strong>Budgeted:</strong> {item.formatted_amount}</p>
              <p><strong>Spent:</strong> {item.spent_amount} ({item.spent_percentage}%)</p>
              <p><strong>Remaining:</strong> {item.remaining_amount}</p>
              <p><strong>Status:</strong> {item.is_locked ? <Badge variant="destructive">Locked</Badge> : <Badge variant="default">Open</Badge>}</p>
              <p><strong>Responsible:</strong> {item.responsible_person?.name || "Unassigned"}</p>
              <p><strong>Created At:</strong> {new Date(item.created_at).toLocaleString()}</p>
              <p><strong>Updated At:</strong> {new Date(item.updated_at).toLocaleString()}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.organizational_expenses.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell>{exp.title}</TableCell>
                      <TableCell>{exp.formatted_amount}</TableCell>
                      <TableCell><Badge>{exp.status}</Badge></TableCell>
                      <TableCell>{exp.submitted_by?.name}</TableCell>
                      <TableCell>{exp.approved_by?.name || "-"}</TableCell>
                      <TableCell>{new Date(exp.expense_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>Spent %:</strong> {item.spent_percentage}%</p>
                <p><strong>Variance:</strong> {item.variance_percentage?.toFixed(2)}%</p>
                <p><strong>Utilization:</strong> {item.utilization_status}</p>
                <p><strong>Can Spend:</strong> {item.can_spend ? "Yes" : "No"}</p>
                <p><strong>Approval Threshold:</strong> {item.approval_required_threshold || "N/A"}</p>
              </div>
              <div className="space-y-2">
                <p><strong>Available Without Approval:</strong> {item.available_without_approval}</p>
                <p><strong>Total Spent:</strong> {item.formatted_spent_amount}</p>
                <p><strong>Total Remaining:</strong> {item.formatted_remaining_amount}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const PageSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-1/4" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-2/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-64 w-full" />
  </div>
);

export default BudgetItemDetailPage;
