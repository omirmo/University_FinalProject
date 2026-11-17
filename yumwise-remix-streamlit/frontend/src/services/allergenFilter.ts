import {
  AllergenId,
  ChildProfile,
  FoodItem,
  ResemblanceReasoning,
  SuggestionAllergenReport,
  SuggestionItem,
} from '../types';
import { ALLERGENS_LIST } from '../data/foodCatalog';

/**
 * Maps allergen IDs to human-readable Hebrew names.
 */
export function getAllergenLabelHe(id: AllergenId): string {
  const match = ALLERGENS_LIST.find((a) => a.id === id);
  return match ? match.labelHe : id;
}

/**
 * Strictly checks a single food item against a child's allergen and restriction profile.
 *
 * Rules:
 * - If the item explicitly contains any allergen the child is allergic to -> EXCLUDED (isSafe: false)
 * - If the item may contain an allergen the child is allergic to -> EXCLUDED or marked as needing verification
 * - If the item's allergen status is uncertain -> marked as needing parent verification
 */
export function assessItemAllergenSafety(
  item: FoodItem,
  profile: ChildProfile
): SuggestionAllergenReport {
  const conflicts: string[] = [];
  let needsVerification = false;
  let verificationReason: string | undefined;

  // 1. Direct allergen conflicts
  for (const allergen of profile.allergens) {
    if (item.allergens.includes(allergen)) {
      conflicts.push(`מכיל ${getAllergenLabelHe(allergen)}`);
    }
  }

  // 2. May contain allergen warnings
  for (const allergen of profile.allergens) {
    if (item.mayContain.includes(allergen)) {
      conflicts.push(`עלול להכיל עקבות של ${getAllergenLabelHe(allergen)}`);
    }
  }

  // 3. Custom dietary restrictions check (e.g. sugar, texture, vegetarian)
  if (profile.customDietaryRestrictions && profile.customDietaryRestrictions.length > 0) {
    for (const restriction of profile.customDietaryRestrictions) {
      const lowerRes = restriction.toLowerCase();
      if (
        lowerRes.includes('סוכר') &&
        item.nutritionFacts?.addedSugarGrams &&
        item.nutritionFacts.addedSugarGrams > 0
      ) {
        conflicts.push(`מכיל סוכר מוסף בניגוד להגבלה: ${restriction}`);
      }
    }
  }

  // 4. Uncertainty check: If allergen info is missing or uncertain, NEVER mark as safe without verification
  if (!item.allergenStatusCertain) {
    needsVerification = true;
    verificationReason =
      'סטטוס האלרגנים טרם אומת באופן רשמי על ידי מעבדה או יצרן. דורש בדיקה עצמאית של ההורה על גבי האריזה.';
  } else if (item.mayContain.length > 0) {
    needsVerification = true;
    const mayContainLabels = item.mayContain.map((id) => getAllergenLabelHe(id)).join(', ');
    verificationReason = `עלול להיארז במפעל המטפל ב-${mayContainLabels}. דורש אימות הורה לגבי אזהרות אלרגנים.`;
  }

  const isSafe = conflicts.length === 0;

  return {
    isSafe,
    conflicts,
    needsParentVerification: needsVerification,
    verificationReason,
  };
}

/**
 * Filter a list of food items strictly BEFORE any ranking takes place.
 * Any food that conflicts with the child's profile is discarded completely.
 */
export function filterSafeFoodAlternatives(
  items: FoodItem[],
  profile: ChildProfile
): {
  safeItems: FoodItem[];
  excludedItems: { item: FoodItem; report: SuggestionAllergenReport }[];
} {
  const safeItems: FoodItem[] = [];
  const excludedItems: { item: FoodItem; report: SuggestionAllergenReport }[] = [];

  for (const item of items) {
    const report = assessItemAllergenSafety(item, profile);
    if (report.isSafe) {
      safeItems.push(item);
    } else {
      excludedItems.push({ item, report });
    }
  }

  return { safeItems, excludedItems };
}

/**
 * Evaluates sensory resemblance (Taste, Texture, Color, Consistency)
 * between the child's request / craving and a food item.
 */
