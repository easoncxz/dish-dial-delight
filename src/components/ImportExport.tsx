
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "@/components/ui/use-toast";
import { exportAppData, importAppData } from "@/store/thunks";
import { 
  selectDialogOpen, 
  selectImportText, 
  selectExportedData, 
  setDialogOpen, 
  setImportText, 
  setExportedData 
} from "@/store/uiSlice";

const ImportExport = () => {
  const dispatch = useAppDispatch();
  const dialogOpen = useAppSelector(selectDialogOpen);
  const importText = useAppSelector(selectImportText);
  const exportedData = useAppSelector(selectExportedData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleExport = async () => {
    try {
      const json = exportAppData()(dispatch);
      dispatch(setExportedData(json));
      dispatch(setDialogOpen({ key: 'exportDialog', value: true }));
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your data."
      });
    }
  };
  
  const handleDownload = () => {
    const blob = new Blob([exportedData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nutriplan-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch(setDialogOpen({ key: 'exportDialog', value: false }));
    
    toast({
      title: "Export successful",
      description: "Your data has been exported successfully."
    });
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        dispatch(setImportText(content));
        dispatch(setDialogOpen({ key: 'importDialog', value: true }));
      } catch (error) {
        console.error("Error reading file:", error);
        toast({
          variant: "destructive",
          title: "Error reading file",
          description: "The selected file could not be read. Please try again."
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const confirmImport = async () => {
    try {
      await dispatch(importAppData(importText));
      dispatch(setDialogOpen({ key: 'importDialog', value: false }));
      dispatch(setImportText(""));
      toast({
        title: "Import successful",
        description: "Your data has been imported successfully."
      });
    } catch (error) {
      console.error("Error importing data:", error);
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "There was an error importing your data. Please check the file format."
      });
    }
  };
  
  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex space-x-3"
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </motion.div>
      
      {/* Export Dialog */}
      <Dialog open={dialogOpen.exportDialog} onOpenChange={(open) => dispatch(setDialogOpen({ key: 'exportDialog', value: open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={exportedData}
              readOnly
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => dispatch(setDialogOpen({ key: 'exportDialog', value: false }))}>
              Cancel
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={dialogOpen.importDialog} onOpenChange={(open) => dispatch(setDialogOpen({ key: 'importDialog', value: open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={importText}
              onChange={(e) => dispatch(setImportText(e.target.value))}
              className="min-h-[200px] font-mono text-sm"
              placeholder="Paste your JSON data here..."
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => dispatch(setDialogOpen({ key: 'importDialog', value: false }))}>
              Cancel
            </Button>
            <Button onClick={confirmImport}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportExport;
