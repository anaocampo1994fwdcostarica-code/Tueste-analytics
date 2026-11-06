-- Datos exclusivamente ficticios para demostracion academica.
-- Destino permitido: tueste_analytics_test_migration.
-- No contiene USE y no representa resultados historicos reales de Tueste.

CREATE TEMPORARY TABLE `_demo_load_guard` (
  `check_name` varchar(80) NOT NULL,
  `ok` tinyint NOT NULL,
  CONSTRAINT `chk_demo_load_guard` CHECK (`ok` = 1)
) ENGINE=InnoDB;

-- Falla antes de cualquier carga si el destino no es el temporal autorizado.
INSERT INTO `_demo_load_guard` VALUES
  ('authorized_database', DATABASE() = 'tueste_analytics_test_migration');

-- La carga es intencionalmente solo para un esquema temporal completamente vacio.
SET @demo_existing_rows :=
  (SELECT COUNT(*) FROM `advertising_acquisition_history`) +
  (SELECT COUNT(*) FROM `commercial_offers`) +
  (SELECT COUNT(*) FROM `order_variable_cost_assumptions`) +
  (SELECT COUNT(*) FROM `financial_assumptions`) +
  (SELECT COUNT(*) FROM `products`) + (SELECT COUNT(*) FROM `repurchase_patterns`) +
  (SELECT COUNT(*) FROM `subscription_parameters`) + (SELECT COUNT(*) FROM `offer_products`) +
  (SELECT COUNT(*) FROM `product_variable_costs`) + (SELECT COUNT(*) FROM `commercial_scenarios`) +
  (SELECT COUNT(*) FROM `simulation_configs`) + (SELECT COUNT(*) FROM `simulation_config_scenarios`) +
  (SELECT COUNT(*) FROM `team_members`) + (SELECT COUNT(*) FROM `marketing_channels`) +
  (SELECT COUNT(*) FROM `campaigns`) + (SELECT COUNT(*) FROM `campaign_daily_metrics`) +
  (SELECT COUNT(*) FROM `contacts`) + (SELECT COUNT(*) FROM `customer_journey_stages`) +
  (SELECT COUNT(*) FROM `customer_touchpoints`) + (SELECT COUNT(*) FROM `sales_funnel_stages`) +
  (SELECT COUNT(*) FROM `leads`) + (SELECT COUNT(*) FROM `lead_stage_history`) +
  (SELECT COUNT(*) FROM `sales_opportunities`) + (SELECT COUNT(*) FROM `content_items`) +
  (SELECT COUNT(*) FROM `content_channels`) + (SELECT COUNT(*) FROM `content_reviews`) +
  (SELECT COUNT(*) FROM `marketing_sales_handoffs`) + (SELECT COUNT(*) FROM `handoff_followups`) +
  (SELECT COUNT(*) FROM `subscription_plans`) + (SELECT COUNT(*) FROM `subscriptions`) +
  (SELECT COUNT(*) FROM `subscription_items`) + (SELECT COUNT(*) FROM `subscription_orders`) +
  (SELECT COUNT(*) FROM `subscription_order_items`) + (SELECT COUNT(*) FROM `deliveries`) +
  (SELECT COUNT(*) FROM `subscription_events`) + (SELECT COUNT(*) FROM `campaign_attributions`);
INSERT INTO `_demo_load_guard` VALUES ('empty_target', @demo_existing_rows = 0);

START TRANSACTION;

INSERT INTO `products` (`id`,`name`,`description`,`active`) VALUES
(1,'[DEMO] Cafe Tarrazu','Bolsa ficticia de cafe de Tarrazu, 340 g',1),
(2,'[DEMO] Cafe Naranjo','Bolsa ficticia de cafe de Naranjo, 340 g',1),
(3,'[DEMO] Cafe Tres Rios','Bolsa ficticia de cafe de Tres Rios, 340 g',1),
(4,'[DEMO] Descafeinado','Bolsa ficticia de cafe descafeinado, 340 g',1),
(5,'[DEMO] Edicion estacional','Bolsa ficticia de microlote estacional, 340 g',1);

INSERT INTO `commercial_offers` (`id`,`name`,`description`,`selling_price_usd`,`active`) VALUES
(1,'[DEMO] Plan hogar esencial','Una bolsa mensual; supuesto sintetico',18.00,1),
(2,'[DEMO] Introduccion 30%','Precio de referencia previo al descuento sintetico',48.00,1),
(3,'[DEMO] Pack 3 bolsas','Referencia academica C: tres bolsas por USD 48',48.00,1),
(4,'[DEMO] Oficina pequena','Seis bolsas mensuales; supuesto sintetico',90.00,1),
(5,'[DEMO] Oficina mediana','Doce bolsas mensuales; supuesto sintetico',168.00,1);

INSERT INTO `offer_products` (`id`,`offer_id`,`product_id`,`quantity`) VALUES
(1,1,1,1),(2,1,2,1),(3,2,1,1),(4,2,2,1),(5,2,3,1),
(6,3,1,1),(7,3,2,1),(8,3,3,1),(9,4,1,3),(10,4,2,3),
(11,5,1,4),(12,5,2,4),(13,5,3,4);

INSERT INTO `product_variable_costs` (`id`,`product_id`,`cost_name`,`cost_usd`) VALUES
(1,1,'[DEMO] Cafe verde y tueste',6.20),(2,1,'[DEMO] Empaque',1.80),
(3,2,'[DEMO] Cafe verde y tueste',5.90),(4,2,'[DEMO] Empaque',1.80),
(5,3,'[DEMO] Cafe verde y tueste',6.50),(6,3,'[DEMO] Empaque',1.80),
(7,4,'[DEMO] Cafe y proceso',7.10),(8,4,'[DEMO] Empaque',1.80),
(9,5,'[DEMO] Microlote y tueste',8.40),(10,5,'[DEMO] Empaque',1.80);

