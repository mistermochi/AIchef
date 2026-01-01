
import { Type } from "@google/genai";

export const SCHEMAS = {
  RECIPE: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      emoji: { type: Type.STRING },
      summary: { type: Type.STRING },
      ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            unit: { type: Type.STRING },
          },
          required: ['name', 'quantity', 'unit'],
        }
      },
      instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
      extractedTips: { type: Type.ARRAY, items: { type: Type.STRING } },
      aiSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['title', 'emoji', 'summary', 'ingredients', 'instructions', 'extractedTips', 'aiSuggestions'],
  },
  GENIE: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        emoji: { type: Type.STRING }
      },
      required: ['title', 'summary', 'emoji'],
    }
  },
  ORCHESTRATION: {
    type: Type.OBJECT,
    properties: {
      optimizedSummary: { type: Type.STRING },
      totalEstimatedTime: { type: Type.NUMBER },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['prep', 'cook', 'wait'] },
            recipeContext: { type: Type.STRING },
            estimatedMinutes: { type: Type.NUMBER }
          },
          required: ['id', 'description', 'type', 'recipeContext'],
        }
      }
    },
    required: ['optimizedSummary', 'totalEstimatedTime', 'steps'],
  },
  DEALS: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        store: { type: Type.STRING },
        price: { type: Type.STRING },
        url: { type: Type.STRING },
        desc: { type: Type.STRING },
        imageUrl: { type: Type.STRING }
      }
    }
  },
  RECEIPT_EXTRACTION: {
    type: Type.OBJECT,
    description: "Extracted receipt data including store, date, and items.",
    properties: {
      analysis_steps: { 
        type: Type.STRING, 
        description: "Mandatory step-by-step audit. 1. Identify STORE & DATE. 2. For EACH item, write explicit math: (Price * Qty) - Discount = Line Total. 3. Sum all Line Totals. 4. Compare Calculated Sum vs Printed Total. If mismatch, find missing discount." 
      },
      store: { type: Type.STRING, description: "The main brand name of the merchant." },
      date: { type: Type.STRING, description: "YYYY-MM-DD" },
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Product name only. Cleaned of any leading codes/SKUs. Original language preserved." },
            generic_name: { type: Type.STRING, description: "The high-level product type in Traditional Chinese (e.g., '啤酒' for 'Asahi Beer', '沐浴露' for 'Shower Gel'). NO BRANDS." },
            category: { 
              type: Type.STRING, 
              description: "Select best fit: 'General', 'Alcohol', 'Dairy', 'Meat', 'Fruit', 'Vegetables', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen'.",
              enum: ['General', 'Alcohol', 'Dairy', 'Meat', 'Fruit', 'Vegetables', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen']
            },
            price: { type: Type.NUMBER, description: "The TOTAL net price paid for this line (Count * Unit Price - proportional discounts)." },
            quantity: { type: Type.NUMBER, description: "The weight or volume per unit." },
            unit: { type: Type.STRING, description: "The unit (ml, g, kg, l, pcs, etc)." },
            count: { type: Type.NUMBER, description: "The quantity purchased. If line says 'x2', this is 2. Do not split into multiple items." },
            note: { type: Type.STRING, description: "Abbreviated note on discounts. Empty if none." }
          },
          required: ['name', 'price', 'category']
        }
      },
      subtotal_detected: { type: Type.NUMBER }
    },
    required: ['analysis_steps', 'store', 'date', 'items', 'subtotal_detected']
  },
  MIGRATION_MAP: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        original_name: { type: Type.STRING },
        generic_name: { type: Type.STRING }
      },
      required: ['original_name', 'generic_name']
    }
  }
};
