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
  `source` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcement_announcement`
--

LOCK TABLES `announcement_announcement` WRITE;
/*!40000 ALTER TABLE `announcement_announcement` DISABLE KEYS */;
INSERT INTO `announcement_announcement` VALUES
(1,'工作量系统测试','麻烦各位25级的同学参与一下工作量系统的测试\r\n报告系统bug：http://106.55.103.208:8090/x/KYAc\r\n提出优化建议：http://106.55.103.208:8090/x/MoAc','notice','2025-04-06 16:02:33.100314','2025-08-04 19:37:50.102451',NULL),
(2,'横向工作量申报说明','工作量申报规则和之前线下一致。同一个项目如果涉及到实地（如驻场），时间段要与远程区分开了，分两次填写。\r\n\r\n工作量类型：\r\n远程（在401、406、黄大年、家里）、实地（如驻场）\r\n\r\n工作强度：\r\n1强度值=1硬件小组工作量=半天\r\n根据工作强度类型、工作强度值以及起止时间来核算最终的工作量\r\n无特殊说明按照每周5天也即是每周最多10个工作强度值计算\r\n\r\n证明材料：\r\n可选，支持图片、PDF、word、excel。$\\color{red}只能上传一个文件$，推荐图片或PDF，不需要下载即可在浏览器中预览。','notice','2025-08-04 19:47:53.479123','2025-08-04 19:47:53.479158',NULL),
(3,'填写须知','- 团建工作量放在里面写\r\n\r\n- 其他觉得算为实验室服务的工作量写在这儿','notice','2025-09-04 16:26:39.140015','2025-09-04 16:26:39.140042','other'),
(4,'填写须知','- 包含：标书撰写、申报书撰写、非本人负责的横向项目材料（软著、专利等）撰写、各类材料系统填报或审核、（非课程的）调研PPT\r\n\r\n- 时间节点都只能是4.30后，之前的已经统计过了。材料撰写完1月内申报，过期不算（系统上限制填报中的结束时间与当前时间的距离时间不可超过30天）','notice','2025-09-04 16:27:10.214838','2025-09-04 16:27:10.214927','documentation'),
(5,'填写须知','- 各个小组长的工作量（审稿质量总管+小mentor、考核小组）\r\n\r\n- 只能从项目列表中选择项目，如果没有请自行先申报项目，待审核完后再填写\r\n\r\n- 如果工作强度变化较大时请按分阶段写，不要直接写每周多少','notice','2025-09-04 16:28:03.354311','2025-09-04 16:28:03.354346','horizontal');
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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
(32,'Can view 系统公告',8,'view_announcement'),
(33,'Can add 工作量占比',9,'add_workloadshare'),
(34,'Can change 工作量占比',9,'change_workloadshare'),
(35,'Can delete 工作量占比',9,'delete_workloadshare'),
(36,'Can view 工作量占比',9,'view_workloadshare');
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
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES
(1,'2025-04-06 16:02:33.102232','1','公告1',1,'[{\"added\": {}}]',8,1),
(2,'2025-04-06 19:43:38.002964','3','晨哥',2,'[{\"changed\": {\"fields\": [\"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1),
(3,'2025-04-06 19:44:28.941405','4','雷文强',2,'[{\"changed\": {\"fields\": [\"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1),
(4,'2025-07-13 20:16:39.468973','4','雷文强',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',6,1),
(5,'2025-07-14 13:56:51.868276','5','测试用户',3,'',6,1),
(6,'2025-07-22 15:34:10.294555','7','临时',3,'',6,1),
(7,'2025-07-22 15:35:42.861787','6','测试用户',3,'',6,1),
(8,'2025-07-22 16:58:11.029741','1','工作量系统测试',2,'[{\"changed\": {\"fields\": [\"\\u6807\\u9898\", \"\\u5185\\u5bb9\"]}}]',8,1),
(9,'2025-07-22 19:08:07.245370','9','wyy',3,'',6,1),
(10,'2025-08-03 10:52:28.111808','15','wyy',3,'',6,1),
(11,'2025-08-03 12:26:41.346690','18','406',3,'',6,1),
(12,'2025-08-03 12:26:41.432033','17','wyy',3,'',6,1),
(13,'2025-08-03 15:51:50.871089','10','测试 - 王榆垚',3,'',7,1),
(14,'2025-08-03 15:52:36.951539','19','wyy',3,'',6,1),
(15,'2025-08-03 15:52:37.196934','21','测试',3,'',6,1),
(16,'2025-08-03 15:54:09.849938','16','dingli',3,'',6,1),
(17,'2025-08-03 15:54:09.966721','8','huangkeding',3,'',6,1),
(18,'2025-08-03 15:54:10.145050','20','shuwen',3,'',6,1),
(19,'2025-08-03 15:54:10.534012','10','yantingting',3,'',6,1),
(20,'2025-08-03 21:24:12.760941','24','wyy',3,'',6,1),
(21,'2025-08-04 16:34:43.086063','26','temp',3,'',6,1),
(22,'2025-08-04 16:34:43.192593','27','temp2',3,'',6,1),
(23,'2025-08-04 16:34:43.322596','28','temp3',3,'',6,1),
(24,'2025-08-04 16:34:43.447211','25','测试',3,'',6,1),
(25,'2025-08-04 19:37:50.105427','1','工作量系统测试',2,'[{\"changed\": {\"fields\": [\"\\u5185\\u5bb9\"]}}]',8,1),
(26,'2025-08-04 19:47:53.480244','2','横向工作量申报说明',1,'[{\"added\": {}}]',8,1),
(27,'2025-08-04 20:23:06.773183','12','ceshi - 丁利',3,'',7,1),
(28,'2025-08-04 20:23:06.869693','9','导师提交测试 - 晨哥',3,'',7,1),
(29,'2025-08-04 20:23:06.944817','8','测试2 - 王榆垚',3,'',7,1),
(30,'2025-08-04 20:23:07.086828','7','测试 - 王榆垚',3,'',7,1),
(31,'2025-08-04 20:23:07.161864','5','晨哥提交 - 晨哥',3,'',7,1),
(32,'2025-08-04 20:23:07.237089','4','测试0418 - 王榆垚',3,'',7,1),
(33,'2025-08-04 20:23:07.312511','3','晨哥提交 - 晨哥',3,'',7,1),
(34,'2025-08-04 20:23:07.387126','2','图片 - 王榆垚',3,'',7,1),
(35,'2025-08-04 20:23:07.461195','1','王榆垚给晨哥 - 王榆垚',3,'',7,1),
(36,'2025-08-06 15:32:29.369883','32','冯端宇',1,'[{\"added\": {}}]',6,1),
(37,'2025-08-06 15:33:00.289238','32','冯端宇',2,'[{\"changed\": {\"fields\": [\"\\u90ae\\u7bb1\", \"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1),
(38,'2025-08-06 15:33:17.628770','33','黄幼成',1,'[{\"added\": {}}]',6,1),
(39,'2025-08-06 15:33:28.575856','33','黄幼成',2,'[{\"changed\": {\"fields\": [\"\\u90ae\\u7bb1\", \"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1),
(40,'2025-08-06 15:36:13.546236','34','杜韦宏',1,'[{\"added\": {}}]',6,1),
(41,'2025-08-06 15:36:21.240878','34','杜韦宏',2,'[{\"changed\": {\"fields\": [\"\\u90ae\\u7bb1\", \"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1),
(42,'2025-08-06 15:36:47.155403','35','梁红茹',1,'[{\"added\": {}}]',6,1),
(43,'2025-08-06 15:36:56.621280','35','梁红茹',2,'[{\"changed\": {\"fields\": [\"\\u90ae\\u7bb1\", \"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1),
(44,'2025-08-06 15:38:01.029712','3','晨哥',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',6,1),
(45,'2025-08-06 15:38:22.049995','3','黄晨',2,'[{\"changed\": {\"fields\": [\"Username\", \"Last login\"]}}]',6,1),
(46,'2025-09-02 15:47:10.650132','38','测试导师',2,'[{\"changed\": {\"fields\": [\"\\u7528\\u6237\\u89d2\\u8272\"]}}]',6,1),
(47,'2025-09-02 15:54:12.263174','22','测试 - 王榆垚',3,'',7,1),
(48,'2025-09-02 15:54:12.360185','21','测试 - 王榆垚',3,'',7,1),
(49,'2025-09-04 16:26:39.140867','3','填写须知',1,'[{\"added\": {}}]',8,1),
(50,'2025-09-04 16:27:10.217180','4','填写须知',1,'[{\"added\": {}}]',8,1),
(51,'2025-09-04 16:28:03.355313','5','填写须知',1,'[{\"added\": {}}]',8,1),
(52,'2025-09-07 14:26:53.103334','38','测试导师',3,'',6,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
(7,'workload','workload'),
(9,'workload','workloadshare');
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES
(1,'contenttypes','0001_initial','2025-04-06 15:37:40.371120'),
(2,'contenttypes','0002_remove_content_type_name','2025-04-06 15:37:42.685927'),
(3,'auth','0001_initial','2025-04-06 15:37:50.861261'),
(4,'auth','0002_alter_permission_name_max_length','2025-04-06 15:37:52.274721'),
(5,'auth','0003_alter_user_email_max_length','2025-04-06 15:37:52.355465'),
(6,'auth','0004_alter_user_username_opts','2025-04-06 15:37:52.479111'),
(7,'auth','0005_alter_user_last_login_null','2025-04-06 15:37:52.606277'),
(8,'auth','0006_require_contenttypes_0002','2025-04-06 15:37:52.680853'),
(9,'auth','0007_alter_validators_add_error_messages','2025-04-06 15:37:52.775701'),
(10,'auth','0008_alter_user_username_max_length','2025-04-06 15:37:52.892708'),
(11,'auth','0009_alter_user_last_name_max_length','2025-04-06 15:37:53.049138'),
(12,'auth','0010_alter_group_name_max_length','2025-04-06 15:37:53.338697'),
(13,'auth','0011_update_proxy_permissions','2025-04-06 15:37:53.426823'),
(14,'auth','0012_alter_user_first_name_max_length','2025-04-06 15:37:53.647114'),
(15,'user','0001_initial','2025-04-06 15:38:03.661023'),
(16,'admin','0001_initial','2025-04-06 15:38:07.336001'),
(17,'admin','0002_logentry_remove_auto_add','2025-04-06 15:38:07.443637'),
(18,'admin','0003_logentry_add_action_flag_choices','2025-04-06 15:38:07.575599'),
(19,'announcement','0001_initial','2025-04-06 15:38:08.338487'),
(20,'announcement','0002_remove_announcement_is_active','2025-04-06 15:38:09.351841'),
(21,'sessions','0001_initial','2025-04-06 15:38:10.232419'),
(22,'workload','0001_initial','2025-04-06 15:38:15.012813'),
(23,'workload','0002_remove_workload_reviewer_workload_mentor_review_time_and_more','2025-04-06 15:38:23.329467'),
(24,'workload','0003_remove_workload_file_path_remove_workload_image_path_and_more','2025-04-06 15:38:27.621562'),
(25,'workload','0004_alter_workload_source','2025-08-04 21:19:34.353171'),
(26,'workload','0005_alter_workload_source','2025-09-02 15:43:29.570936'),
(27,'workload','0006_workload_assistant_salary_paid_and_more','2025-09-02 15:43:30.484201'),
(28,'workload','0007_workloadshare','2025-09-04 10:59:05.571384'),
(29,'announcement','0003_announcement_source','2025-09-04 14:44:46.063333');
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
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_user`
--