INSERT INTO `order_variable_cost_assumptions`
(`id`,`name`,`shipping_cost_usd`,`payment_fee_percent`,`payment_fee_fixed_usd`,`other_cost_usd`) VALUES
(1,'[DEMO] Hogar local',5.00,0.0290,0.30,0.50),
(2,'[DEMO] Hogar nacional',7.00,0.0290,0.30,0.75),
(3,'[DEMO] Empresa ruta',8.00,0.0250,0.25,1.00),
(4,'[DEMO] Retiro',0.00,0.0290,0.30,0.25),
(5,'[DEMO] Prueba conservadora',9.00,0.0350,0.35,1.50);

INSERT INTO `financial_assumptions` (`id`,`name`,`monthly_fixed_cost_usd`,`projection_months`,`notes`) VALUES
(1,'[DEMO] Base 24 meses',4200.00,24,'Supuesto sintetico; no es dato real'),
(2,'[DEMO] Conservador 24 meses',5000.00,24,'Supuesto sintetico'),
(3,'[DEMO] Expansion 24 meses',6500.00,24,'Supuesto sintetico'),
(4,'[DEMO] Piloto 12 meses',3200.00,12,'Supuesto sintetico'),
(5,'[DEMO] Sensibilidad 36 meses',4500.00,36,'Supuesto sintetico');

-- Periodo legado ficticio separado del detalle comercial 2026.
INSERT INTO `advertising_acquisition_history`
(`id`,`period_start`,`period_end`,`channel`,`ad_spend_usd`,`acquired_customers`,`attributed_revenue_usd`) VALUES
(1,'2025-01-01','2025-01-31','[DEMO] Historico buscador',900.00,6,1600.00),
(2,'2025-02-01','2025-02-28','[DEMO] Historico social',1100.00,7,1900.00),
(3,'2025-03-01','2025-03-31','[DEMO] Historico correo',250.00,4,900.00),
(4,'2025-04-01','2025-04-30','[DEMO] Historico referidos',300.00,5,1100.00),
(5,'2025-05-01','2025-05-31','[DEMO] Historico buscador',1200.00,8,2200.00),
(6,'2025-06-01','2025-06-30','[DEMO] Historico social',1300.00,8,2300.00),
(7,'2025-07-01','2025-07-31','[DEMO] Historico contenido',400.00,5,1200.00),
(8,'2025-08-01','2025-08-31','[DEMO] Historico alianzas',500.00,6,1450.00),
(9,'2025-09-01','2025-09-30','[DEMO] Historico buscador',1000.00,7,2050.00),
(10,'2025-10-01','2025-10-31','[DEMO] Historico social',1150.00,7,2100.00);

INSERT INTO `subscription_parameters`
(`id`,`name`,`monthly_price_usd`,`monthly_churn_rate`,`monthly_variable_cost_usd`) VALUES
(1,'[DEMO] Hogar esencial',18.00,0.0600,8.00),
(2,'[DEMO] Intro 30%',33.60,0.0800,23.00),
(3,'[DEMO] Pack tres',48.00,0.0500,23.00),
(4,'[DEMO] Oficina pequena',90.00,0.0350,46.00),
(5,'[DEMO] Oficina mediana',168.00,0.0250,88.00);

INSERT INTO `commercial_scenarios`
(`id`,`name`,`description`,`offer_id`,`order_cost_assumption_id`,`monthly_ad_spend_usd`,`expected_cac_usd`,`active`) VALUES
(1,'[DEMO] A - Escenario actual','Referencia academica: publicidad mensual USD 8000',1,1,8000.00,NULL,1),
(2,'[DEMO] B - Con agencia','Referencia academica: publicidad USD 16000 y descuento introductorio 30%; honorarios no incluidos',2,2,16000.00,NULL,1),
(3,'[DEMO] C - Propuesta propia','Referencia academica: pack de 3 bolsas por USD 48 y publicidad USD 8000',3,1,8000.00,NULL,1),
(4,'[DEMO] Sensibilidad conservadora','Supuesto sintetico separado',4,3,6000.00,180.00,1),
(5,'[DEMO] Sensibilidad crecimiento','Supuesto sintetico separado',5,3,12000.00,150.00,1);

INSERT INTO `repurchase_patterns` (`id`,`name`,`month_number`,`repurchase_probability`)
SELECT 100 + (`p`.`n` * 20) + `m`.`n`, CONCAT('[DEMO] Patron ',`p`.`n`), `m`.`n`,
       ROUND(GREATEST(0.35, 0.98 - (`p`.`n` * 0.03) - ((`m`.`n` - 1) * 0.035)),4)
FROM (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) p
CROSS JOIN (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
            UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) m;

INSERT INTO `simulation_configs` (`id`,`name`,`financial_assumption_id`,`projection_months`) VALUES
(1,'[DEMO] Comparacion A-B-C',1,24),(2,'[DEMO] Conservadora',2,24),
(3,'[DEMO] Expansion',3,24),(4,'[DEMO] Piloto',4,12),(5,'[DEMO] Sensibilidad larga',5,36);

INSERT INTO `simulation_config_scenarios` (`id`,`simulation_config_id`,`scenario_id`) VALUES
(1,1,1),(2,1,2),(3,1,3),(4,2,1),(5,2,3),(6,2,4),(7,3,2),(8,3,3),
(9,3,5),(10,4,1),(11,4,2),(12,4,3),(13,5,3),(14,5,4),(15,5,5);

