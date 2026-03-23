-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

-- Create tools table
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  logo_url TEXT,
  category TEXT REFERENCES categories(slug),
  pricing_type TEXT NOT NULL, -- e.g., 'Free', 'Freemium', 'Paid'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create use_cases table
CREATE TABLE use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT REFERENCES categories(slug),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create tool_use_case_rankings table
CREATE TABLE tool_use_case_rankings (
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  use_case_id UUID REFERENCES use_cases(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  reason TEXT,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (tool_id, use_case_id)
);

-- Indexes for performance
CREATE INDEX idx_tools_category ON tools(category);
CREATE INDEX idx_use_cases_category ON use_cases(category);
CREATE INDEX idx_rankings_use_case_id ON tool_use_case_rankings(use_case_id);
