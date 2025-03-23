/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.11-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: db    Database: workload_db
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `announcement_announcement`
--

DROP TABLE IF EXISTS `announcement_announcement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement_announcement` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `content` longtext NOT NULL,
  `type` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcement_announcement`
--

LOCK TABLES `announcement_announcement` WRITE;
/*!40000 ALTER TABLE `announcement_announcement` DISABLE KEYS */;
INSERT INTO `announcement_announcement` VALUES
(1,'系统管理员','王榆垚','notice','2025-03-23 20:35:40.371869','2025-03-23 20:35:40.371888');
/*!40000 ALTER TABLE `announcement_announcement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES
(1,'Can add log entry',1,'add_logentry'),
(2,'Can change log entry',1,'change_logentry'),
(3,'Can delete log entry',1,'delete_logentry'),
(4,'Can view log entry',1,'view_logentry'),
(5,'Can add permission',2,'add_permission'),
(6,'Can change permission',2,'change_permission'),
(7,'Can delete permission',2,'delete_permission'),
(8,'Can view permission',2,'view_permission'),
(9,'Can add group',3,'add_group'),
(10,'Can change group',3,'change_group'),
(11,'Can delete group',3,'delete_group'),
(12,'Can view group',3,'view_group'),
(13,'Can add content type',4,'add_contenttype'),
(14,'Can change content type',4,'change_contenttype'),
(15,'Can delete content type',4,'delete_contenttype'),
(16,'Can view content type',4,'view_contenttype'),
(17,'Can add session',5,'add_session'),
(18,'Can change session',5,'change_session'),
(19,'Can delete session',5,'delete_session'),
(20,'Can view session',5,'view_session'),
(21,'Can add 用户',6,'add_user'),
(22,'Can change 用户',6,'change_user'),
(23,'Can delete 用户',6,'delete_user'),
(24,'Can view 用户',6,'view_user'),
(25,'Can add 工作量',7,'add_workload'),
(26,'Can change 工作量',7,'change_workload'),
(27,'Can delete 工作量',7,'delete_workload'),
(28,'Can view 工作量',7,'view_workload'),
(29,'Can add 系统公告',8,'add_announcement'),
(30,'Can change 系统公告',8,'change_announcement'),
(31,'Can delete 系统公告',8,'delete_announcement'),
(32,'Can view 系统公告',8,'view_announcement');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_user_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES
(1,'2025-03-23 20:35:40.372497','1','系统管理员',1,'[{\"added\": {}}]',8,1),
(2,'2025-03-23 20:37:22.398922','4','元新',2,'[{\"changed\": {\"fields\": [\"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1),
(3,'2025-03-23 20:37:28.509637','3','晨哥',2,'[{\"changed\": {\"fields\": [\"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1),
(4,'2025-03-23 20:40:56.107813','5','雷文强',2,'[{\"changed\": {\"fields\": [\"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1);
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES
(1,'admin','logentry'),
(8,'announcement','announcement'),
(3,'auth','group'),
(2,'auth','permission'),
(4,'contenttypes','contenttype'),
(5,'sessions','session'),
(6,'user','user'),
(7,'workload','workload');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES
(1,'contenttypes','0001_initial','2025-03-23 20:29:31.625873'),
(2,'contenttypes','0002_remove_content_type_name','2025-03-23 20:29:31.913551'),
(3,'auth','0001_initial','2025-03-23 20:29:32.635747'),
(4,'auth','0002_alter_permission_name_max_length','2025-03-23 20:29:32.802718'),
(5,'auth','0003_alter_user_email_max_length','2025-03-23 20:29:32.813438'),
(6,'auth','0004_alter_user_username_opts','2025-03-23 20:29:32.827899'),
(7,'auth','0005_alter_user_last_login_null','2025-03-23 20:29:32.838693'),
(8,'auth','0006_require_contenttypes_0002','2025-03-23 20:29:32.845102'),
(9,'auth','0007_alter_validators_add_error_messages','2025-03-23 20:29:32.854859'),
(10,'auth','0008_alter_user_username_max_length','2025-03-23 20:29:32.864098'),
(11,'auth','0009_alter_user_last_name_max_length','2025-03-23 20:29:32.873902'),
(12,'auth','0010_alter_group_name_max_length','2025-03-23 20:29:32.899583'),
(13,'auth','0011_update_proxy_permissions','2025-03-23 20:29:32.910214'),
(14,'auth','0012_alter_user_first_name_max_length','2025-03-23 20:29:32.919613'),
(15,'user','0001_initial','2025-03-23 20:29:33.739537'),
(16,'admin','0001_initial','2025-03-23 20:29:34.076184'),
(17,'admin','0002_logentry_remove_auto_add','2025-03-23 20:29:34.088111'),
(18,'admin','0003_logentry_add_action_flag_choices','2025-03-23 20:29:34.099196'),
(19,'announcement','0001_initial','2025-03-23 20:29:34.156206'),
(20,'announcement','0002_remove_announcement_is_active','2025-03-23 20:29:34.280590'),
(21,'sessions','0001_initial','2025-03-23 20:29:34.372695'),
(22,'workload','0001_initial','2025-03-23 20:29:34.714079'),
(23,'workload','0002_remove_workload_reviewer_workload_mentor_review_time_and_more','2025-03-23 20:29:35.402585'),
(24,'workload','0003_remove_workload_file_path_remove_workload_image_path_and_more','2025-03-23 20:29:35.862249');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_user`
--

DROP TABLE IF EXISTS `user_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `role` varchar(10) NOT NULL,
  `email` varchar(254) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_user`
--

LOCK TABLES `user_user` WRITE;
/*!40000 ALTER TABLE `user_user` DISABLE KEYS */;
INSERT INTO `user_user` VALUES
(1,'pbkdf2_sha256$720000$SK3WesfwYk5kEQtwmwmxh4$w2CmRuGg2T1FB0LMNMwWatzvWOWNoX8y44cOAexjEoY=','2025-03-23 20:34:19.856357',1,'admin','','',1,1,'2025-03-23 20:33:48.843715','student','admin@example.com'),
(2,'pbkdf2_sha256$720000$xCSzPw6AypD9ZZDsyddQql$MmNEtTkqwUmFGYabeSDd9WBDHgn4gkCXr9lFGPhZCvI=','2025-03-23 20:48:05.912058',0,'王榆垚','','',0,1,'2025-03-23 20:35:12.193916','student','1@example.com'),
(3,'pbkdf2_sha256$720000$oFEKM2ZyCKumNuamNQPWR4$NBH3nNi8PpMHPDYwNfX5Pw9IsqqDTVvAziXQ0Z1iAMc=','2025-03-23 20:45:10.453272',0,'晨哥','','',0,1,'2025-03-23 20:36:00.000000','mentor','2@example.com'),
(4,'pbkdf2_sha256$720000$f9KT0Uc7xQxsKBNod9M0c5$pPq46LUbHvU/VZikXTHCMifp47wCk6ZbVyGfMuWncsA=','2025-03-23 20:44:15.663893',0,'元新','','',0,1,'2025-03-23 20:37:00.000000','mentor','2@1.com'),
(5,'pbkdf2_sha256$720000$YXtEB2Xa06yMcIQukiSt1x$2uzfak7c6M7D8/9l6cAFKY/hHMJiZXa34vJ6tFys4B0=','2025-03-23 20:58:35.068339',0,'雷文强','','',0,1,'2025-03-23 20:40:00.000000','teacher','1@2.com');
/*!40000 ALTER TABLE `user_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_user_groups`
--

DROP TABLE IF EXISTS `user_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_user_groups_user_id_group_id_bb60391f_uniq` (`user_id`,`group_id`),
  KEY `user_user_groups_group_id_c57f13c0_fk_auth_group_id` (`group_id`),
  CONSTRAINT `user_user_groups_group_id_c57f13c0_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `user_user_groups_user_id_13f9a20d_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_user_user_permissions_user_id_permission_id_64f4d5b8_uniq` (`user_id`,`permission_id`),
  KEY `user_user_user_permi_permission_id_ce49d4de_fk_auth_perm` (`permission_id`),
  CONSTRAINT `user_user_user_permi_permission_id_ce49d4de_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `user_user_user_permissions_user_id_31782f58_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workload_workload` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `content` longtext NOT NULL,
  `source` varchar(20) NOT NULL,
  `work_type` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `intensity_type` varchar(20) NOT NULL,
  `intensity_value` double NOT NULL,
  `status` varchar(20) NOT NULL,
  `mentor_comment` longtext,
  `teacher_comment` longtext,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `submitter_id` bigint NOT NULL,
  `mentor_review_time` datetime(6) DEFAULT NULL,
  `mentor_reviewer_id` bigint DEFAULT NULL,
  `teacher_review_time` datetime(6) DEFAULT NULL,
  `teacher_reviewer_id` bigint DEFAULT NULL,
  `attachments` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `workload_workload_submitter_id_975620d9_fk_user_user_id` (`submitter_id`),
  KEY `workload_workload_mentor_reviewer_id_44dd9bb9_fk_user_user_id` (`mentor_reviewer_id`),
  KEY `workload_workload_teacher_reviewer_id_5401182d_fk_user_user_id` (`teacher_reviewer_id`),
  CONSTRAINT `workload_workload_mentor_reviewer_id_44dd9bb9_fk_user_user_id` FOREIGN KEY (`mentor_reviewer_id`) REFERENCES `user_user` (`id`),
  CONSTRAINT `workload_workload_submitter_id_975620d9_fk_user_user_id` FOREIGN KEY (`submitter_id`) REFERENCES `user_user` (`id`),
  CONSTRAINT `workload_workload_teacher_reviewer_id_5401182d_fk_user_user_id` FOREIGN KEY (`teacher_reviewer_id`) REFERENCES `user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workload_workload`
--

LOCK TABLES `workload_workload` WRITE;
/*!40000 ALTER TABLE `workload_workload` DISABLE KEYS */;
INSERT INTO `workload_workload` VALUES
(1,'晨哥提交图片','测试','horizontal','onsite','2025-03-01','2025-03-23','weekly',2,'teacher_approved',NULL,'通过','2025-03-23 20:38:52.472660','2025-03-23 20:47:17.245198',3,NULL,NULL,'2025-03-23 20:47:17.244517',5,'workload_files/晨哥/None/IMG_20221224_152851.jpg'),
(2,'晨哥pdf','开发','innovation','remote','2025-03-23','2025-03-23','total',4,'teacher_approved',NULL,'通过','2025-03-23 20:40:02.313168','2025-03-23 20:41:55.255082',3,NULL,NULL,'2025-03-23 20:41:55.254176',5,'workload_files/晨哥/None/home软链接空间管理.pdf'),
(3,'word王榆垚给晨哥','测试','hardware','remote','2025-03-23','2025-03-23','total',2,'pending','拒绝',NULL,'2025-03-23 20:42:54.051042','2025-03-23 20:48:22.724169',2,'2025-03-23 20:45:22.547874',3,NULL,NULL,'workload_files/王榆垚/None/2024_8_7_实验室服务器管理方案.docx'),
(4,'王榆垚提交1','测试','horizontal','onsite','2025-03-23','2025-03-23','weekly',1,'teacher_rejected','通过','拒绝','2025-03-23 20:43:55.353872','2025-03-23 20:47:01.668448',2,'2025-03-23 20:44:59.425050',4,'2025-03-23 20:47:01.667193',5,''),
(5,'元新提交','吃撒','horizontal','remote','2025-03-23','2025-03-23','total',1,'pending',NULL,NULL,'2025-03-23 20:44:47.577070','2025-03-23 20:44:47.577122',4,NULL,NULL,NULL,NULL,'workload_files/元新/None/home软链接空间管理.pdf');
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

-- Dump completed on 2025-03-23 20:59:20
