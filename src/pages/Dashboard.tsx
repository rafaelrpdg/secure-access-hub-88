import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SessionHeader } from "@/components/SessionHeader";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Activity, Shield } from "lucide-react";

interface UserRole {
  role: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Track page access
      const logId = crypto.randomUUID();
      const entryTime = new Date();
      
      supabase.from('access_logs').insert({
        user_id: user.id,
        page_path: '/dashboard',
        entry_time: entryTime.toISOString(),
      }).then(({ data, error }) => {
        if (error) console.error('Error logging access:', error);
      });

      // Fetch user role
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data, error }) => {
          if (data) setRole(data.role);
          setLoading(false);
        });

      // Update log on page exit
      return () => {
        const exitTime = new Date();
        const duration = Math.floor((exitTime.getTime() - entryTime.getTime()) / 1000);
        
        supabase
          .from('access_logs')
          .update({
            exit_time: exitTime.toISOString(),
            duration_seconds: duration,
          })
          .eq('user_id', user.id)
          .eq('page_path', '/dashboard')
          .eq('entry_time', entryTime.toISOString());
      };
    }
  }, [user]);

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      'analista_i': { label: 'Analista I', variant: 'secondary' },
      'analista_ii': { label: 'Analista II', variant: 'default' },
      'analista_iii': { label: 'Analista III', variant: 'outline' },
      'admin': { label: 'Administrador', variant: 'destructive' },
    };
    
    const roleInfo = roleMap[role] || { label: role, variant: 'outline' };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <SessionHeader />
      
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo ao sistema! {role && (
              <span>Seu nível de acesso: {getRoleBadge(role)}</span>
            )}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">---</div>
              <p className="text-xs text-muted-foreground">
                Aguardando implementação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acessos Hoje</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">---</div>
              <p className="text-xs text-muted-foreground">
                Aguardando implementação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">---</div>
              <p className="text-xs text-muted-foreground">
                Aguardando implementação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nível de Segurança</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">Alto</div>
              <p className="text-xs text-muted-foreground">
                2FA habilitado
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Acesso Rápido</CardTitle>
              <CardDescription>
                Funcionalidades disponíveis para o seu nível de acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-semibold mb-1">Meu Perfil</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize e edite suas informações pessoais
                  </p>
                </div>
                
                {role === 'admin' && (
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="font-semibold mb-1">Painel Administrativo</h3>
                    <p className="text-sm text-muted-foreground">
                      Gerencie usuários e permissões do sistema
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
