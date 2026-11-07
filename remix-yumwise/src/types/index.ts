export type AllergenId =
  | 'peanuts'
  | 'dairy'
  | 'tree_nuts'
  | 'gluten'
  | 'eggs'
  | 'sesame'
  | 'soy'
  | 'fish'
  | 'strawberries';

export interface AllergenDef {
  id: AllergenId;
  labelHe: string;
  labelEn: string;
  iconName: string;
  descriptionHe: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  allergens: AllergenId[];
  customDietaryRestrictions: string[];
  notes?: string;
}

export interface SensoryAttributes {
  taste: string[]; // e.g., ['מתוק', 'שוקולדי']
  texture: string[]; // e.g., ['נימוח', 'קרמי']
  color: string[]; // e.g., ['חום כהה']
  consistency: string[]; // e.g., ['סמיך', 'קריר']
}

export interface VerifiedNutrition {
  servingSize: string;
  calories?: number;
  fiberGrams?: number;
  sugarGrams?: number;
  addedSugarGrams?: number;
  proteinGrams?: number;
  highlightsHe: string[];
}

export interface FoodItem {
  id: string;
  nameHe: string;
  nameEn: string;
  category: string;
  descriptionHe: string;
  emoji: string;
  sensory: SensoryAttributes;
  allergens: AllergenId[];
  mayContain: AllergenId[];
  allergenStatusCertain: boolean; // if false, always flagged as "דורש אימות הורה"
  isVerifiedData: boolean;
  nutritionDataSource?: string;
  nutritionFacts?: VerifiedNutrition;
  prepIdeaHe?: string;
}

export interface ResemblanceReasoning {
  taste: string;
  texture: string;
  color: string;
  consistency: string;
  summary: string;
}

export interface SuggestionAllergenReport {
  isSafe: boolean;
  conflicts: string[];
  needsParentVerification: boolean;
  verificationReason?: string;
}

export interface SuggestionItem {
  id: string;
  foodItem: FoodItem;
  resemblance: ResemblanceReasoning;
  allergenReport: SuggestionAllergenReport;
  parentApproved?: boolean;
}

export interface FoodRequestState {
  rawInput: string;
  inputType: 'draw' | 'text' | 'voice';
  recognizedCategory?: string;
  isAiRecognized?: boolean;
  recognitionCertaintyNote?: string;
  drawingImageBase64?: string;
  parentNote?: string;
  confirmedText: string;
}
