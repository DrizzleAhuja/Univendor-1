// Export the dummyProducts object for use in product-details.tsx
export const dummyProducts = {
  electronics: [
    {
      id: "1",
      name: "Premium Cotton T-Shirt",
      price: 29.99,
      mrp: 39.99,
      description: "Comfortable and stylish everyday wear",
      colors: [
        {
          name: "Navy",
          hex: "#000080",
          image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop"
        },
        {
          name: "Black",
          hex: "#000000",
          image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500&h=500&fit=crop"
        },
        {
          name: "White",
          hex: "#FFFFFF",
          image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&h=500&fit=crop"
        }
      ],
      sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
      vendor: "FashionStyle",
      rating: 4.5,
      reviews: 128
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 299.99,
      description: "Advanced fitness tracking and notifications",
      colors: [
        { name: "Space Gray", hex: "#2F2F2F", image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300" },
        { name: "Silver", hex: "#C0C0C0", image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=300" },
      ],
      vendor: "TechPro",
      rating: 4.8,
      reviews: 245,
    },
  ],
  fashion: [
    {
      id: "2",
      name: "Classic Denim Jacket",
      price: 79.99,
      mrp: 99.99,
      description: "Timeless denim jacket perfect for any occasion",
      colors: [
        {
          name: "Blue",
          hex: "#0000FF",
          image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&h=500&fit=crop"
        },
        {
          name: "Light Blue",
          hex: "#ADD8E6",
          image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop"
        }
      ],
      sizes: ["S", "M", "L", "XL"],
      vendor: "DenimCo",
      rating: 4.8,
      reviews: 256
    },
    {
      id: 4,
      name: "Designer Jeans",
      price: 79.99,
      description: "Premium denim with perfect fit",
      sizes: ["28", "30", "32", "34", "36", "38"],
      colors: [
        { name: "Dark Blue", hex: "#00008B", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300" },
        { name: "Light Blue", hex: "#ADD8E6", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300" },
        { name: "Black", hex: "#000000", image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=300" },
      ],
      vendor: "FashionStyle",
      rating: 4.6,
      reviews: 156,
    },
  ],
  homeGarden: [
    {
      id: "3",
      name: "Modern Coffee Table",
      price: 199.99,
      mrp: 249.99,
      description: "Sleek and modern coffee table for your living room",
      colors: [
        {
          name: "Walnut",
          hex: "#773F1A",
          image: "https://images.unsplash.com/photo-1532372320572-cda25653a26f?w=500&h=500&fit=crop"
        },
        {
          name: "Oak",
          hex: "#D2B48C",
          image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&h=500&fit=crop"
        }
      ],
      sizes: [],
      vendor: "HomeDecor",
      rating: 4.6,
      reviews: 89
    },
    {
      id: 6,
      name: "Indoor Plant Set",
      price: 49.99,
      description: "Set of 3 low-maintenance plants",
      colors: [
        { name: "White Pot", hex: "#FFFFFF", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300" },
        { name: "Terra Cotta", hex: "#E2725B", image: "https://images.unsplash.com/photo-1459156212016-306b6ae9a720?w=300" },
      ],
      vendor: "HomeDecor",
      rating: 4.7,
      reviews: 92,
    },
  ],
}; 