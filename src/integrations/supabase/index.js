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

### employees

| name                 | type                     | format    | required |
|----------------------|--------------------------|-----------|----------|
| id                   | uuid                     | string    | true     |
| user_id              | uuid                     | string    | false    |
| emp_id               | character varying(20)    | string    | true     |
| name                 | character varying(100)   | string    | true     |
| designation          | character varying(100)   | string    | true     |
| date_of_joining      | date                     | string    | true     |
| phone_no             | character varying(20)    | string    | true     |
| email                | character varying(100)   | string    | true     |
| address              | text                     | string    | false    |
| dob                  | date                     | string    | false    |
| emergency_contact_no | character varying(20)    | string    | false    |
| created_at           | timestamp with time zone | string    | false    |
| updated_at           | timestamp with time zone | string    | false    |
| created_by           | character varying(100)   | string    | false    |
| updated_by           | character varying(100)   | string    | false    |
| auth_user_id         | uuid                     | string    | false    |

Note: The `auth_user_id` column is a foreign key that references the `id` column in the `auth.users` table.

### documents

| name        | type                     | format | required |
|-------------|--------------------------|--------|----------|
| id          | uuid                     | string | true     |
| emp_id      | character varying(50)    | string | false    |
| user_id     | uuid                     | string | false    |
| file_name   | text                     | string | true     |
| file_path   | text                     | string | true     |
| file_type   | text                     | string | false    |
| uploaded_by | uuid                     | string | false    |
| uploaded_at | timestamp with time zone | string | false    |

### users

| name            | type                   | format                  | required |
|-----------------|------------------------|-------------------------|----------|
| user_id         | uuid                   | string                  | true     |
| username        | character varying(50)  | string                  | true     |
| password        | character varying(255) | string                  | true     |
| role            | user_role_enum         | enum("admin", "user")   | true     |
| email           | character varying(100) | string                  | true     |
| created_at      | timestamp with time zone | string                | false    |
| created_by      | uuid                   | string                  | false    |
| last_updated_at | timestamp with time zone | string                | false    |
| last_updated_by | uuid                   | string                  | false    |
| status          | user_status_enum       | enum("active", "inactive", "suspended") | true |
| emp_id          | character varying(20)  | string                  | false    |

*/

// Employees hooks
export const useEmployees = () => useQuery({
    queryKey: ['employees'],
    queryFn: () => fromSupabase(supabase.from('employees').select('*'))
});

export const useEmployee = (userId) => useQuery({
    queryKey: ['employees', userId],
    queryFn: () => fromSupabase(supabase.from('employees').select('*').eq('user_id', userId).single())
});

export const useAddEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newEmployee) => fromSupabase(supabase.from('employees').insert([newEmployee])),
        onSuccess: () => {
            queryClient.invalidateQueries('employees');
        },
    });
};

export const useUpdateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, updates }) => fromSupabase(supabase.from('employees').update(updates).eq('user_id', userId)),
        onSuccess: () => {
            queryClient.invalidateQueries('employees');
        },
    });
};

export const useDeleteEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId) => fromSupabase(supabase.from('employees').delete().eq('user_id', userId)),
        onSuccess: () => {
            queryClient.invalidateQueries('employees');
        },
    });
};

// Documents hooks
export const useDocuments = () => useQuery({
    queryKey: ['documents'],
    queryFn: () => fromSupabase(supabase.from('documents').select('*'))
});

export const useDocument = (id) => useQuery({
    queryKey: ['documents', id],
    queryFn: () => fromSupabase(supabase.from('documents').select('*').eq('id', id).single())
});

export const useAddDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newDocument) => fromSupabase(supabase.from('documents').insert([newDocument])),
        onSuccess: () => {
            queryClient.invalidateQueries('documents');
        },
    });
};

export const useUpdateDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }) => fromSupabase(supabase.from('documents').update(updates).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('documents');
        },
    });
};

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('documents').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('documents');
        },
    });
};

// Users hooks
export const useUsers = () => useQuery({
    queryKey: ['users'],
    queryFn: () => fromSupabase(supabase.from('users').select('*'))
});

export const useUser = (userId) => useQuery({
    queryKey: ['users', userId],
    queryFn: () => fromSupabase(supabase.from('users').select('*').eq('user_id', userId).single())
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
        mutationFn: ({ userId, updates }) => fromSupabase(supabase.from('users').update(updates).eq('user_id', userId)),
        onSuccess: () => {
            queryClient.invalidateQueries('users');
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId) => fromSupabase(supabase.from('users').delete().eq('user_id', userId)),
        onSuccess: () => {
            queryClient.invalidateQueries('users');
        },
    });
};