INSERT INTO `team_members` (`id`,`name`,`email`,`department`,`active`) VALUES
(1,'[DEMO] Ana Mercadeo','ana.mercadeo@example.invalid','marketing',1),
(2,'[DEMO] Bruno Contenido','bruno.contenido@example.invalid','marketing',1),
(3,'[DEMO] Carla Ventas','carla.ventas@example.invalid','sales',1),
(4,'[DEMO] Diego Operaciones','diego.operaciones@example.invalid','operations',1),
(5,'[DEMO] Elena Administracion','elena.admin@example.invalid','admin',1);

INSERT INTO `marketing_channels` (`id`,`code`,`name`,`channel_type`,`active`) VALUES
(1,'DEMO_SEARCH','[DEMO] Busqueda pagada','paid',1),
(2,'DEMO_SOCIAL','[DEMO] Redes sociales pagadas','paid',1),
(3,'DEMO_ORGANIC','[DEMO] Contenido organico','organic',1),
(4,'DEMO_REFERRAL','[DEMO] Referidos','referral',1),
(5,'DEMO_DIRECT','[DEMO] Contacto directo','direct',1);

INSERT INTO `customer_journey_stages` (`id`,`code`,`name`,`sort_order`) VALUES
(1,'DEMO_AWARE','[DEMO] Conciencia',1),(2,'DEMO_CONSIDER','[DEMO] Consideracion',2),
(3,'DEMO_DECIDE','[DEMO] Decision',3),(4,'DEMO_RETAIN','[DEMO] Retencion',4),
(5,'DEMO_ADVOCATE','[DEMO] Recomendacion',5);

INSERT INTO `sales_funnel_stages` (`id`,`code`,`name`,`sort_order`,`is_closed`) VALUES
(1,'DEMO_LEAD','[DEMO] Lead',1,0),(2,'DEMO_PROSPECT','[DEMO] Prospecto',2,0),
(3,'DEMO_OPPORTUNITY','[DEMO] Oportunidad',3,0),(4,'DEMO_WON','[DEMO] Cierre ganado',4,1),
(5,'DEMO_DISCARDED','[DEMO] Descartado',5,1);

INSERT INTO `subscription_plans`
(`id`,`name`,`customer_type`,`offer_id`,`subscription_parameters_id`,`delivery_interval`,`delivery_frequency_unit`,`active`) VALUES
(1,'[DEMO] Hogar mensual','individual',1,1,1,'month',1),
(2,'[DEMO] Hogar introductorio','individual',2,2,1,'month',1),
(3,'[DEMO] Pack mensual','both',3,3,1,'month',1),
(4,'[DEMO] Oficina quincenal','business',4,4,2,'week',1),
(5,'[DEMO] Oficina mensual','business',5,5,1,'month',1);

INSERT INTO `campaigns`
(`id`,`channel_id`,`name`,`objective`,`status`,`planned_budget_usd`,`start_date`,`end_date`) VALUES
(1,1,'[DEMO] Busqueda enero','Captacion hogar ficticia','completed',1000.00,'2026-01-01','2026-01-31'),
(2,2,'[DEMO] Social enero','Captacion plan introductorio','completed',2000.00,'2026-01-01','2026-01-31'),
(3,3,'[DEMO] Contenido enero','Captacion organica ficticia','completed',900.00,'2026-01-01','2026-01-31'),
(4,4,'[DEMO] Referidos enero','Referidos ficticios','completed',600.00,'2026-01-01','2026-01-31'),
(5,1,'[DEMO] Busqueda febrero','Captacion pack ficticia','completed',900.00,'2026-02-01','2026-02-28'),
(6,2,'[DEMO] Social febrero','Captacion empresa ficticia','completed',1200.00,'2026-02-01','2026-02-28'),
(7,3,'[DEMO] Contenido febrero','Educacion ficticia','completed',500.00,'2026-02-01','2026-02-28'),
(8,5,'[DEMO] Contacto empresas','Prospeccion directa ficticia','completed',400.00,'2026-02-01','2026-02-28'),
(9,1,'[DEMO] Busqueda marzo','Renovacion ficticia','completed',800.00,'2026-03-01','2026-03-31'),
(10,2,'[DEMO] Social marzo','Captacion hogar ficticia','completed',1000.00,'2026-03-01','2026-03-31');

INSERT INTO `campaign_daily_metrics`
(`id`,`campaign_id`,`metric_date`,`ad_spend_usd`,`other_marketing_cost_usd`,`impressions`,`clicks`) VALUES
(1,1,'2026-01-05',250,20,12000,360),(2,1,'2026-01-12',260,20,12500,375),(3,1,'2026-01-19',290,20,13500,405),
(4,2,'2026-01-05',500,40,26000,520),(5,2,'2026-01-12',520,40,27000,540),(6,2,'2026-01-19',580,40,29000,580),
(7,3,'2026-01-06',240,15,18000,450),(8,3,'2026-01-13',260,15,19000,475),(9,3,'2026-01-20',300,15,21000,525),
(10,4,'2026-01-07',150,10,5000,250),(11,4,'2026-01-14',160,10,5200,260),(12,4,'2026-01-21',190,10,5800,290),
(13,5,'2026-02-04',210,20,10500,315),(14,5,'2026-02-11',230,20,11500,345),(15,5,'2026-02-18',260,20,13000,390),
(16,6,'2026-02-05',270,30,14000,280),(17,6,'2026-02-12',300,30,15000,300),(18,6,'2026-02-19',330,30,16000,320),
(19,7,'2026-02-06',110,10,9000,270),(20,7,'2026-02-13',130,10,10000,300),(21,7,'2026-02-20',160,10,11000,330),
(22,8,'2026-02-07',80,10,1200,120),(23,8,'2026-02-14',100,10,1400,140),(24,8,'2026-02-21',120,10,1600,160),
(25,9,'2026-03-05',180,15,9000,270),(26,9,'2026-03-12',200,15,10000,300),(27,9,'2026-03-19',220,15,11000,330),
(28,10,'2026-03-06',220,25,12000,300),(29,10,'2026-03-13',250,25,13000,325),(30,10,'2026-03-20',280,25,15000,375);

