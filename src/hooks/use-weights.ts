import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { weights_api, user_profiles_api } from "@/lib/supabase";
import { Weight, UserProfile } from "@/types";
import { useAuth } from "./use-auth";

// Hook for fetching all weights
export function use_weights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["weights", user?.id],
    queryFn: () => weights_api.get_weights(user!.id),
    enabled: !!user,
  });
}

// Hook for fetching user profile
export function use_user_profile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user_profile", user?.id],
    queryFn: () => user_profiles_api.get_profile(user!.id),
    enabled: !!user,
  });
}

// Hook for adding a new weight
export function use_add_weight() {
  const query_client = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ date, value }: { date: string; value: number }) =>
      weights_api.add_weight(user!.id, date, value),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ["weights", user?.id] });
    },
  });
}

// Hook for updating a weight
export function use_update_weight() {
  const query_client = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: number }) =>
      weights_api.update_weight(id, value),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ["weights", user?.id] });
    },
  });
}

// Hook for deleting a weight
export function use_delete_weight() {
  const query_client = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => weights_api.delete_weight(id),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ["weights", user?.id] });
    },
  });
}

// Hook for updating goal weight
export function use_update_goal_weight() {
  const query_client = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (goal_weight: number) =>
      user_profiles_api.upsert_profile(user!.id, goal_weight),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ["user_profile", user?.id] });
    },
  });
}

// Hook for checking if weight exists for a date
export function use_weight_by_date(date: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["weight_by_date", user?.id, date],
    queryFn: () => weights_api.get_weight_by_date(user!.id, date),
    enabled: !!user && !!date,
  });
}
