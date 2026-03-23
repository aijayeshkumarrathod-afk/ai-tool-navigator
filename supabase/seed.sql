-- Clear existing data
TRUNCATE tool_use_case_rankings CASCADE;
TRUNCATE use_cases CASCADE;
TRUNCATE tools CASCADE;
TRUNCATE categories CASCADE;

-- Insert categories
INSERT INTO categories (id, name, slug) VALUES
  (gen_random_uuid(), 'Presentations', 'presentations'),
  (gen_random_uuid(), 'Coding', 'coding'),
  (gen_random_uuid(), 'Social Media', 'social-media'),
  (gen_random_uuid(), 'Writing', 'writing'),
  (gen_random_uuid(), 'Image Gen', 'image-gen'),
  (gen_random_uuid(), 'Video', 'video'),
  (gen_random_uuid(), 'Research', 'research'),
  (gen_random_uuid(), 'Automation', 'automation');

-- Insert tools
INSERT INTO tools (id, name, slug, description, url, category, pricing_type) VALUES
  -- Coding
  (gen_random_uuid(), 'Cursor', 'cursor', 'AI-first code editor that helps you build software faster.', 'https://cursor.sh', 'coding', 'Freemium'),
  (gen_random_uuid(), 'GitHub Copilot', 'github-copilot', 'Your AI pair programmer, right inside your editor.', 'https://github.com/features/copilot', 'coding', 'Paid'),
  (gen_random_uuid(), 'Claude', 'claude', 'Next-generation AI assistant for complex tasks and coding.', 'https://claude.ai', 'coding', 'Freemium'),
  (gen_random_uuid(), 'ChatGPT', 'chatgpt', 'Versatile conversational AI for coding help and debugging.', 'https://chatgpt.com', 'coding', 'Freemium'),

  -- Writing
  (gen_random_uuid(), 'Notion AI', 'notion-ai', 'Write better, think faster, and augment your creativity directly in Notion.', 'https://notion.so/product/ai', 'writing', 'Paid'),
  (gen_random_uuid(), 'GrammarlyGO', 'grammarlygo', 'On-demand communication assistance powered by generative AI.', 'https://grammarly.com/grammarlygo', 'writing', 'Freemium'),
  (gen_random_uuid(), 'Copy.ai', 'copy-ai', 'Write better marketing copy and content with AI.', 'https://copy.ai', 'writing', 'Freemium'),
  (gen_random_uuid(), 'Jasper', 'jasper', 'AI copilot for enterprise marketing teams.', 'https://jasper.ai', 'writing', 'Paid'),

  -- Image Gen
  (gen_random_uuid(), 'Midjourney', 'midjourney', 'An independent research lab exploring new mediums of thought and expanding the imaginative powers of the human species.', 'https://midjourney.com', 'image-gen', 'Paid'),
  (gen_random_uuid(), 'DALL-E 3', 'dall-e-3', 'Create realistic images and art from a description in natural language.', 'https://openai.com/dall-e-3', 'image-gen', 'Freemium'),
  (gen_random_uuid(), 'Stable Diffusion', 'stable-diffusion', 'Deep learning, text-to-image model that generates detailed images.', 'https://stability.ai', 'image-gen', 'Free'),
  (gen_random_uuid(), 'Adobe Firefly', 'adobe-firefly', 'Generative AI for creators, integrated into Adobe Creative Cloud.', 'https://adobe.com/sensei/generative-ai/firefly.html', 'image-gen', 'Freemium'),

  -- Presentations
  (gen_random_uuid(), 'Tome', 'tome', 'The AI-powered format for shaping and sharing ideas.', 'https://tome.app', 'presentations', 'Freemium'),
  (gen_random_uuid(), 'Gamma', 'gamma', 'A new medium for presenting ideas, powered by AI.', 'https://gamma.app', 'presentations', 'Freemium'),
  (gen_random_uuid(), 'Beautiful.ai', 'beautiful-ai', 'Presentation software that designs for you.', 'https://beautiful.ai', 'presentations', 'Paid'),

  -- Research
  (gen_random_uuid(), 'Perplexity AI', 'perplexity-ai', 'AI search engine that delivers accurate, up-to-date answers with citations.', 'https://perplexity.ai', 'research', 'Freemium'),
  (gen_random_uuid(), 'Consensus', 'consensus', 'AI search engine for scientific research.', 'https://consensus.app', 'research', 'Freemium'),
  (gen_random_uuid(), 'Elicit', 'elicit', 'The AI research assistant. Elicit uses language models to help you automate research workflows.', 'https://elicit.org', 'research', 'Freemium'),

  -- Video
  (gen_random_uuid(), 'Runway', 'runway', 'Advancing creativity with artificial intelligence. Generate videos from text or images.', 'https://runwayml.com', 'video', 'Freemium'),
  (gen_random_uuid(), 'Synthesia', 'synthesia', 'Create professional videos with AI avatars in minutes.', 'https://synthesia.io', 'video', 'Paid'),
  (gen_random_uuid(), 'HeyGen', 'heygen', 'AI video generation platform for engaging business videos.', 'https://heygen.com', 'video', 'Freemium'),
  (gen_random_uuid(), 'Sora', 'sora', 'OpenAI''s text-to-video model (Waitlist).', 'https://openai.com/sora', 'video', 'Paid'),

  -- Social Media
  (gen_random_uuid(), 'Taplio', 'taplio', 'The all-in-one AI tool to grow your personal brand on LinkedIn.', 'https://taplio.com', 'social-media', 'Paid'),
  (gen_random_uuid(), 'TweetHunter', 'tweet-hunter', 'Grow your Twitter audience and monetize it.', 'https://tweethunter.io', 'social-media', 'Paid'),
  (gen_random_uuid(), 'Buffer AI Assistant', 'buffer-ai', 'Generate engaging social media posts instantly.', 'https://buffer.com/ai-assistant', 'social-media', 'Freemium'),
  (gen_random_uuid(), 'Hootsuite OwlyWriter AI', 'hootsuite-owlywriter', 'Instantly generate social captions and content ideas.', 'https://hootsuite.com', 'social-media', 'Paid'),

  -- Automation
  (gen_random_uuid(), 'Zapier Central', 'zapier-central', 'Teach AI bots to work across your favorite apps.', 'https://zapier.com/central', 'automation', 'Freemium'),
  (gen_random_uuid(), 'Make', 'make', 'Design, build, and automate anything — visually.', 'https://make.com', 'automation', 'Freemium'),
  (gen_random_uuid(), 'Bardeen', 'bardeen', 'Automate manual work with one click.', 'https://bardeen.ai', 'automation', 'Freemium'),
  (gen_random_uuid(), 'n8n', 'n8n', 'Workflow automation tool. Easily build complex automations.', 'https://n8n.io', 'automation', 'Freemium');

