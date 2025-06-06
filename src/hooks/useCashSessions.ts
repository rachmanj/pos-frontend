import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export interface CashSession {
  id: number;
  warehouse_id: number;
  session_number: string;
  opened_by: number;
  closed_by?: number;
  opening_cash: number;
  closing_cash?: number;
  expected_cash?: number;
  variance?: number;
  total_sales: number;
  total_cash_sales?: number;
  transaction_count: number;
  opened_at: string;
  closed_at?: string;
  status: "open" | "closed" | "reconciled";
  opening_notes?: string;
  closing_notes?: string;
  is_balanced?: boolean;
  openedBy?: {
    id: number;
    name: string;
  };
  closedBy?: {
    id: number;
    name: string;
  };
  warehouse?: {
    id: number;
    name: string;
    code: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CashSessionFilters {
  opened_by?: number;
  warehouse_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  per_page?: number;
}

export interface OpenCashSessionData {
  warehouse_id: number;
  opening_cash: number;
  opening_notes?: string;
}

export interface CloseCashSessionData {
  closing_cash: number;
  closing_notes?: string;
}

export interface CashSessionSummary {
  total_sessions: number;
  total_opening_amount: number;
  total_closing_amount: number;
  total_sales_amount: number;
  total_variance: number;
  average_variance: number;
  sessions_with_variance: number;
}

// Get cash sessions with filters
export const useCashSessions = (filters: CashSessionFilters = {}) => {
  return useQuery({
    queryKey: ["cash-sessions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const { data } = await api.get(`/cash-sessions?${params.toString()}`);
      return data.data;
    },
  });
};

// Get single cash session
export const useCashSession = (sessionId: number | undefined) => {
  return useQuery({
    queryKey: ["cash-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const { data } = await api.get(`/cash-sessions/${sessionId}`);
      return data.data as CashSession;
    },
    enabled: !!sessionId,
  });
};

// Get active cash session for current user
export const useActiveCashSession = () => {
  return useQuery({
    queryKey: ["cash-session", "active"],
    queryFn: async () => {
      const { data } = await api.get("/cash-sessions/active");
      return data.data as CashSession | null;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
};

// Get cash session summary
export const useCashSessionSummary = (
  filters: { date_from?: string; date_to?: string } = {}
) => {
  return useQuery({
    queryKey: ["cash-session-summary", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const { data } = await api.get(
        `/cash-sessions/summary?${params.toString()}`
      );
      return data.data as CashSessionSummary;
    },
  });
};

// Open cash session
export const useOpenCashSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: OpenCashSessionData) => {
      const { data } = await api.post("/cash-sessions", sessionData);
      return data.data as CashSession;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cash-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["cash-session", "active"] });
      queryClient.invalidateQueries({ queryKey: ["cash-session-summary"] });
      toast.success(`Cash session opened: ${data.session_number || "Session"}`);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to open cash session";
      toast.error(message);
    },
  });
};

// Close cash session
export const useCloseCashSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: number;
      data: CloseCashSessionData;
    }) => {
      const response = await api.post(
        `/cash-sessions/${sessionId}/close`,
        data
      );
      return response.data.data as CashSession;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cash-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["cash-session", data.id] });
      queryClient.invalidateQueries({ queryKey: ["cash-session", "active"] });
      queryClient.invalidateQueries({ queryKey: ["cash-session-summary"] });

      const variance = data.variance || 0;
      const message =
        variance === 0
          ? "Cash session closed successfully - no variance"
          : `Cash session closed with variance: ${new Intl.NumberFormat(
              "id-ID",
              {
                style: "currency",
                currency: "IDR",
              }
            ).format(variance)}`;

      toast.success(message);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to close cash session";
      toast.error(message);
    },
  });
};