INSERT INTO `contacts`
(`id`,`customer_type`,`first_name`,`last_name`,`company_name`,`email`,`phone`) VALUES
(1,'individual','[DEMO] Sofia','Alfaro',NULL,'sofia.alfaro@example.invalid','+506-0000-0001'),
(2,'individual','[DEMO] Mateo','Brenes',NULL,'mateo.brenes@example.invalid','+506-0000-0002'),
(3,'individual','[DEMO] Valeria','Castro',NULL,'valeria.castro@example.invalid','+506-0000-0003'),
(4,'individual','[DEMO] Daniel','Diaz',NULL,'daniel.diaz@example.invalid','+506-0000-0004'),
(5,'individual','[DEMO] Emma','Esquivel',NULL,'emma.esquivel@example.invalid','+506-0000-0005'),
(6,'individual','[DEMO] Felipe','Flores',NULL,'felipe.flores@example.invalid','+506-0000-0006'),
(7,'business','[DEMO] Gabriela','Gerente','[DEMO] Nube Norte SRL','gabriela@nube.example.invalid','+506-0000-0007'),
(8,'business','[DEMO] Hugo','Herrera','[DEMO] Estudio Horizonte SA','hugo@horizonte.example.invalid','+506-0000-0008'),
(9,'business','[DEMO] Irene','Ibarra','[DEMO] Taller Indigo SRL','irene@indigo.example.invalid','+506-0000-0009'),
(10,'business','[DEMO] Jorge','Jimenez','[DEMO] Laboratorio Jade SA','jorge@jade.example.invalid','+506-0000-0010'),
(11,'individual','[DEMO] Karla','Leon',NULL,'karla.leon@example.invalid','+506-0000-0011'),
(12,'business','[DEMO] Luis','Mora','[DEMO] Mercado Limon SRL','luis@limon.example.invalid','+506-0000-0012');

INSERT INTO `customer_touchpoints`
(`id`,`contact_id`,`journey_stage_id`,`campaign_id`,`channel_id`,`touchpoint_type`,`occurred_at`,`notes`) VALUES
(1,1,1,1,NULL,'click','2026-01-05 09:00:00','[DEMO] Clic inicial'),(2,1,2,1,NULL,'form','2026-01-06 10:00:00','[DEMO] Formulario'),(3,1,3,1,NULL,'purchase','2026-01-12 12:00:00','[DEMO] Decision'),
(4,2,1,2,NULL,'impression','2026-01-05 10:00:00','[DEMO] Impresion'),(5,2,2,2,NULL,'click','2026-01-07 11:00:00','[DEMO] Clic'),(6,2,3,2,NULL,'purchase','2026-01-15 13:00:00','[DEMO] Decision'),
(7,3,1,3,NULL,'visit','2026-01-06 09:30:00','[DEMO] Visita'),(8,3,2,3,NULL,'email','2026-01-09 14:00:00','[DEMO] Correo'),(9,3,3,3,NULL,'purchase','2026-01-18 15:00:00','[DEMO] Decision'),
(10,4,1,4,NULL,'visit','2026-01-07 08:00:00','[DEMO] Referido'),(11,4,2,4,NULL,'call','2026-01-10 10:00:00','[DEMO] Llamada'),(12,4,3,4,NULL,'purchase','2026-01-20 16:00:00','[DEMO] Decision'),
(13,5,1,5,NULL,'click','2026-02-04 09:00:00','[DEMO] Clic'),(14,5,2,5,NULL,'form','2026-02-06 10:00:00','[DEMO] Formulario'),(15,5,3,5,NULL,'purchase','2026-02-16 12:00:00','[DEMO] Decision'),
(16,6,1,6,NULL,'impression','2026-02-05 09:00:00','[DEMO] Impresion'),(17,6,2,6,NULL,'meeting','2026-02-08 11:00:00','[DEMO] Reunion'),(18,6,3,6,NULL,'purchase','2026-02-20 12:00:00','[DEMO] Decision'),
(19,7,1,7,NULL,'visit','2026-02-06 09:00:00','[DEMO] Visita'),(20,7,2,7,NULL,'email','2026-02-09 10:00:00','[DEMO] Correo'),(21,7,3,7,NULL,'purchase','2026-02-22 12:00:00','[DEMO] Decision'),
(22,8,1,8,NULL,'call','2026-02-07 09:00:00','[DEMO] Contacto'),(23,8,2,8,NULL,'meeting','2026-02-10 10:00:00','[DEMO] Reunion'),(24,8,3,8,NULL,'purchase','2026-02-24 12:00:00','[DEMO] Decision'),
(25,9,1,9,NULL,'click','2026-03-05 09:00:00','[DEMO] Clic'),(26,9,2,9,NULL,'form','2026-03-08 10:00:00','[DEMO] Formulario'),(27,9,3,9,NULL,'purchase','2026-03-22 12:00:00','[DEMO] Decision'),
(28,10,1,10,NULL,'click','2026-03-06 09:00:00','[DEMO] Clic'),(29,10,2,10,NULL,'call','2026-03-09 10:00:00','[DEMO] Llamada'),(30,10,3,10,NULL,'purchase','2026-03-24 12:00:00','[DEMO] Decision'),
(31,11,1,NULL,3,'visit','2026-03-10 09:00:00','[DEMO] Organico'),(32,12,1,NULL,5,'call','2026-03-11 09:00:00','[DEMO] Directo');

