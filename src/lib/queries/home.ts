// lib/queries/home.ts
import { cache } from "react";
import {query} from "../db";

export type Section = {
  section_key: string;
  title: string;
  enabled: boolean;
  sort_order: number;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  category_name: string | null;
};

export type Category = { 
  id: string; 
  name: string; 
  slug: string; 
  count: string; 
};

// 1. Consulta de secciones con caché y manejo de errores
export const getHomeSections = cache(async (): Promise<{ rows: Section[] }> => {
  try {
    return await query<Section>(
      `SELECT section_key, title, enabled, sort_order
       FROM home_sections
       WHERE enabled = TRUE
       ORDER BY sort_order, section_key`
    );
  } catch (error) {
    console.error("Error al obtener las secciones del home:", error);
    // Retornamos un objeto con rows vacío para evitar que la página explote
    return { rows: [] };
  }
});

// 2. Consulta de artículos destacados protegida
export const getFeaturedArticles = cache(async (): Promise<{ rows: Article[] }> => {
  try {
    return await query<Article>(
      `SELECT a.id, a.title, a.slug, a.excerpt, a.cover_image, c.name AS category_name
       FROM articles a
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.status = 'PUBLISHED' AND a.featured = TRUE
       ORDER BY a.published_at DESC NULLS LAST, a.id DESC
       LIMIT 6`
    );
  } catch (error) {
    console.error("Error al obtener los artículos destacados:", error);
    return { rows: [] };
  }
});

// 3. Consulta de categorías con artículos protegida
export const getCategoriesWithArticles = cache(async (): Promise<{ rows: Category[] }> => {
  try {
    return await query<Category>(
      `SELECT c.id, c.name, c.slug, COUNT(a.id)::text AS count
       FROM categories c
       JOIN articles a ON a.category_id = c.id AND a.status = 'PUBLISHED'
       WHERE c.active = TRUE
       GROUP BY c.id, c.name, c.slug
       HAVING COUNT(a.id) > 0
       ORDER BY c.name`
    );
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
    return { rows: [] };
  }
});