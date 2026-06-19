"use client"

import { ShoppingCart, Heart } from "lucide-react"

export function FeaturedProducts() {
  return (
    <div className="space-y-6">

      <h5 className="text-xl font-bold">Featured Products</h5>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">

        {/* Product 1 */}
        <div className="rounded-3xl overflow-hidden bg-card border shadow hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
          <div className="
              p-8
              flex items-center justify-center
              border-b
              bg-muted/50
              ">
            <img
              src="/pulse-ui-next/images/cards/eComm/01.png"
              alt="Wireless Headphones"
              className="h-40 object-contain filter grayscale"
            />
          </div>

          <div className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">
              Wireless Headphones
            </h3>

            <p className="text-sm text-muted-foreground">
              Noise-cancelling over-ear headphones with long-lasting battery life.
            </p>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-600">
                $129.00
              </span>
              <span className="text-xs px-3 py-1 rounded-full border border-border">
                In Stock
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="
                flex-1
                flex items-center justify-center gap-2
                rounded-full
                px-4 py-2
                border border-border
                bg-muted
                ">
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>

              <button className="
                p-2
                rounded-full
                border border-border
                ">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product 2 */}
        <div className="rounded-3xl overflow-hidden bg-card border shadow hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
          <div className="
              p-8
              flex items-center justify-center
              border-b
              ">
            <img
              src="/pulse-ui-next/images/cards/eComm/02.png"
              alt="Smartwatch Pro"
              className="h-40 object-contain filter grayscale"
            />
          </div>

          <div className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">
              Smartwatch Pro
            </h3>

            <p className="text-sm text-muted-foreground">
              Fitness tracking, heart rate monitoring, and smart notifications.
            </p>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-600">
                $89.00
              </span>
              <span className="text-xs px-3 py-1 rounded-full border border-border">
                Limited
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="
                flex-1
                flex items-center justify-center gap-2
                rounded-full
                px-4 py-2
                border border-border
                shadow
                ">
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>

              <button className="p-2 rounded-full border hover:bg-muted transition">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product 3 */}
        <div className="rounded-3xl overflow-hidden bg-card border shadow hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
          <div className="
              p-8
              flex items-center justify-center
              border-b
              bg-muted/50
              ">
            <img
              src="/pulse-ui-next/images/cards/eComm/03.png"
              alt="Portable Speaker"
              className="h-40 object-contain filter grayscale"
            />
          </div>

          <div className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">
              Portable Speaker
            </h3>

            <p className="text-sm text-muted-foreground">
              Compact wireless speaker with immersive sound and deep bass.
            </p>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-600">
                $59.00
              </span>
              <span className="text-xs px-3 py-1 rounded-full border border-border">
                New
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="
                flex-1
                flex items-center justify-center gap-2
                rounded-full
                px-4 py-2
                border border-border
                bg-muted
                ">
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>

              <button className="p-2 rounded-full border hover:bg-muted transition">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product 4 */}
        <div className="rounded-3xl overflow-hidden bg-card border shadow hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
          <div className="
              p-8
              flex items-center justify-center
              border-b
              ">
            <img
              src="/pulse-ui-next/images/cards/eComm/04.png"
              alt="Noise Cancelling Earbuds"
              className="h-40 object-contain filter grayscale"
            />
          </div>

          <div className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">
              Noise Cancelling Earbuds
            </h3>

            <p className="text-sm text-muted-foreground">
              Lightweight wireless earbuds with active noise cancellation and crystal clear audio.
            </p>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-600">
                $79.00
              </span>
              <span className="text-xs px-3 py-1 rounded-full border border-border">
                Sale
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="
                flex-1
                flex items-center justify-center gap-2
                rounded-full
                px-4 py-2
                border border-border shadow
                ">
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>

              <button className="p-2 rounded-full border hover:bg-muted transition">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
