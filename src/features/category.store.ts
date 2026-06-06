import { create } from "zustand";
import type { Category } from "@/types/category";

type CategoryState = {
  categories: Category[];
  selectedCategory: Category | null;
  setCategories: (categories: Category[]) => void;
  setSelectedCategory: (category: Category | null) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Partial<Category> & { id: string }) => void;
  removeCategory: (id: string) => void;
  clearCategories: () => void;
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  selectedCategory: null,
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  addCategory: (category) =>
    set((state) => ({ categories: [category, ...state.categories] })),
  updateCategory: (category) =>
    set((state) => ({
      categories: state.categories.map((item) =>
        item.id === category.id ? { ...item, ...category } : item
      ),
      selectedCategory:
        state.selectedCategory?.id === category.id
          ? { ...state.selectedCategory, ...category }
          : state.selectedCategory,
    })),
  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((item) => item.id !== id),
      selectedCategory:
        state.selectedCategory?.id === id ? null : state.selectedCategory,
    })),
  clearCategories: () => set({ categories: [] }),
}));
