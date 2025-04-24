
import React, { useCallback, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const REQUIRED_HEADERS = [
  'Item ID', 'Item_Name', 'Part_Number', 'Supplier', 'Category', 'Subcategory',
  'Qty', 'Unit_Cost', 'Total Cost', 'Currency', 'Labour_Minutes',
  'Total_Labour_Time', 'Installation_Type', 'Rated_Current_AMP',
  'Number of Poles', 'IP_Rating', 'Breaking_Capacity _Ka', 'Mounting Type',
  'Watt_Loss', 'Stock_Status', 'Lead_Time_Days', 'Remarks'
];

interface CsvUploaderProps {
  onDataValidated: (data: any[]) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ onDataValidated }) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const validateHeaders = (headers: string[]) => {
    const missingHeaders = REQUIRED_HEADERS.filter(
      required => !headers.includes(required)
    );
    return missingHeaders.length === 0 ? null : missingHeaders;
  };

  const handleFile = async (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].trim().split(',');
        
        const missingHeaders = validateHeaders(headers);
        
        if (missingHeaders) {
          toast({
            title: "Header Validation Error",
            description: `Missing required headers: ${missingHeaders.join(', ')}`,
            variant: "destructive"
          });
          setIsUploading(false);
          return;
        }

        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',');
            return headers.reduce((obj: any, header, index) => {
              obj[header] = values[index];
              return obj;
            }, {});
          });

        console.log("Prepared data for upload:", data.length, "rows");

        const { error } = await supabase
          .from('csv_uploads')
          .insert({
            file_name: file.name,
            data,
            headers,
            version: 1,
            customer_id: 'default', // You can update this based on your needs
            is_active: true
          });

        if (error) {
          console.error("Upload error:", error);
          toast({
            title: "Error",
            description: "Failed to store CSV data: " + error.message,
            variant: "destructive"
          });
          setIsUploading(false);
          return;
        }

        toast({
          title: "Success",
          description: "CSV file validated and stored successfully",
        });
        
        onDataValidated(data);
        
        // Force reload to update the tabs with the new data
        window.location.reload();
      } catch (error) {
        console.error("Processing error:", error);
        toast({
          title: "Error",
          description: "Failed to process CSV file. Please check the format.",
          variant: "destructive"
        });
      }
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      handleFile(file);
    } else {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'}
      `}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <FileUp className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold">Drag and drop your CSV file here</h3>
      <p className="mt-1 text-sm text-gray-500">Or</p>
      <div className="mt-4">
        <input
          type="file"
          accept=".csv"
          onChange={onFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label htmlFor="file-upload">
          <Button variant="outline" asChild disabled={isUploading}>
            <span>{isUploading ? "Uploading..." : "Select CSV File"}</span>
          </Button>
        </label>
      </div>
    </div>
  );
};

export default CsvUploader;
