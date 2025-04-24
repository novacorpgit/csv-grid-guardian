
import { useState } from 'react';
import CsvUploader from '@/components/CsvUploader';
import PricingTabs from '@/components/PricingTabs';

const Index = () => {
  const [gridData, setGridData] = useState<any[]>([]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">CSV Validator & Grid Viewer</h1>
        <p className="text-gray-600">Upload your CSV file to validate and view data</p>
      </div>
      
      <div className="max-w-2xl mx-auto mb-8">
        <CsvUploader onDataValidated={setGridData} />
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Data Preview</h2>
        <PricingTabs />
      </div>
    </div>
  );
};

export default Index;
