import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoadingLoansPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="activos">Activos</TabsTrigger>
            <TabsTrigger value="vencidos">Vencidos</TabsTrigger>
            <TabsTrigger value="devueltos">Devueltos</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="mt-0">
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="w-16 h-24 flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />

                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                          <div>
                            <Skeleton className="h-3 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>

                          <div>
                            <Skeleton className="h-3 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>

                        <div className="mt-3">
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