export function calculateSensoryResemblance(
  item: FoodItem,
  childRequest: string,
  parentNote?: string
): { score: number; reasoning: ResemblanceReasoning } {
  const requestTokens = (childRequest + ' ' + (parentNote || ''))
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);

  let score = 10; // base score

  // Keyword associations for common children cravings
  const isChocolateCraving = /שוקולד|חום|קקאו|ממתק|נוטלה|שוקולד צ'יפס|חטיף מתוק/i.test(childRequest + ' ' + parentNote);
  const isIceCreamCraving = /גלידה|ארטיק|קרטיב|קר|קפוא|שלגון|סורבה/i.test(childRequest + ' ' + parentNote);
  const isChipsCraving = /צ'יפס|ציפס|מלוח|חטיף|ביסלי|במבה|קראנצ'י|פריך|תפוצ'יפס|מטוגן/i.test(childRequest + ' ' + parentNote);
  const isCandyCraving = /סוכריות|סוכריה|גומי|טופי|רול אפס|סוכר/i.test(childRequest + ' ' + parentNote);
  const isBakeryCraving = /עוגיות|עוגה|מאפה|קוראסון|דונאט|בצק/i.test(childRequest + ' ' + parentNote);

  // Category matching
  if (isChocolateCraving && item.category.includes('שוקולד')) score += 30;
  if (isIceCreamCraving && item.category.includes('גלידות')) score += 35;
  if (isChipsCraving && item.category.includes('מלוחים')) score += 35;
  if (isCandyCraving && (item.category.includes('ממתקים') || item.emoji === '🍓' || item.emoji === '🍇')) score += 30;
  if (isBakeryCraving && item.category.includes('מאפים')) score += 35;

  // Sensory attribute overlap matching
  const allSensoryWords = [
    ...item.sensory.taste,
    ...item.sensory.texture,
    ...item.sensory.color,
    ...item.sensory.consistency,
    item.descriptionHe,
    item.nameHe,
  ].join(' ');

  for (const token of requestTokens) {
    if (allSensoryWords.includes(token)) {
      score += 15;
    }
  }

  // Build transparent sensory resemblance breakdown
  let tasteReason = `טעם: מדמה את המתיקות והעושר (${item.sensory.taste.join(', ')}).`;
  let textureReason = `מרקם: מעניק תחושה דומה בפה (${item.sensory.texture.join(', ')}).`;
  let colorReason = `צבע ומראה: תואם בגווני ${item.sensory.color.join(', ')}.`;
  let consistencyReason = `עקביות וטמפרטורה: ${item.sensory.consistency.join(', ')}.`;
  let summary = `חלופה בריאה המדמה את החשק של הילד ל${childRequest} באמצעות מרקם וטעם דומים, תוך שמירה על בטיחות אלרגנים.`;

  if (isChocolateCraving) {
    tasteReason = `טעם: שוקולדי ומתוק עשיר (${item.sensory.taste.join(', ')}), ללא מרירות וללא סוכר לבן מעובד.`;
    textureReason = `מרקם: נמס ונימוח בפה (${item.sensory.texture.join(', ')}), ממש כמו ממתק שוקולד אמיתי.`;
    colorReason = `צבע ומראה: צבע חום כהה ועמוק שמזכיר שוקולד חלב או שוקולד מריר.`;
    summary = `מענה מושלם לחשק לשוקולד, בעל מרקם נימוח וצבע כהה זהה.`;
  } else if (isIceCreamCraving) {
    tasteReason = `טעם: מתוק פירותי מרענן (${item.sensory.taste.join(', ')}).`;
    textureReason = `מרקם: חלקלק וקטיפתי שנמס על הלשון בקרירות נעימה.`;
    consistencyReason = `עקביות וטמפרטורה: קפוא ומרענן (${item.sensory.consistency.join(', ')}), בדיוק כמו גלידה.`;
    summary = `מספק את תחושת הקרירות והקרמיות של גלידה או שלגון ללא שמנת או שומן מוקשה.`;
  } else if (isChipsCraving) {
    tasteReason = `טעם: חטיפי ומספק (${item.sensory.taste.join(', ')}).`;
    textureReason = `מרקם: סופר פריך וקראנצ׳י (${item.sensory.texture.join(', ')}), מתפצח בשיניים כמו צ׳יפס או חטיף שקית.`;
    summary = `מספק את פעולת הפיצוח והקראנצ׳יות שילדים אוהבים בצ׳יפס, אך ללא טיגון עמוק.`;
  } else if (isCandyCraving) {
    tasteReason = `טעם: מתיקות מרוכזת וחמצמצה (${item.sensory.taste.join(', ')}).`;
    textureReason = `מרקם: לעיס או נמס בפה (${item.sensory.texture.join(', ')}), ממש כמו סוכרייה או גומייה.`;
    summary = `תחליף צבעוני ועליז לסוכריות גומי, המבוסס על סוכר פרי טבעי בלבד.`;
  }

  return {
    score,
    reasoning: {
      taste: tasteReason,
      texture: textureReason,
      color: colorReason,
      consistency: consistencyReason,
      summary,
    },
  };
}

/**
 * Full suggestion pipeline:
 * 1. Hard Allergen Filter (Excludes any unsafe item first!)
 * 2. Sensory Resemblance Scoring
 * 3. Sorting & Slicing to configurable count (default 3)
 */
export function rankFoodSuggestions(
  items: FoodItem[],
  profile: ChildProfile,
  childRequest: string,
  parentNote?: string,
  maxSuggestions: number = 3
): SuggestionItem[] {
  // Step 1: Filter safe alternatives strictly before ranking
  const { safeItems } = filterSafeFoodAlternatives(items, profile);

  if (safeItems.length === 0) {
    return [];
  }

  // Step 2: Calculate resemblance and construct suggestions
  const evaluatedSuggestions: SuggestionItem[] = safeItems.map((foodItem) => {
    const allergenReport = assessItemAllergenSafety(foodItem, profile);
    const { score, reasoning } = calculateSensoryResemblance(foodItem, childRequest, parentNote);

    return {
      id: `sug_${foodItem.id}`,
      foodItem,
      resemblance: reasoning,
      allergenReport,
      parentApproved: false,
      resemblanceScore: score,
    } as SuggestionItem & { resemblanceScore: number };
  });

  // Step 3: Sort by resemblance score descending
  evaluatedSuggestions.sort(
    (a, b) =>
      ((b as unknown as { resemblanceScore: number }).resemblanceScore || 0) -
      ((a as unknown as { resemblanceScore: number }).resemblanceScore || 0)
  );

  // Step 4: Return configured number of suggestions (up to maxSuggestions)
  return evaluatedSuggestions.slice(0, Math.max(1, maxSuggestions));
}
