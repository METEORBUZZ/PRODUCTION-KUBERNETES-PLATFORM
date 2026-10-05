-- Production Kubernetes Platform: Cat vs Dog Voting Schema
-- Ensures atomic voting and strict non-negative count constraints

CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    option VARCHAR(10) NOT NULL UNIQUE,
    count BIGINT NOT NULL DEFAULT 0 CHECK (count >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on option for rapid lookup and atomic updates
CREATE INDEX IF NOT EXISTS idx_votes_option ON votes(option);

-- Seed initial records for CAT and DOG
INSERT INTO votes (option, count, updated_at)
VALUES 
    ('CAT', 0, CURRENT_TIMESTAMP),
    ('DOG', 0, CURRENT_TIMESTAMP)
ON CONFLICT (option) DO NOTHING;

-- Automatic trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_votes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_votes_timestamp ON votes;
CREATE TRIGGER trg_update_votes_timestamp
BEFORE UPDATE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_votes_timestamp();
