// types/statistics.ts
export interface ProjectSummary {
  currency_id: number;
  currency_code: string;
  currency_name: string;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_budget: number;
  total_allocated: number;
  total_spent: number;
  total_remaining: number;
  avg_budget: number;
  budget_utilization: number;
  delayed_projects: number;
  success_rate: number;
  avg_duration_days: number;
}

export interface StatusCount {
  status: string;
  count: number;
  total_budget: number;
  total_spent: number;
}

export interface TypeCount {
  project_type: string;
  count: number;
  total_budget: number;
  total_spent: number;
  avg_utilization: number;
}

export interface CategoryCount {
  category_id: number;
  category_name: string;
  count: number;
  total_budget: number;
  total_spent: number;
  avg_utilization: number;
}

export interface ManagerPerformance {
  manager_id: number;
  manager_name: string;
  total_projects: number;
  completed_projects: number;
  active_projects: number;
  total_budget: number;
  total_spent: number;
  success_rate: number;
  avg_utilization: number;
}

export interface TimelineStats {
  active_projects: number;
  delayed_projects: number;
  completed_on_time: number;
  completed_late: number;
  on_time_rate: number;
  avg_project_duration: number;
}

export interface PerformanceMetrics {
  project_completion_rate: number;
  active_project_rate: number;
  budget_efficiency: number;
  timeline_adherence: number;
  resource_utilization: number;
}

export interface RiskAnalysis {
  timeline_risk: number;
  budget_risk: number;
  high_risk_projects: number;
  resource_constraint_risk: number;
}

export interface CurrencyStats {
  summary: ProjectSummary;
  status_counts: StatusCount[];
  type_counts: TypeCount[];
  category_counts: CategoryCount[];
  manager_performance: ManagerPerformance[];
  timeline_stats: TimelineStats;
  performance_metrics: PerformanceMetrics;
  risk_analysis: RiskAnalysis;
}

export interface ProjectStatistics {
  currencies: {
    [currencyId: string]: CurrencyStats;
  };
  generated_at: string;
  filters_applied: {
    project_type: string | null;
    status: string | null;
    category: string | null;
    currency: string | null;
    manager: string | null;
    year: string | null;
  };
}