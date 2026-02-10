-- ENUM TYPES

CREATE TYPE user_tier AS ENUM ('free', 'pro', 'unlimited');
CREATE TYPE file_type AS ENUM ('pdf', 'pptx', 'video');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE source_type AS ENUM ('slide', 'page', 'timestamp');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE session_type AS ENUM ('flashcard', 'mcq', 'essay');
CREATE TYPE item_type AS ENUM ('flashcard', 'mcq');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');
CREATE TYPE activity_type AS ENUM ('study_session', 'module_created', 'achievement', 'file_uploaded', 'shared_module');

-- UPDATED_AT TRIGGER FUNCTION

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PROFILES TABLE

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  tier user_tier NOT NULL DEFAULT 'free',
  monthly_uploads_used INT NOT NULL DEFAULT 0,
  monthly_generations_used INT NOT NULL DEFAULT 0,
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  usage_reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- MODULES TABLE

CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  color VARCHAR(7),
  icon VARCHAR(50),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- FILES TABLE

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type file_type NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  page_count INT,
  duration_seconds INT,
  processing_status processing_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FLASHCARDS TABLE

CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_type source_type NOT NULL,
  source_reference TEXT,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MCQ QUESTIONS TABLE

CREATE TABLE mcq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  source_type source_type NOT NULL,
  source_reference TEXT,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ESSAY PROMPTS TABLE

CREATE TABLE essay_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  argument_framework JSONB,
  source_type source_type NOT NULL,
  source_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STUDY SESSIONS TABLE

CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  session_type session_type NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  total_items INT NOT NULL,
  correct_items INT NOT NULL DEFAULT 0,
  score_percentage DECIMAL(5, 2)
);

-- STUDY PROGRESS TABLE

CREATE TABLE study_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_type item_type NOT NULL,
  item_id UUID NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INT,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FRIENDSHIPS TABLE

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- SHARED MODULES TABLE

CREATE TABLE shared_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(module_id, shared_with)
);

-- ACTIVITY FEED TABLE

CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES ON FOREIGN KEYS

CREATE INDEX idx_modules_user_id ON modules(user_id);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_module_id ON files(module_id);
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_module_id ON flashcards(module_id);
CREATE INDEX idx_flashcards_file_id ON flashcards(file_id);
CREATE INDEX idx_mcq_questions_user_id ON mcq_questions(user_id);
CREATE INDEX idx_mcq_questions_module_id ON mcq_questions(module_id);
CREATE INDEX idx_mcq_questions_file_id ON mcq_questions(file_id);
CREATE INDEX idx_essay_prompts_user_id ON essay_prompts(user_id);
CREATE INDEX idx_essay_prompts_module_id ON essay_prompts(module_id);
CREATE INDEX idx_essay_prompts_file_id ON essay_prompts(file_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_module_id ON study_sessions(module_id);
CREATE INDEX idx_study_progress_session_id ON study_progress(session_id);
CREATE INDEX idx_study_progress_user_id ON study_progress(user_id);
CREATE INDEX idx_friendships_requester_id ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee_id ON friendships(addressee_id);
CREATE INDEX idx_shared_modules_module_id ON shared_modules(module_id);
CREATE INDEX idx_shared_modules_shared_by ON shared_modules(shared_by);
CREATE INDEX idx_shared_modules_shared_with ON shared_modules(shared_with);
CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id);

-- ADDITIONAL INDEXES

CREATE INDEX idx_modules_is_public ON modules(is_public);
CREATE INDEX idx_files_processing_status ON files(processing_status);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX idx_study_sessions_created_at ON study_sessions(started_at DESC);
CREATE INDEX idx_modules_user_public ON modules(user_id, is_public);
CREATE INDEX idx_shared_modules_module_shared_with ON shared_modules(module_id, shared_with);
CREATE INDEX idx_flashcards_module_created ON flashcards(module_id, created_at DESC);
CREATE INDEX idx_mcq_questions_module_created ON mcq_questions(module_id, created_at DESC);
CREATE INDEX idx_essay_prompts_module_created ON essay_prompts(module_id, created_at DESC);
CREATE INDEX idx_study_sessions_user_module ON study_sessions(user_id, module_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- ENABLE ROW LEVEL SECURITY

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE essay_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES: PROFILES

CREATE POLICY profiles_read_own ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_read_friends ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE (requester_id = auth.uid() AND addressee_id = profiles.id AND status = 'accepted')
      UNION
      SELECT 1 FROM friendships
      WHERE (addressee_id = auth.uid() AND requester_id = profiles.id AND status = 'accepted')
    )
  );

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS POLICIES: MODULES