LOCK TABLES `user_user` WRITE;
/*!40000 ALTER TABLE `user_user` DISABLE KEYS */;
INSERT INTO `user_user` VALUES
(1,'pbkdf2_sha256$720000$2YJlVDeMThHmzlOVwzxdjv$2VdeNucU/JHv9rpPRupfyysjjoJ4EgMWv4fWWbPTOV8=','2025-09-07 14:26:39.493308',1,'admin','','',1,1,'2025-04-06 15:40:27.400625','student','admin@example.com'),
(2,'pbkdf2_sha256$720000$Tf9D6M51AUStxBI0tyXG3m$0FH+5TcHaLzNg03n1+Q5XVoJixZx6ULxHEQhxnovCKk=','2025-09-07 14:25:59.618948',0,'王榆垚','','',0,1,'2025-04-06 19:42:54.739091','student','1@example.com'),
(3,'pbkdf2_sha256$720000$p3KGOpOdVj3nBo1CyD22rw$JZlufFc5WJcLQMQp9Q7oAHo/fPiKpDmMJLrhy+BrhKI=','2025-08-06 15:38:35.648575',0,'黄晨','','',0,1,'2025-04-06 19:43:00.000000','mentor','2@example.com'),
(4,'pbkdf2_sha256$720000$2oK02UyJEJ8xMJf8XRtrjQ$ZDWqNfn0wF5G22PBJhVa+ht5yqkk7leQX5MQtCcb/YQ=','2025-09-02 15:53:06.767242',0,'雷文强','','',0,1,'2025-04-06 19:44:00.000000','teacher','3@example.com'),
(11,'pbkdf2_sha256$720000$BKt33KjqAx4vzctAG238qM$kNiCXrC1ovDeg/dcNjzc+lOxVBVXwj9pJQP5VagYz5E=','2025-08-04 17:04:52.131880',0,'张根源','','',0,1,'2025-07-22 17:07:56.373780','student','550162917@qq.com'),
(12,'pbkdf2_sha256$720000$qIztC2Mq3P2zKhhCKI2Yte$Kpou8NC2jcaigBvxH2X/Egon+DjVkpjDtDKqllYZFcM=','2025-08-06 15:50:05.361108',0,'李阳','','',0,1,'2025-07-22 17:13:39.029701','student','im.liyang.scu@gmail.com'),
(13,'pbkdf2_sha256$720000$mnmk1sSGOZcrJtiyGHfy4I$2PVZ23g+fb6B0/Ja9zzSqzsjGKtOzRQXahRi2U1rHQc=','2025-08-04 11:59:39.630961',0,'李忆','','',0,1,'2025-07-22 18:23:26.828179','student','ly1632003@163.com'),
(14,'pbkdf2_sha256$720000$0zJuQ1Nyl4cROmAyT8f4op$tPtnBWTB55ktXnowKs+EeZQfyLqI9a1o8IxgtuhyZiA=','2025-08-05 19:01:46.540263',0,'柯继翔','','',0,1,'2025-07-22 18:24:14.291278','student','1263794675@qq.com'),
(22,'pbkdf2_sha256$720000$EfA4ciufhg1n3BtatR5RNH$yhI/r0SYqfNBZu4ng2evu0Q2HeFxRMw6Pwb34mT9FE8=',NULL,0,'舒雯','','',0,1,'2025-08-03 16:20:16.287489','student','1527070535@qq.com'),
(23,'pbkdf2_sha256$720000$p2KqISTzj3jh1Fcs7t4rmb$n8kJfCwuPdwrMkRrLPFxyUadi49ak2K8g2OUNccyHPM=','2025-08-06 16:28:57.516886',0,'黄柯丁','','',0,1,'2025-08-03 17:16:50.247268','student','1034151989@qq.com'),
(29,'pbkdf2_sha256$720000$WO5VWMjUDdsOAlIwc0reJF$/BZ0uUNtAvzheV5X7CVMqE2L+SpUiFQYdIqIdmW8LKc=','2025-08-04 17:06:09.159876',0,'徐纳达','','',0,1,'2025-08-04 16:41:09.518233','student','1405845953@qq.com'),
(30,'pbkdf2_sha256$720000$SYqsQKtzIgWlMRmM6b3h6J$X7ofFgVR8DagpqifqwQV85HWLhoeyEhxw7rv/QcSiSs=','2025-08-04 17:01:08.928178',0,'丁利','','',0,1,'2025-08-04 16:48:34.601789','student','1225390750@qq.com'),
(31,'pbkdf2_sha256$720000$rbcQJO4NXI8LQU4MnPg3fw$E9xd7/KZiIle54o3ZLKNrp9NeY5dhMAJmLVQVXSXzGA=',NULL,0,'guanzhizhao','','',0,1,'2025-08-04 18:59:10.049544','student','1291254703@qq.com'),
(32,'pbkdf2_sha256$720000$OMlnkTi57qVSZb35uoYpvD$NVjrp2WJW90ia+/7/mrhlxwGqXT3zYYfl9VF6Vyr5qs=',NULL,0,'冯端宇','','',0,1,'2025-08-06 15:32:00.000000','mentor','duanyu@example.com'),
(33,'pbkdf2_sha256$720000$1k4NgS8ECvFWTYVHHhPu1o$PCDPn6pWB3fGo91wBOLkn4ufSq8wsEPeEW8G/HR3jFk=',NULL,0,'黄幼成','','',0,1,'2025-08-06 15:33:00.000000','mentor','youcheng@example.com'),
(34,'pbkdf2_sha256$720000$WepWuLjj3vCPmGKL5ZDAEq$e1p+GTQBuyvdbzMH9E0m0UqAJXe497TPR9yYgA+bCjo=',NULL,0,'杜韦宏','','',0,1,'2025-08-06 15:36:00.000000','mentor','duweihong@example.com'),
(35,'pbkdf2_sha256$720000$sz8JdYcQipk5IRUCd17LWK$mLCfjmcQDB1BblQoR2AtQ+ukcvZhsSFO8RB8UeQO0iE=',NULL,0,'梁红茹','','',0,1,'2025-08-06 15:36:00.000000','teacher','lianghongru@example.com'),
(36,'pbkdf2_sha256$720000$bgb8XkWoklppOQdGoxuJav$P9GWTxuYOh43EbLuSA+dSA2OCbImsR/qgM0nAYBAlfA=','2025-08-16 14:27:46.049464',0,'徐骏捷','','',0,1,'2025-08-06 15:53:53.228376','student','xjj@temp.com'),
(37,'pbkdf2_sha256$720000$oqdaugXCjA9JQWpDGSdx8h$mgIOGRRK6QKbbPHcS38FPxN2KDJB1S+m+cd495KLNx8=','2025-08-06 17:03:53.095577',0,'杨盛界','','',0,1,'2025-08-06 16:26:09.361925','student','3257547200@qq.com');
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
  `assistant_salary_paid` int DEFAULT NULL,
  `innovation_stage` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `workload_workload_submitter_id_975620d9_fk_user_user_id` (`submitter_id`),
  KEY `workload_workload_mentor_reviewer_id_44dd9bb9_fk_user_user_id` (`mentor_reviewer_id`),
  KEY `workload_workload_teacher_reviewer_id_5401182d_fk_user_user_id` (`teacher_reviewer_id`),
  CONSTRAINT `workload_workload_mentor_reviewer_id_44dd9bb9_fk_user_user_id` FOREIGN KEY (`mentor_reviewer_id`) REFERENCES `user_user` (`id`),
  CONSTRAINT `workload_workload_submitter_id_975620d9_fk_user_user_id` FOREIGN KEY (`submitter_id`) REFERENCES `user_user` (`id`),
  CONSTRAINT `workload_workload_teacher_reviewer_id_5401182d_fk_user_user_id` FOREIGN KEY (`teacher_reviewer_id`) REFERENCES `user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workload_workload`
