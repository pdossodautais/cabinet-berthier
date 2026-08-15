export type PropertyType = "appartement" | "maison" | "terrain" | "commerce" | "bureau";
export type TransactionType = "vente" | "location";
export type ContactStatus = "nouveau" | "lu" | "traité" | "archivé";
export type EnergyRating = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type EstimationStatus = "nouveau" | "en_cours" | "terminé";
export type AgentRole = "admin" | "agent";
export type DocumentType = "plan" | "diagnostic" | "document";

export interface Property {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  description: string;
  type: PropertyType;
  transaction_type: TransactionType;
  price: number;
  surface: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  address: string;
  city: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  energy_rating: EnergyRating | null;
  ghg_rating: EnergyRating | null;
  is_featured: boolean;
  is_published: boolean;
  agent_id: string | null;
  features: string[];
  construction_year: number | null;
  heating_type: string | null;
  energy_sources: string[];
  sold_at: string | null;
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  url: string;
  position: number;
  alt_text: string | null;
}

export interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  bio: string | null;
  is_active: boolean;
  role: AgentRole;
  user_id: string | null;
}

export interface Contact {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string;
  property_id: string | null;
  status: ContactStatus;
}

export interface Setting {
  key: string;
  value: string;
}

export interface Estimation {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  surface: number | null;
  rooms: number | null;
  address: string;
  city: string;
  postal_code: string;
  property_type: PropertyType;
  message: string | null;
  status: EstimationStatus;
}

export interface Post {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  is_published: boolean;
  author_id: string | null;
}

export interface PostWithAuthor extends Post {
  agents: Pick<Agent, "first_name" | "last_name" | "photo_url"> | null;
}

export interface Testimonial {
  id: string;
  created_at: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  photo_url: string | null;
  url: string | null;
  is_published: boolean;
}

export interface PropertyDocument {
  id: string;
  created_at: string;
  property_id: string;
  name: string;
  url: string;
  type: DocumentType;
  position: number;
}

export type NotificationEventType = "contact" | "estimation";

export interface NotificationPreference {
  id: string;
  agent_id: string;
  event_type: NotificationEventType;
  enabled: boolean;
  created_at: string;
}

export interface ContactReply {
  id: string;
  created_at: string;
  contact_id: string;
  message: string;
  sent_by: string | null;
}

export interface PropertyWithMedia extends Property {
  property_media: PropertyMedia[];
  agents: Agent | null;
  property_documents?: PropertyDocument[];
}

export interface ContactWithProperty extends Contact {
  properties: { title: string; slug: string } | null;
}

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: Property;
        Insert: Omit<Property, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Property, "id" | "created_at" | "updated_at">>;
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
      property_media: {
        Row: PropertyMedia;
        Insert: Omit<PropertyMedia, "id">;
        Update: Partial<Omit<PropertyMedia, "id">>;
        Relationships: [
          {
            foreignKeyName: "property_media_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      agents: {
        Row: Agent;
        Insert: Omit<Agent, "id">;
        Update: Partial<Omit<Agent, "id">>;
        Relationships: [];
      };
      contacts: {
        Row: Contact;
        Insert: Omit<Contact, "id" | "created_at">;
        Update: Partial<Omit<Contact, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "contacts_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: Setting;
        Insert: Setting;
        Update: Partial<Setting>;
        Relationships: [];
      };
      estimations: {
        Row: Estimation;
        Insert: Omit<Estimation, "id" | "created_at">;
        Update: Partial<Omit<Estimation, "id" | "created_at">>;
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Post, "id" | "created_at" | "updated_at">>;
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
      testimonials: {
        Row: Testimonial;
        Insert: Omit<Testimonial, "id" | "created_at">;
        Update: Partial<Omit<Testimonial, "id" | "created_at">>;
        Relationships: [];
      };
      property_documents: {
        Row: PropertyDocument;
        Insert: Omit<PropertyDocument, "id" | "created_at">;
        Update: Partial<Omit<PropertyDocument, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_preferences: {
        Row: NotificationPreference;
        Insert: Omit<NotificationPreference, "id" | "created_at">;
        Update: Partial<Omit<NotificationPreference, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "notification_preferences_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_replies: {
        Row: ContactReply;
        Insert: Omit<ContactReply, "id" | "created_at">;
        Update: Partial<Omit<ContactReply, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "contact_replies_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contact_replies_sent_by_fkey";
            columns: ["sent_by"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      property_type: PropertyType;
      transaction_type: TransactionType;
      energy_rating: EnergyRating;
      contact_status: ContactStatus;
      estimation_status: EstimationStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
