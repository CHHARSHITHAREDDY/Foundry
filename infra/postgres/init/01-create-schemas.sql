-- one schema per service; each service must connect with its own role (no cross-schema access)
CREATE EXTENSION IF NOT EXISTS vector;
DO $$
DECLARE s text;
BEGIN
  FOREACH s IN ARRAY ARRAY['auth','billing','workflow','ideation','research','agent_runtime','sandbox','deployer',
    'tasks','assistant','documents','analytics','notifications','moderation','platform_config','audit',
    'email','social','media','company_payments','ads']
  LOOP
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', s);
  END LOOP;
END $$;
