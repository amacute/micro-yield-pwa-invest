declare module '@/components/ui/button' {
  interface ButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
  }
}

declare module '@/components/ui/input' {
  interface InputProps {
    type?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    min?: string;
    step?: string;
    className?: string;
    id?: string;
    required?: boolean;
    disabled?: boolean;
  }
}

declare module '@/components/ui/card' {
  interface CardProps {
    className?: string;
    children: React.ReactNode;
  }
  
  interface CardHeaderProps {
    className?: string;
    children: React.ReactNode;
  }
  
  interface CardTitleProps {
    className?: string;
    children: React.ReactNode;
  }
  
  interface CardDescriptionProps {
    className?: string;
    children: React.ReactNode;
  }
  
  interface CardContentProps {
    className?: string;
    children: React.ReactNode;
  }
  
  interface CardFooterProps {
    className?: string;
    children: React.ReactNode;
  }
}

declare module '@/components/ui/badge' {
  export const Badge: React.FC<{
    variant?: 'default' | 'secondary' | 'outline';
    className?: string;
    children: React.ReactNode;
  }>;
}

declare module '@/components/ui/sonner' {
  export const toast: {
    error: (message: string) => void;
    success: (message: string) => void;
  };
}

declare module '@/services/admin' {
  export const fetchAvailableUsers: () => Promise<any[]>;
}

declare module '@/integrations/supabase/client' {
  interface SupabaseClient {
    channel: (name: string) => {
      on: (event: string, config: any, callback: () => void) => any;
      subscribe: () => any;
    };
    rpc: (name: string, params: any) => Promise<{
      data: any;
      error: any;
    }>;
    from: (table: string) => {
      select: (columns?: string) => {
        eq: (column: string, value: any) => Promise<{ data: any; error: any }>;
        single: () => Promise<{ data: any; error: any }>;
      };
      insert: (values: any[]) => Promise<{ data: any; error: any }>;
      update: (values: any) => {
        eq: (column: string, value: any) => Promise<{ data: any; error: any }>;
      };
    };
    auth: {
      signUp: (data: {
        email: string;
        password: string;
        options?: {
          data?: Record<string, any>;
          emailRedirectTo?: string;
        };
      }) => Promise<{
        data: { user: any };
        error: any;
      }>;
      verifyOtp: (params: {
        token_hash: string;
        type: string;
      }) => Promise<{
        error: any;
      }>;
      getUser: () => Promise<{
        data: { user: any };
        error: any;
      }>;
    };
  }

  export const supabase: SupabaseClient;
} 