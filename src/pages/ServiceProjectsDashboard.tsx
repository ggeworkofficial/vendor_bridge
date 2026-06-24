import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, DollarSign, Clock, MessageCircle, CheckCircle2, Loader2, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getServiceProjects } from "@/api/service.api";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";

const ServiceProjectsDashboard = () => {
  const navigate = useNavigate();
  const user = useAuth((state) => state.user);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["service-projects"],
    queryFn: () => getServiceProjects(),
    enabled: !!user,
  });

  const projects = projectsData?.data?.data ?? [];

  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch =
      project.product_name.toLowerCase().includes(search.toLowerCase()) ||
      project.client_name.toLowerCase().includes(search.toLowerCase()) ||
      project.provider_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const myProjects = projects.filter((p: any) => p.client_id === user?.id);
  const providerProjects = projects.filter((p: any) => p.provider_id === user?.id);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    in_review: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Please login to view projects.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Service Projects</h1>
          <p className="text-muted-foreground">Manage your service projects</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{projects.filter((p: any) => p.status === "in_progress").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{projects.filter((p: any) => p.status === "completed").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">${projects.reduce((sum: number, p: any) => sum + p.agreed_price, 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="my">My Projects</TabsTrigger>
            {user?.role === "service_provider" && <TabsTrigger value="provider">Provider Projects</TabsTrigger>}
          </TabsList>

          <TabsContent value="all">
            <ProjectList projects={filteredProjects} statusColors={statusColors} isLoading={isLoading} onChat={(id) => navigate(`/skills/chat/${id}`)} />
          </TabsContent>

          <TabsContent value="my">
            <ProjectList projects={myProjects.filter((p: any) => {
              const matchesSearch = p.product_name.toLowerCase().includes(search.toLowerCase()) || p.provider_name.toLowerCase().includes(search.toLowerCase());
              const matchesStatus = statusFilter === "all" || p.status === statusFilter;
              return matchesSearch && matchesStatus;
            })} statusColors={statusColors} isLoading={isLoading} onChat={(id) => navigate(`/skills/chat/${id}`)} />
          </TabsContent>

          <TabsContent value="provider">
            <ProjectList projects={providerProjects.filter((p: any) => {
              const matchesSearch = p.product_name.toLowerCase().includes(search.toLowerCase()) || p.client_name.toLowerCase().includes(search.toLowerCase());
              const matchesStatus = statusFilter === "all" || p.status === statusFilter;
              return matchesSearch && matchesStatus;
            })} statusColors={statusColors} isLoading={isLoading} onChat={(id) => navigate(`/skills/chat/${id}`)} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

const ProjectList = ({ projects, statusColors, isLoading, onChat }: any) => {
  if (isLoading) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
        <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
        Loading projects...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
        No projects found.
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg divide-y">
      {projects.map((project: any) => (
        <div key={project.id} className="p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold">{project.product_name}</h3>
                <Badge className={statusColors[project.status]}>{project.status}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Client:</span> {project.client_name}
                </div>
                <div>
                  <span className="font-medium">Provider:</span> {project.provider_name}
                </div>
                <div>
                  <span className="font-medium">Amount:</span> ${project.agreed_price.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Deadline:</span> {project.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="font-medium text-muted-foreground">Created:</span>{" "}
                <span className="text-foreground">{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onChat(project.id)}>
              <MessageCircle className="h-4 w-4 mr-1" /> Chat
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceProjectsDashboard;
