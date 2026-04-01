"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const router = useRouter();

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    // This uses Better-Auth's built in Organization plugin!
    await authClient.organization.create({
      name: orgName,
      slug: orgName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    });
    
    // Once created, send them to the dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060B18]">
      <div className="max-w-md w-full p-8 bg-[#0D1425] border border-white/10 rounded-2xl">
        <Building2 className="w-10 h-10 text-blue-500 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Name your workspace</h1>
        <p className="text-white/50 mb-6">This is where your team will collaborate on signal timing PDFs.</p>
        
        <form onSubmit={handleCreateOrg}>
          <input 
            type="text" 
            required
            placeholder="e.g. Caltrans District 4" 
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4"
          />
          <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-xl">
            Create Workspace
          </button>
        </form>
      </div>
    </div>
  );
}