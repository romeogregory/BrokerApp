// Domain type definitions for BrokerApp

export enum PropertyStatus {
  Draft = "draft",
  Generated = "generated",
  Published = "published",
}

export enum Platform {
  Funda = "funda",
  Pararius = "pararius",
  Jaap = "jaap",
}

export interface Property {
  id: string;
  address: string;
  postalCode: string;
  city: string;
  price: number;
  squareMeters: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  buildYear: number;
  energyLabel: string;
  status: PropertyStatus;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Advert {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  features: string[];
  platform: Platform;
  createdAt: Date;
}

export interface DashboardStats {
  totalProperties: number;
  generatedThisMonth: number;
  published: number;
  averageGenerationTime: string;
  totalPropertiesTrend: number;
  generatedThisMonthTrend: number;
  publishedTrend: number;
  averageGenerationTimeTrend: number;
}

export interface ActivityItem {
  id: string;
  type: "generated" | "edited" | "published";
  propertyAddress: string;
  propertyId: string;
  platform?: Platform;
  timestamp: Date;
}
