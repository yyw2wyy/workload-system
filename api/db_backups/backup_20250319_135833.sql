-- MySQL dump 10.13  Distrib 8.4.4, for Win64 (x86_64)
--
-- Host: localhost    Database: workload_db
-- ------------------------------------------------------
-- Server version	8.4.4

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
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add 用户',6,'add_user'),(22,'Can change 用户',6,'change_user'),(23,'Can delete 用户',6,'delete_user'),(24,'Can view 用户',6,'view_user'),(25,'Can add 工作量',7,'add_workload'),(26,'Can change 工作量',7,'change_workload'),(27,'Can delete 工作量',7,'delete_workload'),(28,'Can view 工作量',7,'view_workload');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext COLLATE utf8mb4_unicode_ci,
  `object_repr` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_user_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES (1,'2025-03-18 13:47:32.414909','7','梁老师',2,'[{\"changed\": {\"fields\": [\"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1),(2,'2025-03-18 13:47:40.414865','6','雷文强',2,'[{\"changed\": {\"fields\": [\"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1),(3,'2025-03-18 13:47:47.088685','4','晨哥',2,'[{\"changed\": {\"fields\": [\"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1),(4,'2025-03-18 13:47:55.260287','5','元新',2,'[{\"changed\": {\"fields\": [\"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1),(5,'2025-03-19 12:32:34.590653','3','王榆垚给晨哥2 - admin',3,'',7,1),(6,'2025-03-19 12:32:34.598513','1','王榆垚提交给晨哥1 - admin',3,'',7,1);
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'contenttypes','contenttype'),(5,'sessions','session'),(6,'user','user'),(7,'workload','workload');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-03-18 13:32:49.440218'),(2,'contenttypes','0002_remove_content_type_name','2025-03-18 13:32:49.593766'),(3,'auth','0001_initial','2025-03-18 13:32:50.057790'),(4,'auth','0002_alter_permission_name_max_length','2025-03-18 13:32:50.154627'),(5,'auth','0003_alter_user_email_max_length','2025-03-18 13:32:50.163096'),(6,'auth','0004_alter_user_username_opts','2025-03-18 13:32:50.171323'),(7,'auth','0005_alter_user_last_login_null','2025-03-18 13:32:50.179903'),(8,'auth','0006_require_contenttypes_0002','2025-03-18 13:32:50.190028'),(9,'auth','0007_alter_validators_add_error_messages','2025-03-18 13:32:50.200138'),(10,'auth','0008_alter_user_username_max_length','2025-03-18 13:32:50.207426'),(11,'auth','0009_alter_user_last_name_max_length','2025-03-18 13:32:50.213378'),(12,'auth','0010_alter_group_name_max_length','2025-03-18 13:32:50.234844'),(13,'auth','0011_update_proxy_permissions','2025-03-18 13:32:50.244259'),(14,'auth','0012_alter_user_first_name_max_length','2025-03-18 13:32:50.257251'),(15,'user','0001_initial','2025-03-18 13:32:50.776764'),(16,'admin','0001_initial','2025-03-18 13:32:51.012882'),(17,'admin','0002_logentry_remove_auto_add','2025-03-18 13:32:51.021531'),(18,'admin','0003_logentry_add_action_flag_choices','2025-03-18 13:32:51.031907'),(19,'sessions','0001_initial','2025-03-18 13:32:51.088505'),(20,'workload','0001_initial','2025-03-18 13:32:51.321741'),(21,'workload','0002_remove_workload_reviewer_workload_mentor_review_time_and_more','2025-03-18 13:32:51.804847');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('rb6cd0zm5c9fdq8ham1w3zahjjxkc0p9','.eJxVjEEOwiAQRe_C2hBGQQaX7j1DMwODVA0kpV0Z726bdKHb_977bzXQMpdh6TINY1IXBerwuzHFp9QNpAfVe9Ox1XkaWW-K3mnXt5bkdd3dv4NCvax1PgVrbIrkzjab5KND5AwUnDtmS8EwA0ICWBkyWg5gEL0XwQjgRH2-20w3eg:1tul2K:KUv6_2xWpR_wWcrkD4VrpqLPSYjD2rTIZ75All-XrwM','2025-04-02 04:28:12.282378');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_user`
--

DROP TABLE IF EXISTS `user_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `role` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_user`
--

LOCK TABLES `user_user` WRITE;
/*!40000 ALTER TABLE `user_user` DISABLE KEYS */;
INSERT INTO `user_user` VALUES (1,'pbkdf2_sha256$720000$0rjZbCYeh29UNZ3VIcJKey$gDQFKKGb8Lr7Dn89ezMe82anDIYTfpgbbKLu8AHumVQ=','2025-03-19 13:50:36.156550',1,'admin','','',1,1,'2025-03-18 13:35:11.429241','student','admin@example.com'),(2,'pbkdf2_sha256$720000$DBRnPokHulXrKl4MssnlbZ$rMVMnNb5rFoAgh3VZsxHS/9KfHrgKKRu8nMYmLJXK1s=','2025-03-19 13:27:22.136419',0,'王榆垚','','',0,1,'2025-03-18 13:36:34.708950','student','1@example.com'),(3,'pbkdf2_sha256$720000$y3DLbYllR19QaTqkmQggv0$Ov6MqIhY2PgLs2vBBWdd1AwSCuzbtJwe7USjkWFINzE=','2025-03-19 12:54:28.274895',0,'楚轩','','',0,1,'2025-03-18 13:40:25.253337','student','2@example.com'),(4,'pbkdf2_sha256$720000$quFQIqVsy339dvv34Vbupr$WgGxwSpaEdBL+P0RTShmcCMI1UBy7slsp0cncYF2XVs=','2025-03-19 13:40:55.471143',0,'晨哥','','',0,1,'2025-03-18 13:45:00.000000','mentor','3@example.com'),(5,'pbkdf2_sha256$720000$Yvk1w7o8hqmqdRYO8lS3su$WmckvR3ZPuF15nImJYA8WMzF3lG7Ek9iTDjH1sf+Nrw=','2025-03-19 13:04:18.734741',0,'元新','','',0,1,'2025-03-18 13:45:00.000000','mentor','4@example.com'),(6,'pbkdf2_sha256$720000$pUujH5yZfPrOPp2u7yf15b$HvZHEldaOZ94jly0UMxYLcL3MXdjSXqweUSIL6fEcUQ=','2025-03-19 13:22:38.720091',0,'雷文强','','',0,1,'2025-03-18 13:46:00.000000','teacher','5@example.com'),(7,'pbkdf2_sha256$720000$yaY77z8WiUhd0HwWqXA1KR$kstrrJEuDOZ6+kWug1NfjjoX6xZ/3TNX7XV4m6rmcFo=',NULL,0,'梁老师','','',0,1,'2025-03-18 13:47:00.000000','teacher','6@example.com');
/*!40000 ALTER TABLE `user_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_user_groups`
--

DROP TABLE IF EXISTS `user_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_user_groups_user_id_group_id_bb60391f_uniq` (`user_id`,`group_id`),
  KEY `user_user_groups_group_id_c57f13c0_fk_auth_group_id` (`group_id`),
  CONSTRAINT `user_user_groups_group_id_c57f13c0_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `user_user_groups_user_id_13f9a20d_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_user_groups`
--

LOCK TABLES `user_user_groups` WRITE;
/*!40000 ALTER TABLE `user_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_user_user_permissions`
--

DROP TABLE IF EXISTS `user_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_user_user_permissions_user_id_permission_id_64f4d5b8_uniq` (`user_id`,`permission_id`),
  KEY `user_user_user_permi_permission_id_ce49d4de_fk_auth_perm` (`permission_id`),
  CONSTRAINT `user_user_user_permi_permission_id_ce49d4de_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `user_user_user_permissions_user_id_31782f58_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_user_user_permissions`
--

LOCK TABLES `user_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `user_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workload_workload`
--

DROP TABLE IF EXISTS `workload_workload`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workload_workload` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `source` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `intensity_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `intensity_value` double NOT NULL,
  `image_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mentor_comment` longtext COLLATE utf8mb4_unicode_ci,
  `teacher_comment` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `submitter_id` bigint NOT NULL,
  `mentor_review_time` datetime(6) DEFAULT NULL,
  `mentor_reviewer_id` bigint DEFAULT NULL,
  `teacher_review_time` datetime(6) DEFAULT NULL,
  `teacher_reviewer_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `workload_workload_submitter_id_975620d9_fk_user_user_id` (`submitter_id`),
  KEY `workload_workload_mentor_reviewer_id_44dd9bb9_fk_user_user_id` (`mentor_reviewer_id`),
  KEY `workload_workload_teacher_reviewer_id_5401182d_fk_user_user_id` (`teacher_reviewer_id`),
  CONSTRAINT `workload_workload_mentor_reviewer_id_44dd9bb9_fk_user_user_id` FOREIGN KEY (`mentor_reviewer_id`) REFERENCES `user_user` (`id`),
  CONSTRAINT `workload_workload_submitter_id_975620d9_fk_user_user_id` FOREIGN KEY (`submitter_id`) REFERENCES `user_user` (`id`),
  CONSTRAINT `workload_workload_teacher_reviewer_id_5401182d_fk_user_user_id` FOREIGN KEY (`teacher_reviewer_id`) REFERENCES `user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workload_workload`
--

LOCK TABLES `workload_workload` WRITE;
/*!40000 ALTER TABLE `workload_workload` DISABLE KEYS */;
INSERT INTO `workload_workload` VALUES (4,'晨哥提交1','测试','horizontal','remote','2025-03-18','2025-03-18','total',1,NULL,NULL,'teacher_approved',NULL,'通过','2025-03-18 13:54:19.476984','2025-03-19 13:25:00.113134',4,NULL,NULL,'2025-03-19 13:25:00.113134',6),(5,'晨哥提交2','1','horizontal','remote','2025-03-18','2025-03-18','total',1,NULL,NULL,'teacher_approved',NULL,'通过','2025-03-18 13:54:39.628262','2025-03-18 13:58:42.331031',4,NULL,NULL,'2025-03-18 13:58:42.331031',6),(6,'王榆垚提交给元新','测试','horizontal','remote','2025-03-18','2025-03-18','total',1,NULL,NULL,'mentor_rejected','拒绝',NULL,'2025-03-18 14:01:52.183096','2025-03-18 14:03:52.842567',2,'2025-03-18 14:03:52.842053',5,NULL,NULL),(7,'王榆垚给晨哥','测试','horizontal','remote','2025-03-19','2025-03-19','total',1,NULL,NULL,'pending',NULL,NULL,'2025-03-19 03:38:28.338467','2025-03-19 03:38:28.338467',2,NULL,4,NULL,NULL),(8,'王榆垚给晨哥1','测试','assessment','remote','2025-03-19','2025-03-19','total',1,NULL,NULL,'pending',NULL,NULL,'2025-03-19 12:40:12.906445','2025-03-19 12:40:12.906445',2,NULL,4,NULL,NULL),(9,'王榆垚给元新1','测试','horizontal','remote','2025-03-19','2025-03-19','total',1,NULL,NULL,'pending',NULL,NULL,'2025-03-19 12:41:02.813958','2025-03-19 12:41:02.813958',2,NULL,5,NULL,NULL),(10,'王榆垚给元新123','看帆帆帆帆','hardware','remote','2025-03-19','2025-03-19','weekly',1,NULL,NULL,'teacher_approved','通过','通过','2025-03-19 12:41:54.358790','2025-03-19 13:30:39.285389',2,'2025-03-19 13:05:08.888264',5,'2025-03-19 13:30:39.285389',6),(11,'楚轩给晨哥','测试','hardware','remote','2025-03-19','2025-03-19','total',1,NULL,NULL,'mentor_approved','通过',NULL,'2025-03-19 12:48:46.625411','2025-03-19 12:51:51.851826',3,'2025-03-19 12:51:51.851826',4,NULL,NULL),(12,'楚轩给晨哥1','开发','assessment','remote','2025-03-19','2025-03-19','total',2,NULL,NULL,'mentor_approved','通过',NULL,'2025-03-19 12:50:08.084488','2025-03-19 12:51:10.545012',3,'2025-03-19 12:51:10.544493',4,NULL,NULL),(13,'123楚轩提交给晨哥','测试','horizontal','onsite','2025-03-19','2025-03-19','weekly',4,NULL,NULL,'mentor_approved','通过',NULL,'2025-03-19 12:55:07.832454','2025-03-19 12:57:32.530699',3,'2025-03-19 12:57:32.530181',4,NULL,NULL),(14,'新楚轩提交给晨哥','开发','horizontal','remote','2025-03-19','2025-03-19','total',1,NULL,NULL,'mentor_approved','通过',NULL,'2025-03-19 13:00:24.127710','2025-03-19 13:23:01.163929',3,'2025-03-19 13:00:41.188642',4,NULL,NULL),(15,'测试','1','horizontal','remote','2025-03-19','2025-03-19','total',2,NULL,NULL,'teacher_approved','通过','通过','2025-03-19 13:02:35.250598','2025-03-19 13:21:40.429206',3,'2025-03-19 13:02:57.516923',4,'2025-03-19 13:21:40.429206',6),(16,'元新提交','测试','horizontal','remote','2025-03-19','2025-03-19','total',4.8,NULL,NULL,'pending',NULL,NULL,'2025-03-19 13:04:47.468491','2025-03-19 13:12:30.613094',5,NULL,NULL,NULL,NULL),(17,'王榆垚提交新','测试','horizontal','remote','2025-03-19','2025-03-19','total',1,NULL,NULL,'pending',NULL,NULL,'2025-03-19 13:34:05.867187','2025-03-19 13:34:05.867187',2,NULL,4,NULL,NULL),(18,'晨哥提交没问题了','成为市场','horizontal','remote','2025-03-19','2025-03-19','total',1,NULL,NULL,'pending',NULL,'不通过','2025-03-19 13:41:37.863702','2025-03-19 13:42:11.746346',4,NULL,NULL,'2025-03-19 13:41:52.615441',6);
/*!40000 ALTER TABLE `workload_workload` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-19 13:58:34
