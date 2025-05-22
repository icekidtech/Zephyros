"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  origin: string;
  certifications: string[];
  blockchainId: string;
};

// Initial sample products
const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "Organic Coffee Beans",
    description: "Ethically sourced coffee beans from Colombia",
    price: 12.99,
    origin: "Colombia",
    certifications: ["Organic", "Fair Trade"],
    blockchainId: "0x123abc456def789"
  },
  {
    id: "prod-2",
    name: "Premium Chocolate",
    description: "Single-origin dark chocolate",
    price: 8.99,
    origin: "Ghana",
    certifications: ["Rainforest Alliance"],
    blockchainId: "0x789def456abc123"
  }
];

export function useProductService() {
  const [products, setProducts] = useLocalStorage<Product[]>("products", initialProducts);

  const getProducts = () => products;
  
  const getProductById = (id: string) => products.find(p => p.id === id);
  
  const addProduct = (productData: Omit<Product, "id" | "blockchainId">) => {
    const newProduct = {
      id: `prod-${products.length + 1}`,
      ...productData,
      blockchainId: `0x${Math.random().toString(16).slice(2, 14)}`
    };
    
    setProducts([...products, newProduct]);
    return newProduct;
  };
  
  const updateProduct = (id: string, productData: Partial<Product>) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, ...productData } : product
    );
    
    setProducts(updatedProducts);
    return updatedProducts.find(p => p.id === id);
  };
  
  const deleteProduct = (id: string) => {
    const filteredProducts = products.filter(product => product.id !== id);
    setProducts(filteredProducts);
  };
  
  return {
    products,
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
  };
}