INSERT INTO `leads`
(`id`,`contact_id`,`source_campaign_id`,`source_channel_id`,`marketing_owner_id`,`lead_status`,`created_at`) VALUES
(1,1,1,NULL,1,'converted','2026-01-06 10:00:00'),(2,2,2,NULL,1,'converted','2026-01-07 11:00:00'),
(3,3,3,NULL,2,'converted','2026-01-09 14:00:00'),(4,4,4,NULL,1,'converted','2026-01-10 10:00:00'),
(5,5,5,NULL,1,'converted','2026-02-06 10:00:00'),(6,6,6,NULL,2,'converted','2026-02-08 11:00:00'),
(7,7,7,NULL,2,'converted','2026-02-09 10:00:00'),(8,8,8,NULL,1,'converted','2026-02-10 10:00:00'),
(9,9,9,NULL,1,'converted','2026-03-08 10:00:00'),(10,10,10,NULL,2,'converted','2026-03-09 10:00:00'),
(11,11,NULL,3,2,'disqualified','2026-03-10 09:00:00'),(12,12,NULL,5,1,'open','2026-03-11 09:00:00');

-- Cuatro etapas para cada lead convertido; una sola etapa final queda abierta.
INSERT INTO `lead_stage_history` (`lead_id`,`stage_id`,`changed_by_id`,`entered_at`,`exited_at`)
SELECT l.id,1,l.marketing_owner_id,l.created_at,DATE_ADD(l.created_at,INTERVAL 2 DAY) FROM leads l WHERE l.id<=10
UNION ALL SELECT l.id,2,l.marketing_owner_id,DATE_ADD(l.created_at,INTERVAL 2 DAY),DATE_ADD(l.created_at,INTERVAL 5 DAY) FROM leads l WHERE l.id<=10
UNION ALL SELECT l.id,3,3,DATE_ADD(l.created_at,INTERVAL 5 DAY),DATE_ADD(l.created_at,INTERVAL 10 DAY) FROM leads l WHERE l.id<=10
UNION ALL SELECT l.id,4,3,DATE_ADD(l.created_at,INTERVAL 10 DAY),NULL FROM leads l WHERE l.id<=10;
INSERT INTO `lead_stage_history` (`lead_id`,`stage_id`,`changed_by_id`,`entered_at`,`exited_at`) VALUES
(11,1,2,'2026-03-10 09:00:00','2026-03-12 09:00:00'),(11,5,2,'2026-03-12 09:00:00',NULL),
(12,1,1,'2026-03-11 09:00:00',NULL);

INSERT INTO `sales_opportunities`
(`id`,`lead_id`,`sales_owner_id`,`status`,`expected_value_usd`,`won_value_usd`,`opened_at`,`closed_at`) VALUES
(1,1,3,'won',54,54,'2026-01-11 10:00:00','2026-01-16 10:00:00'),(2,2,3,'won',100,96,'2026-01-12 11:00:00','2026-01-17 11:00:00'),
(3,3,3,'won',144,144,'2026-01-14 14:00:00','2026-01-19 14:00:00'),(4,4,3,'won',54,54,'2026-01-15 10:00:00','2026-01-20 10:00:00'),
(5,5,3,'won',144,144,'2026-02-11 10:00:00','2026-02-16 10:00:00'),(6,6,3,'won',270,270,'2026-02-13 11:00:00','2026-02-18 11:00:00'),
(7,7,3,'won',270,270,'2026-02-14 10:00:00','2026-02-19 10:00:00'),(8,8,3,'won',504,504,'2026-02-15 10:00:00','2026-02-20 10:00:00'),
(9,9,3,'won',144,144,'2026-03-13 10:00:00','2026-03-18 10:00:00'),(10,10,3,'won',504,504,'2026-03-14 10:00:00','2026-03-19 10:00:00'),
(11,11,3,'lost',90,NULL,'2026-03-10 12:00:00','2026-03-12 12:00:00'),(12,12,3,'open',168,NULL,'2026-03-15 09:00:00',NULL);

INSERT INTO `content_items`
(`id`,`campaign_id`,`author_id`,`title`,`content_type`,`body_text`,`scheduled_at`,`published_at`,`status`) VALUES
(1,1,2,'[DEMO] Guia de origen','article','Contenido ficticio','2026-01-03 08:00:00','2026-01-03 08:05:00','published'),
(2,2,2,'[DEMO] Anuncio introductorio','ad','Contenido ficticio','2026-01-04 08:00:00','2026-01-04 08:05:00','published'),
(3,3,2,'[DEMO] Preparacion en casa','post','Contenido ficticio','2026-01-05 08:00:00','2026-01-05 08:05:00','published'),
(4,4,1,'[DEMO] Correo de referidos','email','Contenido ficticio','2026-01-06 08:00:00','2026-01-06 08:05:00','published'),
(5,5,2,'[DEMO] Pagina pack','landing_page','Contenido ficticio','2026-02-02 08:00:00','2026-02-02 08:05:00','published'),
(6,6,1,'[DEMO] Cafe en oficina','ad','Contenido ficticio','2026-02-03 08:00:00','2026-02-03 08:05:00','published'),
(7,7,2,'[DEMO] Historia del productor','article','Contenido ficticio','2026-02-04 08:00:00',NULL,'approved'),
(8,8,1,'[DEMO] Correo empresarial','email','Contenido ficticio','2026-02-05 08:00:00',NULL,'in_review'),
(9,9,2,'[DEMO] Renovacion mensual','post','Contenido ficticio','2026-03-02 08:00:00',NULL,'rejected'),
(10,10,2,'[DEMO] Prueba social','ad','Contenido ficticio','2026-03-03 08:00:00',NULL,'draft');

INSERT INTO `content_channels` (`content_id`,`channel_id`) VALUES
(1,3),(1,1),(2,2),(3,3),(4,4),(5,1),(5,3),(6,2),(7,3),(8,5),(9,1),(10,2);

