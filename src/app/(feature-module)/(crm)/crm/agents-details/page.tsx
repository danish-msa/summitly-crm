import { Suspense } from "react";
import AgentsDetailsComponent from "@/components/Pages/crm-module/agents/agentsDetails";

export const metadata = {
  title: "Agent Details | CRMS - Advanced Bootstrap 5 Admin Template for Customer Management",
};

function LoadingFallback() {
  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="card">
          <div className="card-body text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading agent details...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentsDetails(){
    return(
        <Suspense fallback={<LoadingFallback />}>
            <AgentsDetailsComponent/>
        </Suspense>
    )
}
