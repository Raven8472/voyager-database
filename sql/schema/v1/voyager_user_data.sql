CREATE TABLE IF NOT EXISTS user_custom_crew (
    custom_crew_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    crew_rank VARCHAR(30) NULL,
    birth_stardate DECIMAL(10,2) NULL,
    planet_of_origin VARCHAR(50) NULL,
    species VARCHAR(50) NULL,
    crew_designation VARCHAR(20) NOT NULL,
    service_number VARCHAR(20) NULL,
    department_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (custom_crew_id),
    KEY idx_user_custom_crew_user_id (user_id),
    CONSTRAINT fk_user_custom_crew_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_personnel_actions (
    action_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    crew_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    old_rank VARCHAR(30) NULL,
    new_rank VARCHAR(30) NULL,
    old_species VARCHAR(50) NULL,
    new_species VARCHAR(50) NULL,
    old_planet_of_origin VARCHAR(50) NULL,
    new_planet_of_origin VARCHAR(50) NULL,
    old_department_id INT NULL,
    new_department_id INT NULL,
    effective_stardate VARCHAR(30) NULL,
    episode_reference VARCHAR(100) NULL,
    entered_by VARCHAR(100) NULL,
    action_notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (action_id),
    KEY idx_user_personnel_actions_user_crew (user_id, crew_id),
    CONSTRAINT fk_user_personnel_actions_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_medical_profiles (
    profile_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    crew_id INT NOT NULL,
    blood_type VARCHAR(5) NULL,
    allergies VARCHAR(100) NULL,
    chronic_conditions VARCHAR(100) NULL,
    emergency_contact VARCHAR(100) NULL,
    PRIMARY KEY (profile_id),
    UNIQUE KEY uq_user_medical_profiles_user_crew (user_id, crew_id),
    CONSTRAINT fk_user_medical_profiles_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_medical_records (
    record_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    crew_id INT NOT NULL,
    visit_stardate VARCHAR(50) NULL,
    reason_for_visit VARCHAR(100) NULL,
    treatment_provided VARCHAR(100) NULL,
    follow_up_required TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (record_id),
    KEY idx_user_medical_records_user_crew (user_id, crew_id),
    CONSTRAINT fk_user_medical_records_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_replicator_patterns (
    pattern_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    pattern_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NULL,
    origin_species VARCHAR(50) NULL,
    energy_cost DECIMAL(6,2) NULL,
    description TEXT NULL,
    last_updated_stardate VARCHAR(50) NULL,
    PRIMARY KEY (pattern_id),
    KEY idx_user_replicator_patterns_user_id (user_id),
    CONSTRAINT fk_user_replicator_patterns_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_replicator_logs (
    log_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    crew_id INT NOT NULL,
    replicator_unit_id VARCHAR(20) NOT NULL,
    pattern_id INT NOT NULL,
    timestamp VARCHAR(25) NOT NULL,
    PRIMARY KEY (log_id),
    KEY idx_user_replicator_logs_user_id (user_id),
    CONSTRAINT fk_user_replicator_logs_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
);

-- User-authored holodeck programs extend the base catalog without overwriting canon seed rows.
CREATE TABLE IF NOT EXISTS user_holodeck_programs (
    program_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    program_name VARCHAR(100) NOT NULL,
    holodeck_id VARCHAR(10) NOT NULL,
    created_by VARCHAR(50) NULL,
    access_level VARCHAR(20) NULL,
    genre VARCHAR(30) NULL,
    description TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (program_id),
    KEY idx_user_holodeck_programs_user_id (user_id),
    CONSTRAINT fk_user_holodeck_programs_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
);

-- User holodeck logs mirror the lean V1 activity model: crew, program, holodeck, stardate.
CREATE TABLE IF NOT EXISTS user_holodeck_logs (
    log_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    crew_id INT NOT NULL,
    program_id VARCHAR(20) NOT NULL,
    holodeck_id VARCHAR(10) NOT NULL,
    stardate VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (log_id),
    KEY idx_user_holodeck_logs_user_id (user_id),
    CONSTRAINT fk_user_holodeck_logs_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_transporter_events (
    event_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    transporter_unit_id VARCHAR(10) NOT NULL,
    operator_crew_id INT NULL,
    stardate VARCHAR(20) NOT NULL,
    transport_direction VARCHAR(20) NOT NULL,
    ship_location_id VARCHAR(10) NOT NULL,
    off_ship_location VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id),
    KEY idx_user_transporter_events_user_id (user_id),
    CONSTRAINT fk_user_transporter_events_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE
);

-- Ordered crew manifest for each logged transporter event.
CREATE TABLE IF NOT EXISTS user_transporter_event_passengers (
    passenger_id INT NOT NULL AUTO_INCREMENT,
    event_id INT NOT NULL,
    crew_id INT NOT NULL,
    passenger_order INT NOT NULL,
    PRIMARY KEY (passenger_id),
    KEY idx_user_transporter_passengers_event_id (event_id),
    CONSTRAINT fk_user_transporter_passengers_event
        FOREIGN KEY (event_id) REFERENCES user_transporter_events (event_id)
        ON DELETE CASCADE
);