INSERT INTO `content_reviews` (`id`,`content_id`,`reviewer_id`,`action`,`comment`,`reviewed_at`) VALUES
(1,1,5,'submitted',NULL,'2026-01-02 09:00:00'),(2,1,5,'approved','[DEMO] Aprobado','2026-01-02 12:00:00'),
(3,2,5,'submitted',NULL,'2026-01-03 09:00:00'),(4,2,5,'approved','[DEMO] Aprobado','2026-01-03 12:00:00'),
(5,3,5,'approved','[DEMO] Aprobado','2026-01-04 12:00:00'),(6,4,5,'approved','[DEMO] Aprobado','2026-01-05 12:00:00'),
(7,5,5,'approved','[DEMO] Aprobado','2026-02-01 12:00:00'),(8,6,5,'approved','[DEMO] Aprobado','2026-02-02 12:00:00'),
(9,7,5,'approved','[DEMO] Aprobado para programar','2026-02-03 12:00:00'),(10,8,5,'submitted',NULL,'2026-02-04 12:00:00'),
(11,9,5,'rejected','[DEMO] Ajustar afirmaciones','2026-03-01 12:00:00'),(12,10,5,'changes_requested','[DEMO] Completar llamado a la accion','2026-03-02 12:00:00');

INSERT INTO `marketing_sales_handoffs`
(`id`,`lead_id`,`attempt_number`,`marketing_owner_id`,`sales_owner_id`,`delivered_at`,`decision`,`decided_at`,`rejection_reason`) VALUES
(1,1,1,1,3,'2026-01-11 09:00:00','accepted','2026-01-11 11:00:00',NULL),(2,2,1,1,3,'2026-01-12 09:00:00','accepted','2026-01-12 12:00:00',NULL),
(3,3,1,2,3,'2026-01-14 09:00:00','accepted','2026-01-14 13:00:00',NULL),(4,4,1,1,3,'2026-01-15 09:00:00','accepted','2026-01-15 14:00:00',NULL),
(5,5,1,1,3,'2026-02-11 09:00:00','accepted','2026-02-11 11:00:00',NULL),(6,6,1,2,3,'2026-02-13 09:00:00','accepted','2026-02-13 12:00:00',NULL),
(7,7,1,2,3,'2026-02-14 09:00:00','accepted','2026-02-14 13:00:00',NULL),(8,8,1,1,3,'2026-02-15 09:00:00','accepted','2026-02-15 11:00:00',NULL),
(9,9,1,1,3,'2026-03-13 09:00:00','accepted','2026-03-13 12:00:00',NULL),(10,10,1,2,3,'2026-03-14 09:00:00','accepted','2026-03-14 13:00:00',NULL),
(11,11,1,2,3,'2026-03-11 09:00:00','rejected','2026-03-11 15:00:00','[DEMO] Sin ajuste al perfil'),
(12,12,1,1,3,'2026-03-15 09:00:00','pending',NULL,NULL);

INSERT INTO `handoff_followups` (`id`,`handoff_id`,`responsible_id`,`followed_up_at`,`note`) VALUES
(1,1,3,'2026-01-12 09:00:00','[DEMO] Seguimiento'),(2,2,3,'2026-01-13 09:00:00','[DEMO] Seguimiento'),
(3,3,3,'2026-01-15 09:00:00','[DEMO] Seguimiento'),(4,4,3,'2026-01-16 09:00:00','[DEMO] Seguimiento'),
(5,5,3,'2026-02-12 09:00:00','[DEMO] Seguimiento'),(6,6,3,'2026-02-14 09:00:00','[DEMO] Seguimiento'),
(7,7,3,'2026-02-15 09:00:00','[DEMO] Seguimiento'),(8,8,3,'2026-02-16 09:00:00','[DEMO] Seguimiento'),
(9,9,3,'2026-03-14 09:00:00','[DEMO] Seguimiento'),(10,10,3,'2026-03-15 09:00:00','[DEMO] Seguimiento'),
(11,11,2,'2026-03-12 09:00:00','[DEMO] Nutricion futura'),(12,12,3,'2026-03-16 09:00:00','[DEMO] Pendiente de decision');

INSERT INTO `subscriptions`
(`id`,`contact_id`,`plan_id`,`source_lead_id`,`status`,`started_on`,`ended_on`,`cancelled_on`) VALUES
(1,1,1,1,'active','2026-01-16',NULL,NULL),(2,2,2,2,'active','2026-01-17',NULL,NULL),
(3,3,3,3,'active','2026-01-19',NULL,NULL),(4,4,1,4,'active','2026-01-20',NULL,NULL),
(5,5,3,5,'active','2026-02-16',NULL,NULL),(6,6,3,6,'paused','2026-02-18',NULL,NULL),
(7,7,4,7,'active','2026-02-19',NULL,NULL),(8,8,5,8,'active','2026-02-20',NULL,NULL),
(9,9,4,9,'cancelled','2026-03-18','2026-04-30','2026-04-30'),(10,10,5,10,'active','2026-03-19',NULL,NULL);

INSERT INTO `subscription_items` (`subscription_id`,`product_id`,`quantity`) VALUES
(1,1,1),(2,1,1),(2,2,1),(3,1,1),(3,2,1),(3,3,1),(4,2,1),(5,1,1),(5,3,2),
(6,2,1),(6,3,2),(7,1,3),(7,2,3),(8,1,6),(8,3,6),(9,2,6),(10,1,6),(10,2,6);

