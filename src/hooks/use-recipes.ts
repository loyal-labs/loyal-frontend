"use client";

import { useCallback, useEffect, useState } from "react";

export interface Recipe {
  id: string;
  name: string;
  type: "telegram" | "wallet";
  tokenSymbol: string;
  tokenMint: string;
  tokenDecimals: number;
  amount: string;
  recipient: string;
  photoUrl?: string;
  createdAt: number;
}

const RECIPES_STORAGE_KEY = "loyal-recipes";

// Demo recipe for showcasing the feature
const DEMO_RECIPE: Recipe = {
  id: "demo-recipe",
  name: "Send 0.0001 SOL to Vlad",
  type: "telegram",
  tokenSymbol: "SOL",
  tokenMint: "So11111111111111111111111111111111111111112",
  tokenDecimals: 9,
  amount: "0.0001",
  recipient: "vlad_arbatov",
  photoUrl: "/vlad.jpg",
  createdAt: Date.now(),
};

function loadRecipes(): Recipe[] {
  if (typeof window === "undefined") { return []; }
  try {
    const stored = localStorage.getItem(RECIPES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecipes(recipes: Recipe[]): void {
  if (typeof window === "undefined") { return; }
  localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const showDemoRecipe = process.env.NEXT_PUBLIC_DEMO_RECIPE === "true";

  // Load recipes from localStorage on mount
  useEffect(() => {
    setRecipes(loadRecipes());
  }, []);

  const addRecipe = useCallback((recipe: Omit<Recipe, "id" | "createdAt">) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: `recipe-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: Date.now(),
    };

    setRecipes((prev) => {
      const updated = [...prev, newRecipe];
      saveRecipes(updated);
      return updated;
    });

    return newRecipe;
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveRecipes(updated);
      return updated;
    });
  }, []);

  const generateRecipeName = useCallback(
    (
      _tokenSymbol: string,
      _amount: string,
      _recipient: string,
      _type: "telegram" | "wallet"
    ): string => {
      // Demo: always generate "Send 0.0001 SOL to Vlad"
      return "Send 0.0001 SOL to Vlad";
    },
    []
  );

  // Include demo recipe if env var is set
  const allRecipes = showDemoRecipe
    ? [DEMO_RECIPE, ...recipes.filter((r) => r.id !== "demo-recipe")]
    : recipes;

  return {
    recipes: allRecipes,
    addRecipe,
    deleteRecipe,
    generateRecipeName,
  };
}
