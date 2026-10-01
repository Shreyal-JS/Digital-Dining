/**
 * Multi-Language Resolution Helper
 * Spec Reference: Section 12 (Multi-Language System)
 * 
 * Rules:
 * 1. Target language requested by user.
 * 2. Fallback to restaurant's defaultLanguage if translation not present.
 * 3. Never silently machine-translate without explicit restaurant authoring.
 */

export interface TranslatableEntity {
  name: string;
  description?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
  portion?: string | null;
}

export interface TranslationRecord {
  languageCode: string;
  name: string;
  description?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
  portion?: string | null;
}

export function resolveTranslation<T extends TranslatableEntity>(
  baseEntity: T,
  translations: TranslationRecord[] | undefined,
  targetLang: string,
  defaultLang = "en"
): T {
  if (!translations || translations.length === 0 || targetLang === defaultLang) {
    return baseEntity;
  }

  const matchingTranslation = translations.find(
    (t) => t.languageCode.toLowerCase() === targetLang.toLowerCase()
  );

  if (!matchingTranslation) {
    // Graceful fallback to base entity (restaurant default language)
    return baseEntity;
  }

  return {
    ...baseEntity,
    name: matchingTranslation.name || baseEntity.name,
    description: matchingTranslation.description ?? baseEntity.description,
    ingredients: matchingTranslation.ingredients ?? baseEntity.ingredients,
    allergens: matchingTranslation.allergens ?? baseEntity.allergens,
    portion: matchingTranslation.portion ?? baseEntity.portion,
  };
}