INSERT INTO `subscription_orders`
(`id`,`subscription_id`,`order_number`,`service_period_start`,`service_period_end`,`status`,`ordered_at`,`paid_at`,`subtotal_usd`,`discount_usd`,`shipping_usd`,`tax_usd`,`total_usd`) VALUES
(1,1,'DEMO-0001','2026-01-16','2026-02-15','delivered','2026-01-16 08:00:00','2026-01-16 08:05:00',48,0,5,0,53),
(2,2,'DEMO-0002','2026-01-17','2026-02-16','delivered','2026-01-17 08:00:00','2026-01-17 08:05:00',48,14.40,5,0,38.60),
(3,3,'DEMO-0003','2026-01-19','2026-02-18','delivered','2026-01-19 08:00:00','2026-01-19 08:05:00',48,0,5,0,53),
(4,4,'DEMO-0004','2026-01-20','2026-02-19','delivered','2026-01-20 08:00:00','2026-01-20 08:05:00',48,0,5,0,53),
(5,5,'DEMO-0005','2026-02-16','2026-03-15','delivered','2026-02-16 08:00:00','2026-02-16 08:05:00',48,0,5,0,53),
(6,6,'DEMO-0006','2026-02-18','2026-03-17','delivered','2026-02-18 08:00:00','2026-02-18 08:05:00',48,0,5,0,53),
(7,7,'DEMO-0007','2026-02-19','2026-03-18','delivered','2026-02-19 08:00:00','2026-02-19 08:05:00',48,0,5,0,53),
(8,8,'DEMO-0008','2026-02-20','2026-03-19','delivered','2026-02-20 08:00:00','2026-02-20 08:05:00',48,0,5,0,53),
(9,9,'DEMO-0009','2026-03-18','2026-04-17','delivered','2026-03-18 08:00:00','2026-03-18 08:05:00',48,0,5,0,53),
(10,10,'DEMO-0010','2026-03-19','2026-04-18','delivered','2026-03-19 08:00:00','2026-03-19 08:05:00',48,0,5,0,53),
(11,1,'DEMO-0011','2026-02-16','2026-03-15','delivered','2026-02-16 08:00:00','2026-02-16 08:05:00',48,0,5,0,53),
(12,2,'DEMO-0012','2026-02-17','2026-03-16','delivered','2026-02-17 08:00:00','2026-02-17 08:05:00',48,14.40,5,0,38.60),
(13,3,'DEMO-0013','2026-02-19','2026-03-18','delivered','2026-02-19 08:00:00','2026-02-19 08:05:00',48,0,5,0,53),
(14,4,'DEMO-0014','2026-02-20','2026-03-19','delivered','2026-02-20 08:00:00','2026-02-20 08:05:00',48,0,5,0,53),
(15,5,'DEMO-0015','2026-03-16','2026-04-15','delivered','2026-03-16 08:00:00','2026-03-16 08:05:00',48,0,5,0,53),
(16,6,'DEMO-0016','2026-03-18','2026-04-17','delivered','2026-03-18 08:00:00','2026-03-18 08:05:00',48,0,5,0,53),
(17,7,'DEMO-0017','2026-03-19','2026-04-18','delivered','2026-03-19 08:00:00','2026-03-19 08:05:00',48,0,5,0,53),
(18,8,'DEMO-0018','2026-03-20','2026-04-19','delivered','2026-03-20 08:00:00','2026-03-20 08:05:00',48,0,5,0,53),
(19,9,'DEMO-0019','2026-04-18','2026-05-17','cancelled','2026-04-18 08:00:00',NULL,48,0,5,0,53),
(20,10,'DEMO-0020','2026-04-19','2026-05-18','delivered','2026-04-19 08:00:00','2026-04-19 08:05:00',48,0,5,0,53),
(21,1,'DEMO-0021','2026-03-16','2026-04-15','paid','2026-03-16 08:00:00','2026-03-16 08:05:00',48,0,5,0,53),
(22,2,'DEMO-0022','2026-03-17','2026-04-16','processing','2026-03-17 08:00:00','2026-03-17 08:05:00',48,14.40,5,0,38.60),
(23,3,'DEMO-0023','2026-03-19','2026-04-18','refunded','2026-03-19 08:00:00','2026-03-19 08:05:00',48,0,5,0,53),
(24,4,'DEMO-0024','2026-03-20','2026-04-19','delivered','2026-03-20 08:00:00','2026-03-20 08:05:00',48,0,5,0,53);

INSERT INTO `subscription_order_items`
(`order_id`,`product_id`,`quantity`,`unit_price_usd`,`unit_cost_usd`)
SELECT o.id,1,1,16.0000,8.0000 FROM subscription_orders o WHERE o.id<=12
UNION ALL SELECT o.id,2,2,16.0000,7.7000 FROM subscription_orders o WHERE o.id<=12
UNION ALL SELECT o.id,1,3,16.0000,8.0000 FROM subscription_orders o WHERE o.id>12;

INSERT INTO `deliveries` (`id`,`order_id`,`scheduled_for`,`delivered_at`,`status`,`tracking_reference`)
SELECT o.id,o.id,DATE_ADD(DATE(o.ordered_at),INTERVAL 3 DAY),
       CASE WHEN o.status IN ('delivered','refunded') THEN DATE_ADD(o.ordered_at,INTERVAL 4 DAY) ELSE NULL END,
       CASE WHEN o.status='delivered' THEN 'delivered' WHEN o.status='cancelled' THEN 'cancelled'
            WHEN o.status='refunded' THEN 'failed' WHEN o.status='processing' THEN 'in_transit' ELSE 'scheduled' END,
       CONCAT('DEMO-TRACK-',LPAD(o.id,4,'0'))
FROM subscription_orders o;

