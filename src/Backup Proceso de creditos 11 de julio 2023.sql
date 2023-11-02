CREATE DATABASE  IF NOT EXISTS `procesocreditos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `procesocreditos`;
-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: procesocreditos
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agencias`
--

DROP TABLE IF EXISTS `agencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agencias` (
  `IDAgencia` int NOT NULL AUTO_INCREMENT,
  `NombreAgencia` varchar(150) NOT NULL,
  `TelJefeAgencia` varchar(45) DEFAULT NULL,
  `DireccionAgencia` varchar(500) NOT NULL,
  `IDCooperativa` int NOT NULL,
  PRIMARY KEY (`IDAgencia`),
  KEY `IDCooperativa` (`IDCooperativa`),
  CONSTRAINT `agencias_ibfk_1` FOREIGN KEY (`IDCooperativa`) REFERENCES `cooperativa` (`IDCooperativa`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agencias`
--

LOCK TABLES `agencias` WRITE;
/*!40000 ALTER TABLE `agencias` DISABLE KEYS */;
INSERT INTO `agencias` VALUES (1,'Agencia Central','55573359','Cantón Vipila, Nebaj, Quiché, Guatemala',1),(2,'Agencia Sacapulas','12345678','Centro de sacapulas, Nebaj, Quiché',1),(3,'Agencia Quiché','87654321','Zona 1 de Quiche, Guatemal',1),(4,'Agencia Uspantan','45678123','Zona 2 Uspantan, Quiché, Guatemala',1),(5,'Agencia Salquil Grande','43215678','Salida a Palop, Nebaj, Quiché, Guatemala',1);
/*!40000 ALTER TABLE `agencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `area`
--

DROP TABLE IF EXISTS `area`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `area` (
  `IDArea` int NOT NULL AUTO_INCREMENT,
  `NombreArea` varchar(200) NOT NULL,
  PRIMARY KEY (`IDArea`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `area`
--

LOCK TABLES `area` WRITE;
/*!40000 ALTER TABLE `area` DISABLE KEYS */;
INSERT INTO `area` VALUES (1,'Área de informática'),(2,'Área de créditos'),(3,'Área de Secretarias');
/*!40000 ALTER TABLE `area` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colaborador`
--

DROP TABLE IF EXISTS `colaborador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colaborador` (
  `IDColaborador` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(300) NOT NULL,
  `Fotografia` varchar(500) DEFAULT NULL,
  `Puesto` varchar(100) NOT NULL,
  `SiglasPuesto` varchar(50) NOT NULL,
  `DPI` varchar(20) DEFAULT NULL,
  `Usuario` varchar(100) NOT NULL,
  `Password` varchar(300) NOT NULL,
  `Estado` int NOT NULL DEFAULT '1',
  `IDArea` int NOT NULL,
  `IDRol` int NOT NULL,
  `IDAgencia` int NOT NULL,
  PRIMARY KEY (`IDColaborador`),
  KEY `IDArea` (`IDArea`),
  KEY `IDRol` (`IDRol`),
  KEY `IDAgencia` (`IDAgencia`),
  CONSTRAINT `colaborador_ibfk_1` FOREIGN KEY (`IDArea`) REFERENCES `area` (`IDArea`),
  CONSTRAINT `colaborador_ibfk_2` FOREIGN KEY (`IDRol`) REFERENCES `roles` (`IDRol`),
  CONSTRAINT `colaborador_ibfk_3` FOREIGN KEY (`IDAgencia`) REFERENCES `agencias` (`IDAgencia`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colaborador`
--

LOCK TABLES `colaborador` WRITE;
/*!40000 ALTER TABLE `colaborador` DISABLE KEYS */;
INSERT INTO `colaborador` VALUES (10,'Edgar López Laynez CHAVEZ','https://perfectsetup.pro/pixel.png','Desarrollador de Software','DDS','123456789510','NESISELL','$2a$10$.XZ8QAlNeXJ.FvKm21LpN.JsUy9Eh9iPfaQL0Y.yNr6RNc8Csb0nu',1,1,5,1);
/*!40000 ALTER TABLE `colaborador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cooperativa`
--

DROP TABLE IF EXISTS `cooperativa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cooperativa` (
  `IDCooperativa` int NOT NULL AUTO_INCREMENT,
  `NombreCooperativa` varchar(100) NOT NULL,
  PRIMARY KEY (`IDCooperativa`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cooperativa`
--

LOCK TABLES `cooperativa` WRITE;
/*!40000 ALTER TABLE `cooperativa` DISABLE KEYS */;
INSERT INTO `cooperativa` VALUES (1,'Cotoneb R.L. es Micoope');
/*!40000 ALTER TABLE `cooperativa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listas`
--

DROP TABLE IF EXISTS `listas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listas` (
  `IDLista` int NOT NULL AUTO_INCREMENT,
  `NombreLista` varchar(500) NOT NULL,
  PRIMARY KEY (`IDLista`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listas`
--

LOCK TABLES `listas` WRITE;
/*!40000 ALTER TABLE `listas` DISABLE KEYS */;
INSERT INTO `listas` VALUES (1,'Creación y asignación de Ticket'),(2,'Presentación, entrega de requisitos y cotización'),(3,'Entrevista, pre análisis, y consultas en burós crediticios'),(4,'Programación de actividades de campo y evaluaciones con fechas'),(5,'Valuación de garantía, y trabajo de campo'),(6,'Análisis de capacidad de pago y preparación de EEFF'),(7,'Elaboración de dictámen y preparación de expediente con las firmas y requisitos correspondientes'),(8,'Traslado de expediente'),(9,'Registro de expediente'),(10,'Revisión de expediente'),(11,'Traslado de expediente'),(12,'Presentación del crédito para aprobación'),(13,'Crédito aprobado'),(14,'Traslado de expediente'),(15,'Creación del crédito en sistema'),(16,'Autorización del crédito en sistema'),(17,'Coordinación de elaboración de contrato'),(18,'Traslado de documento'),(19,'Elaboración del contrato y firma del contrato por el asociado'),(20,'Consignación de firma de representante legal y registro'),(21,'Preparación de desembolso (Desembolso, seguro y otros)'),(22,'Ingreso de garantía y resguardo de expedientes en archivo');
/*!40000 ALTER TABLE `listas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procesos`
--

DROP TABLE IF EXISTS `procesos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procesos` (
  `IDProceso` int NOT NULL AUTO_INCREMENT,
  `NumeroDeTicket` int NOT NULL,
  `Ticket` varchar(150) NOT NULL,
  `FechaYHoraCreacion` datetime DEFAULT NULL,
  `NombreAsociado` varchar(200) DEFAULT '',
  `TelefonoAsociado` varchar(15) DEFAULT '',
  `DPIAsociado` varchar(25) DEFAULT '',
  `Detalles` varchar(2000) DEFAULT '',
  `Estado` varchar(10) NOT NULL DEFAULT 'true',
  `JustificacionDeCancelacion` varchar(500) DEFAULT '',
  `IDColaborador` int NOT NULL,
  `IDAgencia` int NOT NULL,
  `IDServicio` int NOT NULL,
  `IDLista` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`IDProceso`),
  KEY `IDAgencia_idx` (`IDAgencia`),
  KEY `IDColaborador` (`IDColaborador`),
  KEY `IDServicio_idx` (`IDServicio`),
  KEY `IDLista_idx` (`IDLista`),
  CONSTRAINT `IDAgencia` FOREIGN KEY (`IDAgencia`) REFERENCES `agencias` (`IDAgencia`),
  CONSTRAINT `IDColaborador` FOREIGN KEY (`IDColaborador`) REFERENCES `colaborador` (`IDColaborador`),
  CONSTRAINT `IDLista` FOREIGN KEY (`IDLista`) REFERENCES `listas` (`IDLista`),
  CONSTRAINT `IDServicio` FOREIGN KEY (`IDServicio`) REFERENCES `servicios` (`IDServicio`)
) ENGINE=InnoDB AUTO_INCREMENT=196 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procesos`
--

LOCK TABLES `procesos` WRITE;
/*!40000 ALTER TABLE `procesos` DISABLE KEYS */;
INSERT INTO `procesos` VALUES (195,1,'01CRE-1','2023-07-10 10:30:00','Nombre del asociado','55573359','41235364783423','Este es un detalle para el ticket para las pruebas de reporte','1','-----',10,1,1,5);
/*!40000 ALTER TABLE `procesos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registros`
--

DROP TABLE IF EXISTS `registros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registros` (
  `IDRegistro` int NOT NULL AUTO_INCREMENT,
  `FechaYHoraRegistro` datetime NOT NULL,
  `MotivoRegistro` varchar(500) DEFAULT NULL,
  `IDLista` int NOT NULL,
  `IDColaborador` int NOT NULL,
  `IDProceso` int DEFAULT NULL,
  PRIMARY KEY (`IDRegistro`),
  KEY `IDLista` (`IDLista`),
  KEY `IDColaborador` (`IDColaborador`),
  KEY `registros_ibfk_4_idx` (`IDProceso`),
  CONSTRAINT `registros_ibfk_2` FOREIGN KEY (`IDLista`) REFERENCES `listas` (`IDLista`),
  CONSTRAINT `registros_ibfk_3` FOREIGN KEY (`IDColaborador`) REFERENCES `colaborador` (`IDColaborador`),
  CONSTRAINT `registros_ibfk_4` FOREIGN KEY (`IDProceso`) REFERENCES `procesos` (`IDProceso`)
) ENGINE=InnoDB AUTO_INCREMENT=208 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registros`
--

LOCK TABLES `registros` WRITE;
/*!40000 ALTER TABLE `registros` DISABLE KEYS */;
INSERT INTO `registros` VALUES (203,'2023-07-10 12:41:00','Creación de Ticket',1,10,195),(204,'2023-07-10 12:50:55','Avance de Ticket',3,10,195),(205,'2023-07-10 12:52:30','Avance de Ticket',4,10,195),(206,'2023-07-10 13:00:52','Avance de Ticket',5,10,195),(207,'2023-07-10 13:09:06','Actualización de datos de Ticket con ID: 195',5,10,195);
/*!40000 ALTER TABLE `registros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `IDRol` int NOT NULL AUTO_INCREMENT,
  `NombreRol` varchar(100) NOT NULL,
  `SiglasDeRol` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`IDRol`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador','ADMIN'),(2,'Gerencia','GER'),(3,'Seguridad','SEG'),(4,'Secretaria','SEC'),(5,'Asesor','ASE');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios`
--

DROP TABLE IF EXISTS `servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicios` (
  `IDServicio` int NOT NULL AUTO_INCREMENT,
  `NombreServicio` varchar(300) DEFAULT NULL,
  `AcronimoServicio` varchar(45) DEFAULT NULL,
  `IDAgencia` int NOT NULL,
  PRIMARY KEY (`IDServicio`),
  KEY `IDAgencia` (`IDAgencia`),
  CONSTRAINT `servicios_ibfk_1` FOREIGN KEY (`IDAgencia`) REFERENCES `agencias` (`IDAgencia`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios`
--

LOCK TABLES `servicios` WRITE;
/*!40000 ALTER TABLE `servicios` DISABLE KEYS */;
INSERT INTO `servicios` VALUES (1,'Créditos','CRE',1),(2,'Ahorros','AHR',1);
/*!40000 ALTER TABLE `servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'procesocreditos'
--

--
-- Dumping routines for database 'procesocreditos'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-07-11  7:50:53
