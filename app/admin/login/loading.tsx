import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoginLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-full max-w-md p-6 space-y-4 bg-background rounded-lg shadow-md">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}
