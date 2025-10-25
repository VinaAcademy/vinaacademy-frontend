'use client';

import React, { createContext, useContext } from "react";
import { useQuery } from '@tanstack/react-query';
import { getCategories } from "@/services/categoryService";
import { CategoryDto } from "@/types/category";
import {CATEGORY_KEYS} from "@/config/query-keys.config";

interface CategoryContextType {
  categories: CategoryDto[];
  isLoading: boolean;
  error: Error | null;
  refreshCategories: () => void;
  getCategoryBySlug: (slug: string) => CategoryDto | undefined;
  getCategoryPath: (slug: string) => CategoryDto[];
  findSubcategories: (parentSlug: string) => CategoryDto[];
}

const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  isLoading: true,
  error: null,
  refreshCategories: () => { },
  getCategoryBySlug: () => undefined,
  getCategoryPath: () => [],
  findSubcategories: () => [],
});

export const useCategories = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
  } = useQuery<CategoryDto[], Error>({
    queryKey: CATEGORY_KEYS.all,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // dữ liệu cũ sau 5 phút
  });

  const getCategoryBySlug = (slug: string): CategoryDto | undefined => {
    const findInCategories = (cats: CategoryDto[]): CategoryDto | undefined => {
      for (const cat of cats) {
        if (cat.slug === slug) {
          return cat;
        }
        if (!cat.children) {
          continue;
        }

        const found = findInCategories(cat.children);
        if (found) {
          return found;
        }
      }
      return undefined;
    };
    return findInCategories(categories);
  };

  const getCategoryPath = (slug: string): CategoryDto[] => {
    const path: CategoryDto[] = [];
    const buildPath = (cats: CategoryDto[], targetSlug: string): boolean => {
      for (const cat of cats) {
        if (cat.slug === targetSlug) {
          path.push(cat);
          return true;
        }
        if (!cat.children || cat.children.length === 0) {
          continue;
        }

        if (buildPath(cat.children, targetSlug)) {
          path.unshift(cat);
          return true;
        }
      }
      return false;
    };
    buildPath(categories, slug);
    return path;
  };

  const findSubcategories = (parentSlug: string): CategoryDto[] => {
    const parent = getCategoryBySlug(parentSlug);
    return parent?.children || [];
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        isLoading,
        error,
        refreshCategories: refetch,
        getCategoryBySlug,
        getCategoryPath,
        findSubcategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
