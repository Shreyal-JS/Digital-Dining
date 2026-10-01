import { describe, it, expect } from "vitest";
import { resolveTranslation } from "@/utils/language";

describe("Multi-Language Resolution Utility", () => {
  const baseDish = {
    name: "Classic Burger",
    description: "Juicy beef patty with cheddar",
    ingredients: "Beef, Cheddar, Brioche bun",
    allergens: "Gluten, Dairy",
    portion: "Single",
  };

  const translations = [
    {
      languageCode: "hi",
      name: "क्लासिक बर्गर",
      description: "स्वादिष्ट बीफ पैटी और चेडर",
      ingredients: "बीफ, चेडर, बन",
      allergens: "ग्लूटेन, डेयरी",
      portion: "एकल",
    },
  ];

  it("returns base dish when target language matches default language", () => {
    const result = resolveTranslation(baseDish, translations, "en", "en");
    expect(result.name).toBe("Classic Burger");
  });

  it("returns translated fields when matching translation exists", () => {
    const result = resolveTranslation(baseDish, translations, "hi", "en");
    expect(result.name).toBe("क्लासिक बर्गर");
    expect(result.description).toBe("स्वादिष्ट बीफ पैटी और चेडर");
  });

  it("gracefully falls back to default language when target translation is missing", () => {
    const result = resolveTranslation(baseDish, translations, "fr", "en");
    expect(result.name).toBe("Classic Burger");
    expect(result.description).toBe("Juicy beef patty with cheddar");
  });

  it("handles empty or undefined translations list gracefully", () => {
    const result = resolveTranslation(baseDish, undefined, "hi", "en");
    expect(result.name).toBe("Classic Burger");
  });
});
