import { createClient } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

import React from "react";
export const queryClient = new QueryClient();
export function SupabaseProvider({ children }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

/* supabase integration types

### bets

| name         | type                     | format | required |
|--------------|--------------------------|--------|----------|
| id           | int8                     | number | true     |
| created_at   | timestamp with time zone | string | true     |
| user_id      | int8                     | number | false    |
| wager_amount | numeric                  | number | false    |
| win_chance   | numeric                  | number | false    |
| result       | boolean                  | boolean| false    |
| currency     | text                     | string | false    |
| server_seed  | text                     | string | false    |
| client_seed  | text                     | string | false    |

### users

| name       | type                     | format | required |
|------------|--------------------------|--------|----------|
| id         | int8                     | number | true     |
| created_at | timestamp with time zone | string | true     |
| username   | text                     | string | false    |
| balance    | json                     | object | false    |
| email      | text                     | string | false    |
| password   | text                     | string | false    |

*/

// Bets hooks
export const useBets = () => useQuery({
    queryKey: ['bets'],
    queryFn: () => fromSupabase(supabase.from('bets').select('*'))
});

export const useBet = (id) => useQuery({
    queryKey: ['bets', id],
    queryFn: () => fromSupabase(supabase.from('bets').select('*').eq('id', id).single())
});

export const useAddBet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newBet) => fromSupabase(supabase.from('bets').insert([newBet])),
        onSuccess: () => {
            queryClient.invalidateQueries('bets');
        },
    });
};

export const useUpdateBet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('bets').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('bets');
        },
    });
};

export const useDeleteBet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('bets').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('bets');
        },
    });
};

// Users hooks
export const useUsers = () => useQuery({
    queryKey: ['users'],
    queryFn: () => fromSupabase(supabase.from('users').select('*'))
});

export const useUser = (id) => useQuery({
    queryKey: ['users', id],
    queryFn: () => fromSupabase(supabase.from('users').select('*').eq('id', id).single())
});

export const useAddUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newUser) => fromSupabase(supabase.from('users').insert([newUser])),
        onSuccess: () => {
            queryClient.invalidateQueries('users');
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('users').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('users');
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('users').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('users');
        },
    });
};