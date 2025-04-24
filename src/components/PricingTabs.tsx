
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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

  const { data: versions } = useQuery({
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
      return data as Version[];
    }
  });

  const restoreVersion = async (versionId: string) => {
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

    toast({
      title: "Success",
      description: "Version restored successfully"
    });
  };

  return (
    <Tabs defaultValue="current" className="w-full">
      <TabsList>
        <TabsTrigger value="current">Current Version</TabsTrigger>
        <TabsTrigger value="history">Version History</TabsTrigger>
      </TabsList>

      <TabsContent value="current">
        {versions?.find(v => v.is_active)?.data && (
          <DataGrid data={versions.find(v => v.is_active)?.data || []} />
        )}
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        {versions?.filter(v => !v.is_active).map((version) => (
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
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default PricingTabs;
