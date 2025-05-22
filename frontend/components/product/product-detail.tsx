"use client"

import * as React from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CustomButton } from "@/components/ui/custom-button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, Share2, ShoppingCart, Star } from "lucide-react"

export interface ProductSpec {
  name: string
  value: string
}

export interface ProductReview {
  id: string
  author: string
  rating: number
  date: string
  content: string
}

export interface ProductDetailProps {
  id: string
  name: string
  description: string
  price: number
  currency?: string
  discountPrice?: number
  images: string[]
  category?: string
  tags?: string[]
  specs?: ProductSpec[]
  reviews?: ProductReview[]
  inStock?: boolean
  rating?: number
  ratingCount?: number
  onAddToCart?: () => void
  onAddToWishlist?: () => void
  onShare?: () => void
  className?: string
}

export function ProductDetail({
  id,
  name,
  description,
  price,
  currency = "USD",
  discountPrice,
  images,
  category,
  tags = [],
  specs = [],
  reviews = [],
  inStock = true,
  rating = 0,
  ratingCount = 0,
  onAddToCart,
  onAddToWishlist,
  onShare,
  className,
}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = React.useState(images[0] || "")
  
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }
  
  const averageRating = React.useMemo(() => {
    if (reviews.length === 0) return rating
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  }, [reviews, rating])

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-2 overflow-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border ${
                    selectedImage === image ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image}
                    alt={`${name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          <div>
            {category && (
              <div className="mb-2">
                <Badge variant="secondary">{category}</Badge>
              </div>
            )}
            <h1 className="text-3xl font-bold">{name}</h1>
            
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(averageRating)
                        ? "fill-primary text-primary"
                        : i < averageRating
                        ? "fill-primary/50 text-primary"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} ({ratingCount || reviews.length})
              </span>
            </div>
          </div>
          
          <div className="flex items-baseline gap-2">
            {discountPrice ? (
              <>
                <span className="text-2xl font-bold">{formatPrice(discountPrice)}</span>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(price)}
                </span>
                <Badge className="ml-2 bg-green-500">
                  {Math.round(((price - discountPrice) / price) * 100)}% OFF
                </Badge>
              </>
            ) : (
              <span className="text-2xl font-bold">{formatPrice(price)}</span>
            )}
          </div>
          
          <div>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={inStock ? "text-green-500" : "text-red-500"}>
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
            
            <div className="flex gap-2">
              <CustomButton
                onClick={onAddToCart}
                disabled={!inStock}
                className="flex-1"
                leftIcon={<ShoppingCart />}
              >
                Add to Cart
              </CustomButton>
              <CustomButton
                variant="outline"
                onClick={onAddToWishlist}
                leftIcon={<Heart />}
              >
                Wishlist
              </CustomButton>
              <CustomButton
                variant="ghost"
                size="icon"
                onClick={onShare}
              >
                <Share2 />
                <span className="sr-only">Share</span>
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="details">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-4">
          <div className="prose max-w-none dark:prose-invert">
            <p>{description}</p>
          </div>
        </TabsContent>
        
        <TabsContent value="specs" className="mt-4">
          {specs.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
                {specs.map((spec, index) => (
                  <div key={index} className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">{spec.name}</h4>
                    <p className="text-sm">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No specifications available.</p>
          )}
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-4">
          {reviews.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{review.author}</h4>
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-primary text-primary"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm">{review.content}</p>
                    <Separator />
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground">No reviews yet.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}