CREATE DATABASE IF NOT EXISTS habit_tracker
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE habit_tracker;

CREATE TABLE users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    INDEX idx_users_timezone (timezone)
) ENGINE=InnoDB
DEFAULT CHARACTER SET utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE habits (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500) NULL,
    created_local_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_habits_user_id (user_id),
    CONSTRAINT fk_habits_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB
DEFAULT CHARACTER SET utf8mb4
COLLATE=utf8mb4_unicode_ci;

CREATE TABLE habit_check_ins (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    habit_id INT UNSIGNED NOT NULL,
    checked_in_at_utc DATETIME NOT NULL,
    local_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_habit_check_ins_habit_local_date (habit_id, local_date),
    INDEX idx_habit_check_ins_habit_id (habit_id),
    INDEX idx_habit_check_ins_local_date (local_date),
    CONSTRAINT fk_habit_check_ins_habit
        FOREIGN KEY (habit_id)
        REFERENCES habits(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB
DEFAULT CHARACTER SET utf8mb4
COLLATE=utf8mb4_unicode_ci;