INSERT INTO `subscription_events`
(`id`,`subscription_id`,`event_type`,`previous_plan_id`,`new_plan_id`,`occurred_at`,`reason`) VALUES
(1,1,'activated',NULL,NULL,'2026-01-16 08:00:00',NULL),(2,2,'activated',NULL,NULL,'2026-01-17 08:00:00',NULL),
(3,3,'activated',NULL,NULL,'2026-01-19 08:00:00',NULL),(4,4,'activated',NULL,NULL,'2026-01-20 08:00:00',NULL),
(5,5,'activated',NULL,NULL,'2026-02-16 08:00:00',NULL),(6,6,'activated',NULL,NULL,'2026-02-18 08:00:00',NULL),
(7,7,'activated',NULL,NULL,'2026-02-19 08:00:00',NULL),(8,8,'activated',NULL,NULL,'2026-02-20 08:00:00',NULL),
(9,9,'activated',NULL,NULL,'2026-03-18 08:00:00',NULL),(10,10,'activated',NULL,NULL,'2026-03-19 08:00:00',NULL),
(11,1,'renewed',NULL,NULL,'2026-02-16 08:00:00',NULL),(12,2,'renewed',NULL,NULL,'2026-02-17 08:00:00',NULL),
(13,6,'paused',NULL,NULL,'2026-04-01 08:00:00',NULL),(14,9,'cancelled',NULL,NULL,'2026-04-30 08:00:00','[DEMO] Cambio de necesidad'),
(15,5,'plan_changed',3,1,'2026-04-01 08:00:00','[DEMO] Ajuste de preferencia');

INSERT INTO `campaign_attributions`
(`id`,`campaign_id`,`lead_id`,`subscription_id`,`attribution_model`,`attributed_at`) VALUES
(1,1,1,1,'last_touch','2026-01-16 10:00:00'),(2,2,2,2,'last_touch','2026-01-17 11:00:00'),
(3,3,3,3,'last_touch','2026-01-19 14:00:00'),(4,4,4,4,'last_touch','2026-01-20 10:00:00'),
(5,5,5,5,'last_touch','2026-02-16 10:00:00'),(6,6,6,6,'last_touch','2026-02-18 11:00:00'),
(7,7,7,7,'last_touch','2026-02-19 10:00:00'),(8,8,8,8,'last_touch','2026-02-20 10:00:00'),
(9,9,9,9,'last_touch','2026-03-18 10:00:00'),(10,10,10,10,'last_touch','2026-03-19 10:00:00');

-- Validaciones bloqueantes previas al COMMIT.
INSERT INTO `_demo_load_guard` VALUES
('36_tables_present',(SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_type='BASE TABLE')=36),
('catalog_minimums',(SELECT COUNT(*) FROM products)>=5 AND (SELECT COUNT(*) FROM commercial_offers)>=5 AND (SELECT COUNT(*) FROM team_members)>=5 AND (SELECT COUNT(*) FROM marketing_channels)>=5 AND (SELECT COUNT(*) FROM customer_journey_stages)>=5 AND (SELECT COUNT(*) FROM sales_funnel_stages)>=5 AND (SELECT COUNT(*) FROM subscription_plans)>=5),
('movement_minimums',(SELECT COUNT(*) FROM campaigns)>=10 AND (SELECT COUNT(*) FROM campaign_daily_metrics)>=30 AND (SELECT COUNT(*) FROM leads)>=10 AND (SELECT COUNT(*) FROM lead_stage_history)>=30 AND (SELECT COUNT(*) FROM subscriptions)>=10 AND (SELECT COUNT(*) FROM subscription_orders)>=24),
('impressions_vs_clicks',(SELECT COUNT(*) FROM campaign_daily_metrics WHERE clicks>impressions)=0),
('campaign_dates',(SELECT COUNT(*) FROM campaigns WHERE end_date<start_date)=0),
('one_open_stage',(SELECT COUNT(*) FROM (SELECT lead_id FROM lead_stage_history WHERE exited_at IS NULL GROUP BY lead_id HAVING COUNT(*)>1) x)=0),
('opportunity_dates',(SELECT COUNT(*) FROM sales_opportunities WHERE closed_at<opened_at)=0),
('handoff_resolution',(SELECT COUNT(*) FROM marketing_sales_handoffs WHERE (decision='rejected' AND (rejection_reason IS NULL OR TRIM(rejection_reason)='')) OR (decision='accepted' AND decided_at IS NULL))=0),
('content_publication',(SELECT COUNT(*) FROM content_items WHERE (status='published')<>(published_at IS NOT NULL))=0),
('order_totals',(SELECT COUNT(*) FROM subscription_orders WHERE total_usd<>subtotal_usd-discount_usd+shipping_usd+tax_usd)=0),
('order_item_subtotals',(SELECT COUNT(*) FROM subscription_orders o JOIN (SELECT order_id,SUM(quantity*unit_price_usd) subtotal FROM subscription_order_items GROUP BY order_id) i ON i.order_id=o.id WHERE o.subtotal_usd<>i.subtotal)=0),
('unique_attribution_lead',(SELECT COUNT(*) FROM (SELECT lead_id FROM campaign_attributions GROUP BY lead_id HAVING COUNT(*)>1) x)=0),
('unique_attribution_subscription',(SELECT COUNT(*) FROM (SELECT subscription_id FROM campaign_attributions GROUP BY subscription_id HAVING COUNT(*)>1) x)=0),
('converted_leads_have_subscription',(SELECT COUNT(*) FROM leads l LEFT JOIN subscriptions s ON s.source_lead_id=l.id WHERE l.lead_status='converted' AND s.id IS NULL)=0),
('demo_identity',(SELECT COUNT(*) FROM contacts WHERE email NOT LIKE '%example.invalid')=0);

COMMIT;

-- Resultados de control para el cliente SQL.
SELECT `table_name`,`table_rows`
FROM `information_schema`.`tables`
WHERE `table_schema`=DATABASE() AND `table_type`='BASE TABLE'
ORDER BY `table_name`;
SELECT `check_name`,`ok` FROM `_demo_load_guard` ORDER BY `check_name`;

