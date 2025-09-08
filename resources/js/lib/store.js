import { create } from 'zustand';

export const useStore = create((set) => ({
  user: {
    name: "John Doe",
    avatar: "https://via.placeholder.com/40",
    role: "admin"
  },
  
  // Sales data
  salesStats: {
    totalRevenue: 125400,
    totalSales: 247,
    totalProducts: 89,
    totalCustomers: 156
  },
  
  // Recently added products
  recentProducts: [
    { id: 1, name: "Wireless Headphones", category: "Electronics", dateAdded: "2024-01-15" },
    { id: 2, name: "Coffee Maker", category: "Appliances", dateAdded: "2024-01-14" },
    { id: 3, name: "Office Chair", category: "Furniture", dateAdded: "2024-01-13" },
    { id: 4, name: "Laptop Stand", category: "Accessories", dateAdded: "2024-01-12" },
    { id: 5, name: "Desk Lamp", category: "Lighting", dateAdded: "2024-01-11" }
  ],
  
  // Top selling products
  topProducts: [
    { id: 1, name: "Smartphone", unitsSold: 145, totalRevenue: 29000 },
    { id: 2, name: "Laptop", unitsSold: 89, totalRevenue: 89000 },
    { id: 3, name: "Tablet", unitsSold: 76, totalRevenue: 30400 },
    { id: 4, name: "Smartwatch", unitsSold: 64, totalRevenue: 19200 },
    { id: 5, name: "Wireless Earbuds", unitsSold: 52, totalRevenue: 7800 }
  ],
  
  // Sample sales report data
  salesReportData: {
    daily: [
      { date: "2024-01-15", productName: "Smartphone", buyingPrice: 150, sellingPrice: 200, quantitySold: 5 },
      { date: "2024-01-15", productName: "Laptop", buyingPrice: 800, sellingPrice: 1000, quantitySold: 2 },
      { date: "2024-01-14", productName: "Tablet", buyingPrice: 300, sellingPrice: 400, quantitySold: 3 },
      { date: "2024-01-14", productName: "Smartwatch", buyingPrice: 200, sellingPrice: 300, quantitySold: 4 },
      { date: "2024-01-13", productName: "Wireless Earbuds", buyingPrice: 100, sellingPrice: 150, quantitySold: 8 }
    ],
    weekly: [
      { date: "Week 3 (Jan 15-21)", productName: "Smartphone", buyingPrice: 150, sellingPrice: 200, quantitySold: 25 },
      { date: "Week 3 (Jan 15-21)", productName: "Laptop", buyingPrice: 800, sellingPrice: 1000, quantitySold: 12 },
      { date: "Week 2 (Jan 8-14)", productName: "Tablet", buyingPrice: 300, sellingPrice: 400, quantitySold: 18 },
      { date: "Week 2 (Jan 8-14)", productName: "Smartwatch", buyingPrice: 200, sellingPrice: 300, quantitySold: 22 },
      { date: "Week 1 (Jan 1-7)", productName: "Wireless Earbuds", buyingPrice: 100, sellingPrice: 150, quantitySold: 35 }
    ],
    monthly: [
      { date: "January 2024", productName: "Smartphone", buyingPrice: 150, sellingPrice: 200, quantitySold: 145 },
      { date: "January 2024", productName: "Laptop", buyingPrice: 800, sellingPrice: 1000, quantitySold: 89 },
      { date: "December 2023", productName: "Tablet", buyingPrice: 300, sellingPrice: 400, quantitySold: 76 },
      { date: "December 2023", productName: "Smartwatch", buyingPrice: 200, sellingPrice: 300, quantitySold: 64 },
      { date: "November 2023", productName: "Wireless Earbuds", buyingPrice: 100, sellingPrice: 150, quantitySold: 52 }
    ]
  },

  // Actions
  setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
}));