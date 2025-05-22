"use client"
import { cn } from "@/lib/utils"
import { SupplyChainNode, type SupplyChainNodeProps } from "./supply-chain-node"
import { CheckCircle, Clock, AlertTriangle, HelpCircle } from "lucide-react"

export interface SupplyChainTimelineProps {
  steps: SupplyChainNodeProps[]
  className?: string
}

export function SupplyChainTimeline({ steps, className }: SupplyChainTimelineProps) {
  // Calculate the current active step (last verified or first pending)
  const activeStepIndex = steps.findIndex(step => step.status === "pending") || 
                          steps.filter(step => step.status === "verified").length;
  
  // Get status icon based on status
  const getStatusIcon = (status: string, isActive: boolean) => {
    switch(status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-white" />;
      case "pending":
        return <Clock className="h-5 w-5 text-white" />;
      case "rejected":
        return <AlertTriangle className="h-5 w-5 text-white" />;
      default:
        return <HelpCircle className="h-5 w-5 text-white" />;
    }
  };
  
  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch(status) {
      case "verified":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      {steps.map((step, index) => {
        const isActive = index === activeStepIndex;
        const isPast = index < activeStepIndex;
        const isFuture = index > activeStepIndex;
        
        return (
          <div key={index} className="relative">
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "absolute left-4 top-[3.25rem] bottom-[-2rem] w-0.5",
                  isPast ? getStatusColor("verified") : "bg-gray-200"
                )}
              />
            )}
            <div className="relative">
              <div 
                className={cn(
                  "absolute left-0 top-4 flex h-8 w-8 items-center justify-center rounded-full",
                  getStatusColor(step.status),
                  isActive && "ring-2 ring-offset-2 ring-blue-500"
                )}
              >
                {getStatusIcon(step.status, isActive)}
              </div>
              <div className="ml-12">
                <SupplyChainNode 
                  {...step} 
                  className={cn(
                    isActive && "border-blue-500 shadow-md",
                    isPast && "opacity-90",
                    isFuture && "opacity-70"
                  )}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}