--

LOCK TABLES `workload_workload` WRITE;
/*!40000 ALTER TABLE `workload_workload` DISABLE KEYS */;
INSERT INTO `workload_workload` VALUES
(13,'开发npic核动力系统前端-npic项目前端部分','为npic核动力项目系统编写前端，设计后端交互接口，设计部署方式。其中2025.1.15-2025.1.25为主要设计时间，共工作7个整天；随后2025.2.26部署一个半天','horizontal','remote','2025-01-15','2025-02-26','total',15,'pending',NULL,NULL,'2025-08-04 17:06:54.887754','2025-08-04 17:06:54.887773',29,NULL,3,NULL,NULL,'workload_files/徐纳达/None/npic.docx',NULL,NULL),
(14,'面向电力领域结构化数据库的对话式信息查询方法第一阶段','本工作属于电网应急文档生成项目的text2SQL任务的子项目。目前第一阶段进展为：收集并构建一个小的电网数据集，并在其中对目前主流的text2SQL任务进行测试，进行一个小的改进测试。具体工作阶段：2024.11-2025.1对text2SQL领域进行调研；2025.3-2025.4收集并构建数据集；2025.5-2025.6对现有方法在自建数据集上进行测试并提出一定的改进。调研阶段工作每天占用半天，收集数据集和开发阶段工作占用每天全天。总工作量为（调研：60，收集数据集：60，开发：60）','horizontal','remote','2024-10-22','2025-06-10','total',180,'pending',NULL,NULL,'2025-08-04 17:27:56.840846','2025-08-04 17:27:56.840872',29,NULL,3,NULL,NULL,'',NULL,NULL),
(15,'华二Agent开发','智能体模拟合成医患问诊数据','horizontal','onsite','2025-03-01','2025-03-19','weekly',8,'pending',NULL,NULL,'2025-08-05 09:56:03.615700','2025-08-05 09:56:03.615757',2,NULL,3,NULL,NULL,'workload_files/王榆垚/None/智能体模拟合成医患问诊数据.pdf',NULL,NULL),
(16,'华二Agent开发','代码整合、实验方案设计、系统测试优化、API开发','horizontal','remote','2025-03-20','2025-07-01','weekly',6,'pending',NULL,NULL,'2025-08-05 09:59:34.728002','2025-08-15 10:38:07.686488',2,NULL,3,NULL,NULL,'workload_files/王榆垚/None/实验方案.pdf',NULL,NULL),
(17,'华西agent','1.知识图谱、用户画像、长短期记忆的实现\r\n2.代码整合\r\n3.系统测试优化\r\n4.API开发','horizontal','remote','2025-03-01','2025-07-01','weekly',8,'pending',NULL,NULL,'2025-08-05 19:13:41.338414','2025-08-05 19:19:17.300314',14,NULL,3,NULL,NULL,'',NULL,NULL),
(18,'横向标书','网络协议分析标书撰写部分章节','horizontal','remote','2025-07-02','2025-07-15','total',14,'pending',NULL,NULL,'2025-08-06 15:52:55.546402','2025-08-06 15:57:50.041204',12,NULL,34,NULL,NULL,'',NULL,NULL),
(19,'横向线下会议','核动力院Agent项目需求线下沟通交流','horizontal','onsite','2025-07-10','2025-07-10','total',1,'pending',NULL,NULL,'2025-08-06 15:55:46.141301','2025-08-06 15:55:46.141342',12,NULL,34,NULL,NULL,'',NULL,NULL),
(25,'1','1','innovation','remote','2025-09-05','2025-09-05','total',1,'pending',NULL,NULL,'2025-09-05 13:07:13.752215','2025-09-05 13:07:13.752232',2,NULL,NULL,NULL,NULL,'',NULL,'before');
/*!40000 ALTER TABLE `workload_workload` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workload_workloadshare`
--

DROP TABLE IF EXISTS `workload_workloadshare`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workload_workloadshare` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `percentage` double NOT NULL,
  `user_id` bigint NOT NULL,
  `workload_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workload_workloadshare_workload_id_user_id_2b31efce_uniq` (`workload_id`,`user_id`),
  KEY `workload_workloadshare_user_id_2de6bc9a_fk_user_user_id` (`user_id`),
  CONSTRAINT `workload_workloadsha_workload_id_bd86ab13_fk_workload_` FOREIGN KEY (`workload_id`) REFERENCES `workload_workload` (`id`),
  CONSTRAINT `workload_workloadshare_user_id_2de6bc9a_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workload_workloadshare`
--

LOCK TABLES `workload_workloadshare` WRITE;
/*!40000 ALTER TABLE `workload_workloadshare` DISABLE KEYS */;
INSERT INTO `workload_workloadshare` VALUES
(8,100,2,25);
/*!40000 ALTER TABLE `workload_workloadshare` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-10 15:34:26