CREATE POLICY modules_read_own ON modules
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY modules_read_public ON modules
  FOR SELECT USING (is_public = true);

CREATE POLICY modules_read_shared ON modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_modules
      WHERE shared_modules.module_id = modules.id
        AND shared_modules.shared_with = auth.uid()
    )
  );

CREATE POLICY modules_insert_own ON modules
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY modules_update_own ON modules
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY modules_delete_own ON modules
  FOR DELETE USING (user_id = auth.uid());

-- RLS POLICIES: FILES

CREATE POLICY files_read_own ON files
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY files_insert_own ON files
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY files_update_own ON files
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY files_delete_own ON files
  FOR DELETE USING (user_id = auth.uid());

-- RLS POLICIES: FLASHCARDS

CREATE POLICY flashcards_read_own ON flashcards
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY flashcards_read_shared ON flashcards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_modules
      WHERE shared_modules.module_id = flashcards.module_id
        AND shared_modules.shared_with = auth.uid()
    )
  );

CREATE POLICY flashcards_insert_own ON flashcards
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY flashcards_update_own ON flashcards
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY flashcards_delete_own ON flashcards
  FOR DELETE USING (user_id = auth.uid());

-- RLS POLICIES: MCQ QUESTIONS

CREATE POLICY mcq_questions_read_own ON mcq_questions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY mcq_questions_read_shared ON mcq_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_modules
      WHERE shared_modules.module_id = mcq_questions.module_id
        AND shared_modules.shared_with = auth.uid()
    )
  );

CREATE POLICY mcq_questions_insert_own ON mcq_questions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY mcq_questions_update_own ON mcq_questions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY mcq_questions_delete_own ON mcq_questions
  FOR DELETE USING (user_id = auth.uid());

-- RLS POLICIES: ESSAY PROMPTS

CREATE POLICY essay_prompts_read_own ON essay_prompts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY essay_prompts_read_shared ON essay_prompts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_modules
      WHERE shared_modules.module_id = essay_prompts.module_id
        AND shared_modules.shared_with = auth.uid()
    )
  );

CREATE POLICY essay_prompts_insert_own ON essay_prompts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY essay_prompts_update_own ON essay_prompts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY essay_prompts_delete_own ON essay_prompts
  FOR DELETE USING (user_id = auth.uid());

-- RLS POLICIES: STUDY SESSIONS

CREATE POLICY study_sessions_read_own ON study_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY study_sessions_insert_own ON study_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY study_sessions_update_own ON study_sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY study_sessions_delete_own ON study_sessions
  FOR DELETE USING (user_id = auth.uid());

-- RLS POLICIES: STUDY PROGRESS

CREATE POLICY study_progress_read_own ON study_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY study_progress_insert_own ON study_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY study_progress_update_own ON study_progress
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY study_progress_delete_own ON study_progress
  FOR DELETE USING (user_id = auth.uid());

-- RLS POLICIES: FRIENDSHIPS

CREATE POLICY friendships_read_own ON friendships
  FOR SELECT USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY friendships_insert_own ON friendships
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY friendships_update_addressee ON friendships
  FOR UPDATE USING (addressee_id = auth.uid());

-- RLS POLICIES: SHARED MODULES

CREATE POLICY shared_modules_read_owner ON shared_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modules
      WHERE modules.id = shared_modules.module_id
        AND modules.user_id = auth.uid()
    )
  );

CREATE POLICY shared_modules_read_shared_with ON shared_modules
  FOR SELECT USING (shared_with = auth.uid());

CREATE POLICY shared_modules_insert_owner ON shared_modules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM modules
      WHERE modules.id = shared_modules.module_id
        AND modules.user_id = auth.uid()
    )
  );

CREATE POLICY shared_modules_update_owner ON shared_modules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM modules
      WHERE modules.id = shared_modules.module_id
        AND modules.user_id = auth.uid()
    )
  );

CREATE POLICY shared_modules_delete_owner ON shared_modules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM modules
      WHERE modules.id = shared_modules.module_id
        AND modules.user_id = auth.uid()
    )
  );

-- RLS POLICIES: ACTIVITY FEED

CREATE POLICY activity_feed_read_own ON activity_feed
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY activity_feed_read_friends ON activity_feed
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE (requester_id = auth.uid() AND addressee_id = activity_feed.user_id AND status = 'accepted')
      UNION
      SELECT 1 FROM friendships
      WHERE (addressee_id = auth.uid() AND requester_id = activity_feed.user_id AND status = 'accepted')
    )
  );

CREATE POLICY activity_feed_insert_own ON activity_feed
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- AUTO-CREATE PROFILE ON SIGNUP

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
