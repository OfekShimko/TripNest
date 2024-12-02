-- CREATE DATABASE IF NOT EXISTS trip_nest;

USE trip_nest;

CREATE TABLE IF NOT EXISTS User (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

-- Create trigger to automatically set the username to part before '@' in email

-- DELIMITER $$

-- CREATE TRIGGER before_user_insert
-- BEFORE INSERT ON User
-- FOR EACH ROW
-- BEGIN
--     -- Set the username to the part before '@' in the email address
--     IF NEW.username IS NULL THEN
--         SET NEW.username = SUBSTRING_INDEX(NEW.email, '@', 1);
--     END IF;
-- END $$

-- DELIMITER ;


CREATE TABLE IF NOT EXISTS Trip (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS TripActivities (
    trip_id CHAR(36) REFERENCES Trip(id) ON DELETE CASCADE,
    xid VARCHAR(255) NOT NULL,
    PRIMARY KEY (trip_id, xid)
);

CREATE TABLE IF NOT EXISTS TripUsers (
    trip_id CHAR(36) REFERENCES Trip(id) ON DELETE CASCADE,
    user_email VARCHAR(255) REFERENCES User(email) ON DELETE CASCADE,
    permission_level ENUM('Manager', 'Editor', 'Viewer') NOT NULL, -- Direct permission column
    PRIMARY KEY (trip_id, user_email)
);
