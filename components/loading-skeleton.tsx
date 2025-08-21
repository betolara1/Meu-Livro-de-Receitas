import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function RecipeCardSkeleton() {
  return (
    <Card className="book-page animate-pulse">
      <div className="aspect-video bg-muted rounded-t-lg"></div>
      <CardHeader>
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-muted rounded w-16"></div>
          <div className="h-4 bg-muted rounded w-16"></div>
          <div className="h-4 bg-muted rounded w-12"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RecipeDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 animate-pulse">
        <div className="aspect-video rounded-lg bg-muted mb-6"></div>
        <div className="text-center space-y-4">
          <div className="h-10 bg-muted rounded w-3/4 mx-auto"></div>
          <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
          <div className="flex justify-center gap-6">
            <div className="h-4 bg-muted rounded w-16"></div>
            <div className="h-4 bg-muted rounded w-16"></div>
            <div className="h-4 bg-muted rounded w-16"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="book-page">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="book-page">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-40"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
