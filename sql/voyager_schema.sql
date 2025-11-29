-- MySQL dump 10.13  Distrib 9.4.0, for Win64 (x86_64)
--
-- Host: localhost    Database: voyager_database
-- ------------------------------------------------------
-- Server version	9.4.0-commercial

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `crew`
--

DROP TABLE IF EXISTS `crew`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crew` (
  `crew_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `crew_rank` varchar(30) DEFAULT NULL,
  `birth_stardate` double DEFAULT NULL,
  `planet_of_origin` varchar(50) DEFAULT NULL,
  `species` varchar(50) DEFAULT NULL,
  `crew_designation` enum('StarFleet','Maquis','Civilian') NOT NULL,
  `service_number` varchar(20) DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  PRIMARY KEY (`crew_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `crew_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=168 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `department_name` varchar(50) NOT NULL,
  PRIMARY KEY (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `formercrew`
--

DROP TABLE IF EXISTS `formercrew`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `formercrew` (
  `FormerCrewID` int NOT NULL AUTO_INCREMENT,
  `CrewID` int NOT NULL,
  `DepartureStardate` varchar(50) DEFAULT NULL,
  `DepartureReason` varchar(100) DEFAULT NULL,
  `ReassignmentLocation` varchar(100) DEFAULT NULL,
  `Notes` text,
  PRIMARY KEY (`FormerCrewID`),
  KEY `fk_former_crew` (`CrewID`),
  CONSTRAINT `fk_former_crew` FOREIGN KEY (`CrewID`) REFERENCES `crew` (`crew_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `holodeckprograms`
--

DROP TABLE IF EXISTS `holodeckprograms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holodeckprograms` (
  `ProgramID` varchar(10) NOT NULL,
  `ProgramName` varchar(100) NOT NULL,
  `HolodeckID` varchar(10) NOT NULL,
  `CreatedBy` varchar(50) DEFAULT NULL,
  `AccessLevel` varchar(20) DEFAULT NULL,
  `Genre` varchar(30) DEFAULT NULL,
  `Description` text,
  PRIMARY KEY (`ProgramID`),
  KEY `HolodeckID` (`HolodeckID`),
  CONSTRAINT `holodeckprograms_ibfk_1` FOREIGN KEY (`HolodeckID`) REFERENCES `holodecks` (`HolodeckID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `holodecks`
--

DROP TABLE IF EXISTS `holodecks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holodecks` (
  `HolodeckID` varchar(10) NOT NULL,
  `DeckNumber` int NOT NULL,
  `FrameNumber` int NOT NULL,
  `LocationCode` int NOT NULL,
  `CompartmentID` varchar(10) NOT NULL,
  `HolodeckDesignation` varchar(50) DEFAULT NULL,
  `AccessLevel` varchar(20) DEFAULT NULL,
  `Notes` text,
  PRIMARY KEY (`HolodeckID`),
  KEY `CompartmentID` (`CompartmentID`),
  CONSTRAINT `holodecks_ibfk_1` FOREIGN KEY (`CompartmentID`) REFERENCES `shipcompartments` (`CompartmentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medicalprofile`
--

DROP TABLE IF EXISTS `medicalprofile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicalprofile` (
  `ProfileID` int NOT NULL AUTO_INCREMENT,
  `CrewID` int NOT NULL,
  `BloodType` varchar(5) DEFAULT NULL,
  `Allergies` varchar(100) DEFAULT NULL,
  `ChronicConditions` varchar(100) DEFAULT NULL,
  `EmergencyContact` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ProfileID`),
  KEY `fk_medprofile_crew` (`CrewID`),
  CONSTRAINT `fk_medprofile_crew` FOREIGN KEY (`CrewID`) REFERENCES `crew` (`crew_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medicalrecords`
--

DROP TABLE IF EXISTS `medicalrecords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicalrecords` (
  `RecordID` int NOT NULL AUTO_INCREMENT,
  `CrewID` int NOT NULL,
  `VisitStardate` varchar(50) DEFAULT NULL,
  `ReasonForVisit` varchar(100) DEFAULT NULL,
  `TreatmentProvided` varchar(100) DEFAULT NULL,
  `FollowUpRequired` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`RecordID`),
  KEY `fk_medrecords_crew` (`CrewID`),
  CONSTRAINT `fk_medrecords_crew` FOREIGN KEY (`CrewID`) REFERENCES `crew` (`crew_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `replicatorlog`
--

DROP TABLE IF EXISTS `replicatorlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `replicatorlog` (
  `LogID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `CrewID` int NOT NULL,
  `ReplicatorUnitID` varchar(10) NOT NULL,
  `PatternID` int NOT NULL,
  `Timestamp` varchar(25) NOT NULL,
  PRIMARY KEY (`LogID`),
  UNIQUE KEY `LogID` (`LogID`),
  KEY `ReplicatorUnitID` (`ReplicatorUnitID`),
  KEY `PatternID` (`PatternID`),
  KEY `fk_replicator_crew` (`CrewID`),
  CONSTRAINT `fk_replicator_crew` FOREIGN KEY (`CrewID`) REFERENCES `crew` (`crew_id`),
  CONSTRAINT `replicatorlog_ibfk_2` FOREIGN KEY (`ReplicatorUnitID`) REFERENCES `replicatorunits` (`ReplicatorUnitID`),
  CONSTRAINT `replicatorlog_ibfk_3` FOREIGN KEY (`PatternID`) REFERENCES `replicatorpatterns` (`PatternID`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `replicatorpatterns`
--

DROP TABLE IF EXISTS `replicatorpatterns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `replicatorpatterns` (
  `PatternID` int NOT NULL,
  `PatternName` varchar(100) DEFAULT NULL,
  `Category` varchar(50) DEFAULT NULL,
  `OriginSpecies` varchar(50) DEFAULT NULL,
  `EnergyCost` decimal(6,2) DEFAULT NULL,
  `Description` text,
  `LastUpdatedStardate` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`PatternID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `replicatorunits`
--

DROP TABLE IF EXISTS `replicatorunits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `replicatorunits` (
  `ReplicatorUnitID` varchar(20) NOT NULL,
  `ReplicatorType` varchar(50) DEFAULT NULL,
  `AccessLevel` varchar(50) DEFAULT NULL,
  `CompartmentID` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`ReplicatorUnitID`),
  KEY `fk_compartment` (`CompartmentID`),
  CONSTRAINT `fk_compartment` FOREIGN KEY (`CompartmentID`) REFERENCES `shipcompartments` (`CompartmentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shipcompartments`
--

DROP TABLE IF EXISTS `shipcompartments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipcompartments` (
  `CompartmentID` varchar(10) NOT NULL,
  `CompartmentName` varchar(100) NOT NULL,
  `CompartmentDesignation` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`CompartmentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shuttles`
--

DROP TABLE IF EXISTS `shuttles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shuttles` (
  `shuttle_id` int NOT NULL AUTO_INCREMENT,
  `shuttle_name` varchar(50) NOT NULL,
  `shuttle_type` varchar(50) NOT NULL,
  `status` enum('Docked','Away','Destroyed','Unknown') NOT NULL DEFAULT 'Docked',
  `location` enum('Shuttlebay 1','Shuttlebay 2','Off-Ship') NOT NULL DEFAULT 'Shuttlebay 1',
  `in_service_stardate` double NOT NULL,
  `out_of_service_stardate` double DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`shuttle_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transportableentity`
--

DROP TABLE IF EXISTS `transportableentity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transportableentity` (
  `EntityID` varchar(10) NOT NULL,
  `EntityType` enum('Crew','Property','Cargo') NOT NULL,
  `Description` text,
  PRIMARY KEY (`EntityID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transporterlog`
--

DROP TABLE IF EXISTS `transporterlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transporterlog` (
  `TransporterLogID` int NOT NULL AUTO_INCREMENT,
  `TransporterUnitID` varchar(10) NOT NULL,
  `EntityID` varchar(10) NOT NULL,
  `CrewID` int DEFAULT NULL,
  `Stardate` varchar(20) NOT NULL,
  `TransportDirection` enum('Inbound','Outbound') NOT NULL,
  `DestinationCompartmentID` varchar(10) DEFAULT NULL,
  `OffShipLocation` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`TransporterLogID`),
  KEY `TransporterUnitID` (`TransporterUnitID`),
  KEY `EntityID` (`EntityID`),
  KEY `DestinationCompartmentID` (`DestinationCompartmentID`),
  KEY `fk_transporter_crew` (`CrewID`),
  CONSTRAINT `fk_transporter_crew` FOREIGN KEY (`CrewID`) REFERENCES `crew` (`crew_id`),
  CONSTRAINT `transporterlog_ibfk_1` FOREIGN KEY (`TransporterUnitID`) REFERENCES `transporterunits` (`TransporterUnitID`),
  CONSTRAINT `transporterlog_ibfk_2` FOREIGN KEY (`EntityID`) REFERENCES `transportableentity` (`EntityID`),
  CONSTRAINT `transporterlog_ibfk_4` FOREIGN KEY (`DestinationCompartmentID`) REFERENCES `shipcompartments` (`CompartmentID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transporterunits`
--

DROP TABLE IF EXISTS `transporterunits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transporterunits` (
  `TransporterUnitID` varchar(10) NOT NULL,
  `CompartmentID` varchar(10) NOT NULL,
  PRIMARY KEY (`TransporterUnitID`),
  KEY `CompartmentID` (`CompartmentID`),
  CONSTRAINT `transporterunits_ibfk_1` FOREIGN KEY (`CompartmentID`) REFERENCES `shipcompartments` (`CompartmentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-29 15:10:41
