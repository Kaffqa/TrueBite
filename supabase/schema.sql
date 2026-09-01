-- ============================================================================
-- 1. EXTENSIONS & ENUMS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Gender options
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');

-- Activity level options (for TDEE calculation)
CREATE TYPE activity_level_type AS ENUM ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active');

-- Health goal options (for macro/calorie calculation)
CREATE TYPE health_goal_type AS ENUM ('lose_weight_fast', 'lose_weight_gradual', 'maintain_weight', 'gain_muscle', 'manage_condition');

-- Type of scan performed
CREATE TYPE scan_type_enum AS ENUM ('meal_photo', 'nutrition_label', 'ingredients_list', 'barcode');

-- Safety status based on user's health profile
CREATE TYPE safety_status_enum AS ENUM ('safe', 'caution', 'danger', 'unknown');

-- Meal types
CREATE TYPE meal_type_enum AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- ============================================================================
-- 2. TABLE: profiles
-- ============================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    birth_date DATE,
    gender gender_type DEFAULT 'other',
    
    -- Body metrics
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    target_weight_kg NUMERIC(5,2),
    
    -- Lifestyle & Goals
    activity_level activity_level_type DEFAULT 'sedentary',
    goal health_goal_type DEFAULT 'maintain_weight',
    
    -- Calculated Metrics (populated by trigger)
    calculated_bmr NUMERIC(7,2),
    calculated_tdee NUMERIC(7,2),
    target_calories NUMERIC(7,2),
    target_protein_g NUMERIC(7,2),
    target_carbs_g NUMERIC(7,2),
    target_fat_g NUMERIC(7,2),
    target_fiber_g NUMERIC(7,2),
    target_sodium_mg NUMERIC(7,2),
    target_sugar_g NUMERIC(7,2),
    
    -- Health Data (arrays for GIN indexing)
    allergies TEXT[] DEFAULT '{}',
    intolerances TEXT[] DEFAULT '{}',
    medical_conditions TEXT[] DEFAULT '{}',
    dietary_preferences TEXT[] DEFAULT '{}',
    
    -- App state
    is_onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- GIN indexes for array searching
CREATE INDEX idx_profiles_allergies ON profiles USING GIN (allergies);
CREATE INDEX idx_profiles_medical_conditions ON profiles USING GIN (medical_conditions);
CREATE INDEX idx_profiles_dietary_preferences ON profiles USING GIN (dietary_preferences);

-- ============================================================================
-- 3. TABLE: food_scans
-- ============================================================================
CREATE TABLE food_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT,
    thumbnail_url TEXT,
    scan_type scan_type_enum,
    meal_title TEXT,
    confidence_score NUMERIC(4,3),
    safety_status safety_status_enum DEFAULT 'safe',
    health_warnings JSONB DEFAULT '[]'::jsonb,
    
    -- Total estimated macros from this scan
    total_calories NUMERIC(7,2),
    total_protein_g NUMERIC(7,2),
    total_carbs_g NUMERIC(7,2),
    total_fat_g NUMERIC(7,2),
    total_fiber_g NUMERIC(7,2),
    total_sugar_g NUMERIC(7,2),
    total_sodium_mg NUMERIC(7,2),
    
    -- AI metadata
    raw_ai_response JSONB,
    ai_model_version TEXT,
    processing_time_ms INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for frequent queries
CREATE INDEX idx_food_scans_user_id ON food_scans(user_id);
CREATE INDEX idx_food_scans_user_recent ON food_scans(user_id, created_at DESC);
CREATE INDEX idx_food_scans_user_safety ON food_scans(user_id, safety_status);

-- ============================================================================
-- 4. TABLE: scan_items
-- ============================================================================
CREATE TABLE scan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL REFERENCES food_scans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    item_name TEXT,
    estimated_weight_g NUMERIC(7,2),
    portion_description TEXT,
    
    -- Per-item macros
    calories NUMERIC(7,2),
    protein_g NUMERIC(7,2),
    carbs_g NUMERIC(7,2),
    fat_g NUMERIC(7,2),
    fiber_g NUMERIC(7,2),
    sugar_g NUMERIC(7,2),
    sodium_mg NUMERIC(7,2),
    
    -- Safety per item
    detected_allergens TEXT[] DEFAULT '{}',
    item_safety_status safety_status_enum,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_scan_items_scan_id ON scan_items(scan_id);
CREATE INDEX idx_scan_items_user_id ON scan_items(user_id);

