import { useQuery } from "@tanstack/react-query";

// useAuth hook for authentication state management
export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

// Auth utility functions
export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Toast hook implementation (replace with your toast library)
export function useToast() {
  const toast = (options: {
    title: string;
    description?: string;
    variant?: "default" | "destructive";
  }) => {
    // Replace this with your actual toast implementation
    console.log("Toast:", options);
    
    // Example for react-hot-toast:
    // import toast from 'react-hot-toast';
    // if (options.variant === 'destructive') {
    //   toast.error(`${options.title}: ${options.description}`);
    // } else {
    //   toast.success(`${options.title}: ${options.description}`);
    // }
  };

  return { toast };
}