
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DataGrid from "./DataGrid";
import { History } from "lucide-react";

interface Version {
  id: string;
  file_name: string;
  created_at: string;
  data: any[];
  version: number;
  is_active: boolean;
}

const PricingTabs = () => {
  const { toast } = useToast();

  const { data: versions, isLoading, error } = useQuery({
    queryKey: ['csv-versions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('csv_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error loading versions",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }
      
      console.log("Fetched CSV data:", data);
      return data as Version[];
    }
  });

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  
  if (error) return <div className="text-center py-8 text-red-500">Error loading data</div>;

  if (!versions || versions.length === 0) {
    return <div className="text-center py-8">No data available. Please upload a CSV file.</div>;
  }

  const restoreVersion = async (versionId: string) => {
    try {
      const { error } = await supabase
        .from('csv_uploads')
        .update({ is_active: true })
        .eq('id', versionId);

      if (error) {
        toast({
          title: "Error restoring version",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Set all other versions to inactive
      await supabase
        .from('csv_uploads')
        .update({ is_active: false })
        .neq('id', versionId);

      toast({
        title: "Success",
        description: "Version restored successfully"
      });
      
      // Force a refetch of the data
      window.location.reload();
    } catch (err) {
      console.error("Error restoring version:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <Tabs defaultValue="current" className="w-full">
      <TabsList>
        <TabsTrigger value="current">Current Version</TabsTrigger>
        <TabsTrigger value="history">Version History</TabsTrigger>
      </TabsList>

      <TabsContent value="current">
        {versions?.find(v => v.is_active) ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {versions.find(v => v.is_active)?.file_name || "Current Data"}
            </h3>
            <DataGrid data={versions.find(v => v.is_active)?.data || []} />
          </div>
        ) : (
          <div className="text-center py-8">No active version found.</div>
        )}
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        {versions?.filter(v => !v.is_active).length > 0 ? (
          versions.filter(v => !v.is_active).map((version) => (
            <div key={version.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold">{version.file_name}</h3>
                  <p className="text-sm text-gray-500">
                    Uploaded on {new Date(version.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => restoreVersion(version.id)}
                >
                  <History className="mr-2 h-4 w-4" />
                  Restore Version
                </Button>
              </div>
              <DataGrid data={version.data} />
            </div>
          ))
        ) : (
          <div className="text-center py-8">No historical versions available.</div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default PricingTabs;