-- ============================================================================
-- 5. TABLE: meal_logs
-- ============================================================================
CREATE TABLE meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES food_scans(id) ON DELETE SET NULL,
    
    meal_type meal_type_enum,
    consumed_at TIMESTAMPTZ DEFAULT now(),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    food_name TEXT,
    portion_multiplier NUMERIC(4,2) DEFAULT 1.0,
    
    -- Logged macros (item macros * portion)
    calories NUMERIC(7,2),
    protein_g NUMERIC(7,2),
    carbs_g NUMERIC(7,2),
    fat_g NUMERIC(7,2),
    fiber_g NUMERIC(7,2),
    sugar_g NUMERIC(7,2),
    sodium_mg NUMERIC(7,2),
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for daily log fetching
CREATE INDEX idx_meal_logs_user_date ON meal_logs(user_id, log_date);
CREATE INDEX idx_meal_logs_user_recent ON meal_logs(user_id, consumed_at DESC);

-- ============================================================================
-- 6. TABLE: daily_nutrition_summaries
-- ============================================================================
CREATE TABLE daily_nutrition_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    
    -- Aggregated daily totals
    total_calories NUMERIC(7,2) DEFAULT 0,
    total_protein_g NUMERIC(7,2) DEFAULT 0,
    total_carbs_g NUMERIC(7,2) DEFAULT 0,
    total_fat_g NUMERIC(7,2) DEFAULT 0,
    total_fiber_g NUMERIC(7,2) DEFAULT 0,
    total_sugar_g NUMERIC(7,2) DEFAULT 0,
    total_sodium_mg NUMERIC(7,2) DEFAULT 0,
    
    -- Target snapshots for the day
    target_calories NUMERIC(7,2),
    target_protein_g NUMERIC(7,2),
    target_carbs_g NUMERIC(7,2),
    target_fat_g NUMERIC(7,2),
    
    meal_count INTEGER DEFAULT 0,
    scan_count INTEGER DEFAULT 0,
    is_goal_met BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(user_id, summary_date)
);

CREATE INDEX idx_daily_summaries_user_date ON daily_nutrition_summaries(user_id, summary_date DESC);

-- ============================================================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================================================

-- A. Auto-create profile on new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- B. Calculate profile metrics (BMR, TDEE, Macros)
CREATE OR REPLACE FUNCTION calculate_profile_metrics()
RETURNS trigger AS $$
DECLARE
    age INTEGER;
    bmr NUMERIC;
    tdee NUMERIC;
    activity_multiplier NUMERIC;
    caloric_adjustment NUMERIC;
BEGIN
    -- Only calculate if we have basic metrics
    IF NEW.height_cm IS NOT NULL AND NEW.weight_kg IS NOT NULL AND NEW.birth_date IS NOT NULL THEN
        
        age := EXTRACT(YEAR FROM age(NEW.birth_date));
        
        -- Mifflin-St Jeor Equation
        IF NEW.gender = 'male' THEN
            bmr := (10 * NEW.weight_kg) + (6.25 * NEW.height_cm) - (5 * age) + 5;
        ELSIF NEW.gender = 'female' THEN
            bmr := (10 * NEW.weight_kg) + (6.25 * NEW.height_cm) - (5 * age) - 161;
        ELSE
            -- Average for 'other'
            bmr := (10 * NEW.weight_kg) + (6.25 * NEW.height_cm) - (5 * age) - 78;
        END IF;
        
        NEW.calculated_bmr := bmr;
        
        -- Activity Multiplier
        activity_multiplier := CASE NEW.activity_level
            WHEN 'sedentary' THEN 1.2
            WHEN 'lightly_active' THEN 1.375
            WHEN 'moderately_active' THEN 1.55
            WHEN 'very_active' THEN 1.725
            WHEN 'extra_active' THEN 1.9
            ELSE 1.2
        END;
        
        tdee := bmr * activity_multiplier;
        NEW.calculated_tdee := tdee;
        
        -- Caloric Adjustment based on goal
        caloric_adjustment := CASE NEW.goal
            WHEN 'lose_weight_fast' THEN -750
            WHEN 'lose_weight_gradual' THEN -500
            WHEN 'gain_muscle' THEN 300
            ELSE 0 -- maintain_weight or manage_condition
        END;
        
        NEW.target_calories := tdee + caloric_adjustment;
        
        -- Default macro split: 30% protein, 40% carbs, 30% fat
        -- 1g protein = 4 kcal, 1g carb = 4 kcal, 1g fat = 9 kcal
        NEW.target_protein_g := (NEW.target_calories * 0.30) / 4;
        NEW.target_carbs_g := (NEW.target_calories * 0.40) / 4;
        NEW.target_fat_g := (NEW.target_calories * 0.30) / 9;
        
        -- Default fiber (general guideline ~25-30g)
        NEW.target_fiber_g := 28;
        
        -- Default sodium (< 2300mg) and sugar (< 50g)
        NEW.target_sodium_mg := 2300;
        NEW.target_sugar_g := 50;
        
        -- Special adjustments for medical conditions
        IF 'hypertension' = ANY(NEW.medical_conditions) THEN
            NEW.target_sodium_mg := 1500;
        END IF;
        
        IF 'diabetes' = ANY(NEW.medical_conditions) THEN
            NEW.target_sugar_g := 25;
        END IF;
        
    END IF;
    
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_profile_metrics
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE calculate_profile_metrics();

