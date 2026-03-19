
export const JSON_SCHEMAS = {
  RECIPE: {
    type: "object",
    properties: {
      title: { type: "string" },
      emoji: { type: "string" },
      summary: { type: "string" },
      ingredients: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            quantity: { type: "number" },
            unit: { type: "string" },
          },
          required: ["name", "quantity", "unit"],
          additionalProperties: false
        }
      },
      instructions: { type: "array", items: { type: "string" } },
      extractedTips: { type: "array", items: { type: "string" } },
      aiSuggestions: { type: "array", items: { type: "string" } }
    },
    required: ["title", "emoji", "summary", "ingredients", "instructions", "extractedTips", "aiSuggestions"],
    additionalProperties: false
  },
  GENIE: {
    type: "object",
    properties: {
      ideas: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            emoji: { type: "string" }
          },
          required: ["title", "summary", "emoji"],
          additionalProperties: false
        }
      }
    },
    required: ["ideas"],
    additionalProperties: false
  },
  ORCHESTRATION: {
    type: "object",
    properties: {
      optimizedSummary: { type: "string" },
      totalEstimatedTime: { type: "number" },
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            description: { type: "string" },
            type: { type: "string", enum: ["prep", "cook", "wait"] },
            recipeContext: { type: "string" },
            estimatedMinutes: { type: "number" }
          },
          required: ["id", "description", "type", "recipeContext"],
          additionalProperties: false
        }
      }
    },
    required: ["optimizedSummary", "totalEstimatedTime", "steps"],
    additionalProperties: false
  },
  MEAL_PLAN: {
    type: "object",
    properties: {
      plan: {
        type: "array",
        items: {
          type: "object",
          properties: {
            dayOffset: { type: "number", description: "0 for Monday, 6 for Sunday" },
            slot: { type: "string", enum: ["breakfast", "lunch", "dinner"] },
            recipeName: { type: "string", description: "Name of the recipe to cook" },
            emoji: { type: "string" }
          },
          required: ["dayOffset", "slot", "recipeName"],
          additionalProperties: false
        }
      }
    },
    required: ["plan"],
    additionalProperties: false
  },
  DEALS: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            store: { type: "string" },
            price: { type: "string" },
            url: { type: "string" },
            desc: { type: "string" },
            imageUrl: { type: "string" }
          },
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  },
  RECEIPT_EXTRACTION: {
    type: "object",
    description: "Extracted receipt data including store, date, and items.",
    properties: {
      analysis_steps: {
        type: "string",
        description: "Mandatory step-by-step audit. 1. Identify STORE & DATE. 2. For EACH item, write explicit math: (Price * Qty) - Discount = Line Total. 3. Sum all Line Totals. 4. Compare Calculated Sum vs Printed Total. If mismatch, find missing discount."
      },
      store: { type: "string", description: "The main brand name of the merchant." },
      date: { type: "string", description: "YYYY-MM-DD" },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Product name only. Cleaned of any leading codes/SKUs. Original language preserved." },
            generic_name: { type: "string", description: "The high-level product type in Traditional Chinese (e.g., '啤酒' for 'Asahi Beer', '沐浴露' for 'Shower Gel'). NO BRANDS." },
            category: {
              type: "string",
              description: "Select best fit: 'General', 'Alcohol', 'Dairy', 'Meat', 'Fruit', 'Vegetables', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen'.",
              enum: ["General", "Alcohol", "Dairy", "Meat", "Fruit", "Vegetables", "Pantry", "Snacks", "Beverages", "Household", "Frozen"]
            },
            price: { type: "number", description: "The TOTAL net price paid for this line (Count * Unit Price - proportional discounts)." },
            quantity: { type: "number", description: "The weight or volume per unit." },
            unit: { type: "string", description: "The unit (ml, g, kg, l, pcs, etc)." },
            count: { type: "number", description: "The quantity purchased. If line says 'x2', this is 2. Do not split into multiple items." },
            note: { type: "string", description: "Abbreviated note on discounts. Empty if none." }
          },
          required: ["name", "price", "category"],
          additionalProperties: false
        }
      },
      subtotal_detected: { type: "number" }
    },
    required: ["analysis_steps", "store", "date", "items", "subtotal_detected"],
    additionalProperties: false
  },
  MIGRATION_MAP: {
    type: "object",
    properties: {
      mappings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            original_name: { type: "string" },
            generic_name: { type: "string" }
          },
          required: ["original_name", "generic_name"],
          additionalProperties: false
        }
      }
    },
    required: ["mappings"],
    additionalProperties: false
  },
  REFINE_SUGGESTIONS: {
    type: "object",
    properties: {
      suggestions: {
        type: "array",
        items: { type: "string" }
      }
    },
    required: ["suggestions"],
    additionalProperties: false
  }
};
