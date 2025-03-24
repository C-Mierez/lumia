-- Watch-Later Playlist 
-- Trigger to create a watch-later playlist for a user when they are created 
CREATE OR REPLACE FUNCTION create_watch_later()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS $$
BEGIN 
    -- Check if the user already has a watch-later playlist
    IF NOT EXISTS (
        SELECT 1
        FROM playlists --! Make sure to maintain with the name in schema.ts
        WHERE user_id = NEW.id AND name = 'Watch later'
    ) THEN
        -- Create a new watch-later playlist for the user
        INSERT INTO playlists(user_id, name)
        VALUES (NEW.id, 'Watch later'); 
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER watch_later
    AFTER INSERT
    ON users --! Make sure to maintain with the name in schema.ts
    FOR EACH ROW
    EXECUTE FUNCTION create_watch_later();