-- Insert Use Cases
INSERT INTO use_cases (id, label, description, category) VALUES
  (gen_random_uuid(), 'Make a pitch deck', 'Create a presentation to pitch a startup or idea to investors.', 'presentations'),
  (gen_random_uuid(), 'Write a React component', 'Generate frontend code for a user interface.', 'coding'),
  (gen_random_uuid(), 'Generate a logo', 'Create a brand logo from a text description.', 'image-gen'),
  (gen_random_uuid(), 'Summarize a research paper', 'Extract key findings from a scientific paper.', 'research'),
  (gen_random_uuid(), 'Create a marketing video', 'Generate a promotional video for a product or service.', 'video'),
  (gen_random_uuid(), 'Write LinkedIn posts', 'Draft engaging content for professional networking.', 'social-media'),
  (gen_random_uuid(), 'Automate email outreach', 'Set up automated sequences for sending personalized emails.', 'automation'),
  (gen_random_uuid(), 'Write a blog post', 'Draft a comprehensive article for a blog or website.', 'writing');

-- Mapping rankings (Tools x Use Cases)
INSERT INTO tool_use_case_rankings (tool_id, use_case_id, rank, reason, votes)
SELECT
  t.id AS tool_id,
  u.id AS use_case_id,
  1 AS rank,
  'Tome is exceptional at generating entire presentation decks with narrative flow and visual layouts from a single prompt.' AS reason,
  150 AS votes
FROM tools t, use_cases u
WHERE t.slug = 'tome' AND u.label = 'Make a pitch deck';

INSERT INTO tool_use_case_rankings (tool_id, use_case_id, rank, reason, votes)
SELECT
  t.id AS tool_id,
  u.id AS use_case_id,
  2 AS rank,
  'Gamma provides a highly flexible, document-like interface that easily converts to professional slides, great for iterative refinement.' AS reason,
  125 AS votes
FROM tools t, use_cases u
WHERE t.slug = 'gamma' AND u.label = 'Make a pitch deck';

INSERT INTO tool_use_case_rankings (tool_id, use_case_id, rank, reason, votes)
SELECT
  t.id AS tool_id,
  u.id AS use_case_id,
  1 AS rank,
  'Cursor provides an unparalleled AI-native IDE experience with intelligent code generation, refactoring, and codebase awareness.' AS reason,
  350 AS votes
FROM tools t, use_cases u
WHERE t.slug = 'cursor' AND u.label = 'Write a React component';

INSERT INTO tool_use_case_rankings (tool_id, use_case_id, rank, reason, votes)
SELECT
  t.id AS tool_id,
  u.id AS use_case_id,
  2 AS rank,
  'Claude 3.5 Sonnet excels at generating modern React code, understanding complex components, and providing detailed explanations.' AS reason,
  310 AS votes
FROM tools t, use_cases u
WHERE t.slug = 'claude' AND u.label = 'Write a React component';