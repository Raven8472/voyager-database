CREATE TABLE IF NOT EXISTS `personnel_actions` (
  `action_id` int NOT NULL AUTO_INCREMENT,
  `crew_id` int NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `old_rank` varchar(30) DEFAULT NULL,
  `new_rank` varchar(30) DEFAULT NULL,
  `old_species` varchar(50) DEFAULT NULL,
  `new_species` varchar(50) DEFAULT NULL,
  `old_planet_of_origin` varchar(50) DEFAULT NULL,
  `new_planet_of_origin` varchar(50) DEFAULT NULL,
  `old_department_id` int DEFAULT NULL,
  `new_department_id` int DEFAULT NULL,
  `effective_stardate` varchar(30) DEFAULT NULL,
  `episode_reference` varchar(100) DEFAULT NULL,
  `entered_by` varchar(100) DEFAULT 'Records Officer',
  `action_notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`action_id`),
  KEY `idx_personnel_actions_crew_id` (`crew_id`),
  KEY `idx_personnel_actions_created_at` (`created_at`),
  KEY `idx_personnel_actions_action_type` (`action_type`),
  KEY `idx_personnel_actions_new_department_id` (`new_department_id`),
  CONSTRAINT `fk_personnel_actions_crew`
    FOREIGN KEY (`crew_id`) REFERENCES `crew` (`crew_id`),
  CONSTRAINT `fk_personnel_actions_old_department`
    FOREIGN KEY (`old_department_id`) REFERENCES `departments` (`department_id`),
  CONSTRAINT `fk_personnel_actions_new_department`
    FOREIGN KEY (`new_department_id`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
