import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { SessionHeader } from "@/components/SessionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["analista_i", "analista_ii", "analista_iii"]),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  pagePermissions: z.array(z.string()).min(1, "Selecione pelo menos uma página"),
});

type FormValues = z.infer<typeof formSchema>;

interface Page {
  id: string;
  name: string;
  route: string;
  description: string | null;
}

export default function NewUser() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "analista_i",
      password: "",
      pagePermissions: [],
    },
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Erro ao carregar páginas",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPages(data || []);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", values.email)
        .single();

      if (existingUser) {
        toast({
          title: "E-mail já cadastrado",
          description: "Este e-mail já está em uso.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: `${values.firstName} ${values.lastName}`,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }

      // Update user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: values.role })
        .eq("user_id", authData.user.id);

      if (roleError) throw roleError;

      // Add page permissions
      const permissionsData = values.pagePermissions.map((pageId) => ({
        user_id: authData.user!.id,
        page_id: pageId,
      }));

      const { error: permissionsError } = await supabase
        .from("user_page_permissions")
        .insert(permissionsData);

      if (permissionsError) throw permissionsError;

      toast({
        title: "Usuário criado com sucesso",
        description: `${values.firstName} ${values.lastName} foi cadastrado.`,
      });

      navigate("/admin/users");
    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <SessionHeader />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Usuário</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar um novo usuário no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="João" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobrenome</FormLabel>
                        <FormControl>
                          <Input placeholder="Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="joao.silva@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Senha do usuário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível de Acesso</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o nível" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="analista_i">Analista I</SelectItem>
                          <SelectItem value="analista_ii">Analista II</SelectItem>
                          <SelectItem value="analista_iii">Analista III</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pagePermissions"
                  render={() => (
                    <FormItem>
                      <FormLabel>Páginas Permitidas</FormLabel>
                      <div className="space-y-2 border rounded-md p-4">
                        {pages.map((page) => (
                          <FormField
                            key={page.id}
                            control={form.control}
                            name="pagePermissions"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(page.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, page.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== page.id)
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-normal cursor-pointer">
                                    {page.name} ({page.route})
                                  </FormLabel>
                                  {page.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {page.description}
                                    </p>
                                  )}
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Cadastrando..." : "Cadastrar Usuário"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/users")}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
