import { useNavigate } from "react-router-dom";
import { SessionHeader } from "@/components/SessionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function Users() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <SessionHeader />
      
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerencie usuários, permissões e níveis de acesso
              </CardDescription>
            </div>
            <Button onClick={() => navigate("/admin/users/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Lista de usuários será implementada aqui
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
