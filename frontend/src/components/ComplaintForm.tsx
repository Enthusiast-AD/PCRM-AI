import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { CATEGORIES } from "@/data/mock";

interface Ward {
  id: string;
  ward_name: string;
}

export function ComplaintForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState<Ward[]>([]);
  const { toast } = useToast();
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetch(`${API_URL}/api/v1/wards`)
      .then(res => res.json())
      .then(data => setWards(data))
      .catch(err => console.error("Failed to fetch wards", err));
  }, []);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      let photo_url = undefined;
      const file = formData.get("photo") as File;
      if (file && file.size > 0) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch(`${API_URL}/api/v1/complaints/upload`, {
          method: "POST",
          body: uploadData,
        });
        if (uploadRes.ok) {
          const resJson = await uploadRes.json();
          photo_url = resJson.photo_url;
        }
      }

      const rawText = formData.get("raw_text") as string;
      const wardId = formData.get("ward") as string;
      const category = formData.get("category") as string;

      const selectedWard = wards.find(w => w.id === wardId);
      const wardName = selectedWard ? selectedWard.ward_name : 'Not specified';

      const enhancedText = `${rawText}\n\n[Context - Ward: ${wardName}, Selected Category: ${category || 'Not specified'}]`;

      const complaintData = {
        citizen_name: formData.get("citizen_name"),
        citizen_phone: formData.get("citizen_phone"),
        channel: "web",
        raw_text: enhancedText,
        ward_id: wardId || null,
        photo_url,
        category: category || "Unclassified",
      };

      const res = await fetch(`${API_URL}/api/v1/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(complaintData),
      });

      if (!res.ok) throw new Error("Failed to submit request");
      
      const result = await res.json();

      toast({
        title: "Complaint Submitted",
        description: `Your ticket ID is ${result.ticket_id}. Save this for future reference.`,
      });

      if (onSuccess) onSuccess();
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast({
        title: "Submission Error",
        description: err.message || "Failed to submit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-1 py-2">
      <div className="space-y-2">
        <Label htmlFor="citizen_name">Full Name</Label>
        <Input id="citizen_name" name="citizen_name" placeholder="E.g., Ananya Singh" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="citizen_phone">Phone Number <span className="text-destructive">*</span></Label>
        <Input id="citizen_phone" name="citizen_phone" required placeholder="+91 XXXXXXXXXX" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ward">Ward / Area</Label>
          <Select name="ward">
            <SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger>
            <SelectContent>
              {wards.map(w => <SelectItem key={w.id} value={w.id}>{w.ward_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category">
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="raw_text">Description <span className="text-destructive">*</span></Label>
        <Textarea 
          id="raw_text" 
          name="raw_text" 
          required 
          placeholder="Describe your issue in detail (min 20 characters)" 
          minLength={20} 
          className="min-h-[100px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="photo">Attach Photo (Optional)</Label>
        <Input id="photo" name="photo" type="file" accept="image/*" className="cursor-pointer file:text-primary file:font-medium" />
      </div>
      <Button type="submit" className="w-full text-md font-semibold mt-4 h-12 transition-transform active:scale-[0.98]" disabled={loading}>
        {loading ? "Submitting securely..." : "Submit Complaint"}
      </Button>
    </form>
  );
}
