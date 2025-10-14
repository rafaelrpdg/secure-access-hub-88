import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Profile {
  full_name: string;
  avatar_url: string | null;
}

export function SessionHeader() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionTime, setSessionTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (user) {
      // Fetch profile
      supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });

      // Fetch current session
      supabase
        .from('user_sessions')
        .select('login_time, expires_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('login_time', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data) {
            setSessionTime(new Date(data.login_time));
            
            // Calculate remaining time
            const updateTimer = () => {
              const now = new Date();
              const expiresAt = new Date(data.expires_at);
              const diff = expiresAt.getTime() - now.getTime();
              
              if (diff <= 0) {
                setTimeRemaining("Expirado");
                signOut();
                return;
              }
              
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              setTimeRemaining(`${hours}h ${minutes}min`);
            };
            
            updateTimer();
            const interval = setInterval(updateTimer, 60000); // Update every minute
            
            return () => clearInterval(interval);
          }
        });
    }
  }, [user, signOut]);

  if (!user || !profile) return null;

  const initials = profile.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-[var(--shadow-sm)]">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Sistema de Gestão</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Sessão expira em: <strong className="text-foreground">{timeRemaining}</strong></span>
          </div>
          
          {sessionTime && (
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Login: <strong className="text-foreground">{format(sessionTime, "HH:mm", { locale: ptBR })}</strong></span>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            
            <Avatar className="h-9 w-9 border-2 border-primary">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