-- C. Sync daily nutrition summaries
CREATE OR REPLACE FUNCTION sync_daily_nutrition_summary()
RETURNS trigger AS $$
DECLARE
    target_user_id UUID;
    target_date DATE;
BEGIN
    -- Determine user_id and date based on the operation
    IF TG_OP = 'DELETE' THEN
        target_user_id := OLD.user_id;
        target_date := OLD.log_date;
    ELSE
        target_user_id := NEW.user_id;
        target_date := NEW.log_date;
    END IF;

    -- Upsert the aggregated daily summary
    INSERT INTO daily_nutrition_summaries (
        user_id, 
        summary_date, 
        total_calories, 
        total_protein_g, 
        total_carbs_g, 
        total_fat_g, 
        total_fiber_g, 
        total_sugar_g, 
        total_sodium_mg,
        meal_count
    )
    SELECT 
        target_user_id,
        target_date,
        COALESCE(SUM(calories), 0),
        COALESCE(SUM(protein_g), 0),
        COALESCE(SUM(carbs_g), 0),
        COALESCE(SUM(fat_g), 0),
        COALESCE(SUM(fiber_g), 0),
        COALESCE(SUM(sugar_g), 0),
        COALESCE(SUM(sodium_mg), 0),
        COUNT(id)
    FROM meal_logs
    WHERE user_id = target_user_id AND log_date = target_date
    ON CONFLICT (user_id, summary_date) 
    DO UPDATE SET 
        total_calories = EXCLUDED.total_calories,
        total_protein_g = EXCLUDED.total_protein_g,
        total_carbs_g = EXCLUDED.total_carbs_g,
        total_fat_g = EXCLUDED.total_fat_g,
        total_fiber_g = EXCLUDED.total_fiber_g,
        total_sugar_g = EXCLUDED.total_sugar_g,
        total_sodium_mg = EXCLUDED.total_sodium_mg,
        meal_count = EXCLUDED.meal_count,
        updated_at = now();
        
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_daily_nutrition_summary
  AFTER INSERT OR UPDATE OR DELETE ON meal_logs
  FOR EACH ROW EXECUTE PROCEDURE sync_daily_nutrition_summary();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_nutrition_summaries ENABLE ROW LEVEL SECURITY;

-- 8.1 profiles policies
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 8.2 food_scans policies
CREATE POLICY "Users can view own scans" 
    ON food_scans FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" 
    ON food_scans FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans" 
    ON food_scans FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans" 
    ON food_scans FOR DELETE 
    USING (auth.uid() = user_id);

-- 8.3 scan_items policies
CREATE POLICY "Users can view own scan items" 
    ON scan_items FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan items" 
    ON scan_items FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scan items" 
    ON scan_items FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scan items" 
    ON scan_items FOR DELETE 
    USING (auth.uid() = user_id);

-- 8.4 meal_logs policies
CREATE POLICY "Users can view own meal logs" 
    ON meal_logs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal logs" 
    ON meal_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal logs" 
    ON meal_logs FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal logs" 
    ON meal_logs FOR DELETE 
    USING (auth.uid() = user_id);

-- 8.5 daily_nutrition_summaries policies
CREATE POLICY "Users can view own daily summaries" 
    ON daily_nutrition_summaries FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily summaries" 
    ON daily_nutrition_summaries FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily summaries" 
    ON daily_nutrition_summaries FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily summaries" 
    ON daily_nutrition_summaries FOR DELETE 
    USING (auth.uid() = user_id);
