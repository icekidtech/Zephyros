"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";

export type Verification = {
  id: string;
  productId: string;
  timestamp: string;
  status: "verified" | "pending" | "rejected";
  blockchainTxId: string;
  verifier: string;
};

// Initial sample verification
const initialVerifications: Verification[] = [
  {
    id: "ver-1",
    productId: "prod-1",
    timestamp: "2023-10-15T14:30:00Z",
    status: "verified",
    blockchainTxId: "0xabcdef1234567890abcdef1234567890",
    verifier: "0x1234567890abcdef1234567890abcdef"
  }
];

export function useVerificationService() {
  const [verifications, setVerifications] = useLocalStorage<Verification[]>(
    "verifications", 
    initialVerifications
  );

  const getVerifications = () => verifications;
  
  const getVerificationById = (id: string) => 
    verifications.find(v => v.id === id);
  
  const getVerificationsByProductId = (productId: string) => 
    verifications.filter(v => v.productId === productId);
  
  const addVerification = (data: Omit<Verification, "id" | "timestamp" | "blockchainTxId">) => {
    const newVerification = {
      id: `ver-${verifications.length + 1}`,
      timestamp: new Date().toISOString(),
      blockchainTxId: `0x${Math.random().toString(16).slice(2, 40)}`,
      ...data,
    };
    
    setVerifications([...verifications, newVerification]);
    return newVerification;
  };
  
  return {
    verifications,
    getVerifications,
    getVerificationById,
    getVerificationsByProductId,
    addVerification
  };
}