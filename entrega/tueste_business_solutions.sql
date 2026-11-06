-- Primer Postejercicio — Business Solutions: Mercadeo comercial en una empresa de servicios.
-- Tueste Analytics: DDL + DML DEMO + consultas académicas.
-- Base exclusiva de entrega. Falla si ya existe y no contiene credenciales.
-- Los 514 registros son ficticios y no representan resultados reales de Tueste.

CREATE DATABASE `tueste_business_solutions_entrega`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `tueste_business_solutions_entrega`;

-- ============================================================
-- 1. DDL: 12 tablas financieras originales
-- ============================================================
CREATE TABLE `advertising_acquisition_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `channel` varchar(100) NOT NULL,
  `ad_spend_usd` decimal(12,2) NOT NULL,
  `acquired_customers` int NOT NULL,
  `attributed_revenue_usd` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `commercial_offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` text,
  `selling_price_usd` decimal(10,2) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `order_variable_cost_assumptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `shipping_cost_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_fee_percent` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `payment_fee_fixed_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `other_cost_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `financial_assumptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `monthly_fixed_cost_usd` decimal(12,2) NOT NULL DEFAULT '0.00',
  `projection_months` int NOT NULL DEFAULT '12',
  `notes` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` text,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `repurchase_patterns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `month_number` int NOT NULL,
  `repurchase_probability` decimal(7,4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`,`month_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `subscription_parameters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `monthly_price_usd` decimal(10,2) NOT NULL,
  `monthly_churn_rate` decimal(7,4) NOT NULL,
  `monthly_variable_cost_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `offer_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `offer_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `offer_id` (`offer_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `offer_products_ibfk_1` FOREIGN KEY (`offer_id`) REFERENCES `commercial_offers` (`id`),
  CONSTRAINT `offer_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `product_variable_costs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `cost_name` varchar(150) NOT NULL,
  `cost_usd` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_variable_costs_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `commercial_scenarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` text,
  `offer_id` int NOT NULL,
  `order_cost_assumption_id` int DEFAULT NULL,
  `monthly_ad_spend_usd` decimal(12,2) NOT NULL,
  `expected_cac_usd` decimal(10,2) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `offer_id` (`offer_id`),
  KEY `order_cost_assumption_id` (`order_cost_assumption_id`),
  CONSTRAINT `commercial_scenarios_ibfk_1` FOREIGN KEY (`offer_id`) REFERENCES `commercial_offers` (`id`),
  CONSTRAINT `commercial_scenarios_ibfk_2` FOREIGN KEY (`order_cost_assumption_id`) REFERENCES `order_variable_cost_assumptions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `simulation_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `financial_assumption_id` int DEFAULT NULL,
  `projection_months` int NOT NULL DEFAULT '24',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `financial_assumption_id` (`financial_assumption_id`),
  CONSTRAINT `simulation_configs_ibfk_1` FOREIGN KEY (`financial_assumption_id`) REFERENCES `financial_assumptions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `simulation_config_scenarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `simulation_config_id` int NOT NULL,
  `scenario_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `simulation_config_id` (`simulation_config_id`,`scenario_id`),
  KEY `scenario_id` (`scenario_id`),
  CONSTRAINT `simulation_config_scenarios_ibfk_1` FOREIGN KEY (`simulation_config_id`) REFERENCES `simulation_configs` (`id`),
  CONSTRAINT `simulation_config_scenarios_ibfk_2` FOREIGN KEY (`scenario_id`) REFERENCES `commercial_scenarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 2. DDL: 24 tablas comerciales
-- ============================================================
CREATE TABLE `team_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `department` varchar(20) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_team_members_email` (`email`),
  CONSTRAINT `chk_team_members_department` CHECK (`department` IN ('marketing','sales','operations','admin')),
  CONSTRAINT `chk_team_members_active` CHECK (`active` IN (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `marketing_channels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(120) NOT NULL,
  `channel_type` varchar(20) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_marketing_channels_code` (`code`),
  UNIQUE KEY `uk_marketing_channels_name` (`name`),
  CONSTRAINT `chk_marketing_channels_type` CHECK (`channel_type` IN ('organic','paid','referral','direct')),
  CONSTRAINT `chk_marketing_channels_active` CHECK (`active` IN (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `campaigns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `channel_id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `objective` varchar(250) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'draft',
  `planned_budget_usd` decimal(12,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaigns_name_period` (`name`,`start_date`),
  KEY `ix_campaigns_channel_period` (`channel_id`,`start_date`,`end_date`),
  CONSTRAINT `fk_campaigns_channel` FOREIGN KEY (`channel_id`) REFERENCES `marketing_channels` (`id`),
  CONSTRAINT `chk_campaigns_status` CHECK (`status` IN ('draft','planned','active','paused','completed','cancelled')),
  CONSTRAINT `chk_campaigns_budget` CHECK (`planned_budget_usd` >= 0),
  CONSTRAINT `chk_campaigns_dates` CHECK (`end_date` >= `start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `campaign_daily_metrics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `campaign_id` int NOT NULL,
  `metric_date` date NOT NULL,
  `ad_spend_usd` decimal(12,2) NOT NULL DEFAULT 0,
  `other_marketing_cost_usd` decimal(12,2) NOT NULL DEFAULT 0,
  `impressions` bigint unsigned NOT NULL DEFAULT 0,
  `clicks` bigint unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaign_daily_metrics` (`campaign_id`,`metric_date`),
  KEY `ix_campaign_metrics_date` (`metric_date`),
  CONSTRAINT `fk_campaign_metrics_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`),
  CONSTRAINT `chk_campaign_metrics_costs` CHECK (`ad_spend_usd` >= 0 AND `other_marketing_cost_usd` >= 0),
  CONSTRAINT `chk_campaign_metrics_clicks` CHECK (`clicks` <= `impressions`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_type` varchar(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `company_name` varchar(180) DEFAULT NULL,
  `email` varchar(254) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_contacts_email` (`email`),
  KEY `ix_contacts_type_name` (`customer_type`,`last_name`,`first_name`),
  CONSTRAINT `chk_contacts_type` CHECK (`customer_type` IN ('individual','business')),
  CONSTRAINT `chk_contacts_company` CHECK (
    (`customer_type` = 'business' AND `company_name` IS NOT NULL AND CHAR_LENGTH(TRIM(`company_name`)) > 0)
    OR (`customer_type` = 'individual' AND `company_name` IS NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `customer_journey_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(40) NOT NULL,
  `name` varchar(100) NOT NULL,
  `sort_order` smallint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_journey_stages_code` (`code`),
  UNIQUE KEY `uk_journey_stages_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `customer_touchpoints` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contact_id` int NOT NULL,
  `journey_stage_id` int NOT NULL,
  `campaign_id` int DEFAULT NULL,
  `channel_id` int DEFAULT NULL,
  `touchpoint_type` varchar(30) NOT NULL,
  `occurred_at` datetime NOT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `ix_touchpoints_contact_date` (`contact_id`,`occurred_at`),
  KEY `ix_touchpoints_stage_date` (`journey_stage_id`,`occurred_at`),
  KEY `ix_touchpoints_campaign` (`campaign_id`),
  KEY `ix_touchpoints_channel` (`channel_id`),
  CONSTRAINT `fk_touchpoints_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`),
  CONSTRAINT `fk_touchpoints_journey_stage` FOREIGN KEY (`journey_stage_id`) REFERENCES `customer_journey_stages` (`id`),
  CONSTRAINT `fk_touchpoints_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`),
  CONSTRAINT `fk_touchpoints_channel` FOREIGN KEY (`channel_id`) REFERENCES `marketing_channels` (`id`),
  CONSTRAINT `chk_touchpoints_source` CHECK (
    (`campaign_id` IS NOT NULL AND `channel_id` IS NULL)
    OR (`campaign_id` IS NULL AND `channel_id` IS NOT NULL)
  ),
  CONSTRAINT `chk_touchpoints_type` CHECK (`touchpoint_type` IN ('impression','click','visit','form','email','call','meeting','purchase','delivery','other'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `sales_funnel_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(40) NOT NULL,
  `name` varchar(100) NOT NULL,
  `sort_order` smallint unsigned NOT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_funnel_stages_code` (`code`),
  UNIQUE KEY `uk_funnel_stages_order` (`sort_order`),
  CONSTRAINT `chk_funnel_stages_closed` CHECK (`is_closed` IN (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `leads` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contact_id` int NOT NULL,
  `source_campaign_id` int DEFAULT NULL,
  `source_channel_id` int DEFAULT NULL,
  `marketing_owner_id` int NOT NULL,
  `lead_status` varchar(20) NOT NULL DEFAULT 'open',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_leads_contact_date` (`contact_id`,`created_at`),
  KEY `ix_leads_campaign` (`source_campaign_id`),
  KEY `ix_leads_channel` (`source_channel_id`),
  KEY `ix_leads_owner_status` (`marketing_owner_id`,`lead_status`),
  CONSTRAINT `fk_leads_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`),
  CONSTRAINT `fk_leads_campaign` FOREIGN KEY (`source_campaign_id`) REFERENCES `campaigns` (`id`),
  CONSTRAINT `fk_leads_channel` FOREIGN KEY (`source_channel_id`) REFERENCES `marketing_channels` (`id`),
  CONSTRAINT `fk_leads_marketing_owner` FOREIGN KEY (`marketing_owner_id`) REFERENCES `team_members` (`id`),
  CONSTRAINT `chk_leads_source` CHECK (
    (`source_campaign_id` IS NOT NULL AND `source_channel_id` IS NULL)
    OR (`source_campaign_id` IS NULL AND `source_channel_id` IS NOT NULL)
  ),
  CONSTRAINT `chk_leads_status` CHECK (`lead_status` IN ('open','converted','disqualified'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `lead_stage_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lead_id` bigint NOT NULL,
  `stage_id` int NOT NULL,
  `changed_by_id` int NOT NULL,
  `entered_at` datetime NOT NULL,
  `exited_at` datetime DEFAULT NULL,
  `open_lead_id` bigint GENERATED ALWAYS AS (IF(`exited_at` IS NULL, `lead_id`, NULL)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lead_one_open_stage` (`open_lead_id`),
  UNIQUE KEY `uk_lead_stage_entry` (`lead_id`,`entered_at`),
  KEY `ix_lead_stage_history_stage` (`stage_id`,`entered_at`),
  KEY `ix_lead_stage_history_actor` (`changed_by_id`),
  CONSTRAINT `fk_lead_stage_history_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`),
  CONSTRAINT `fk_lead_stage_history_stage` FOREIGN KEY (`stage_id`) REFERENCES `sales_funnel_stages` (`id`),
  CONSTRAINT `fk_lead_stage_history_actor` FOREIGN KEY (`changed_by_id`) REFERENCES `team_members` (`id`),
  CONSTRAINT `chk_lead_stage_history_dates` CHECK (`exited_at` IS NULL OR `exited_at` >= `entered_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `sales_opportunities` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lead_id` bigint NOT NULL,
  `sales_owner_id` int NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'open',
  `expected_value_usd` decimal(12,2) NOT NULL,
  `won_value_usd` decimal(12,2) DEFAULT NULL,
  `opened_at` datetime NOT NULL,
  `closed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sales_opportunities_lead` (`lead_id`),
  KEY `ix_sales_opportunities_owner_status` (`sales_owner_id`,`status`),
  KEY `ix_sales_opportunities_closed` (`closed_at`),
  CONSTRAINT `fk_sales_opportunities_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`),
  CONSTRAINT `fk_sales_opportunities_owner` FOREIGN KEY (`sales_owner_id`) REFERENCES `team_members` (`id`),
  CONSTRAINT `chk_sales_opportunities_status` CHECK (`status` IN ('open','won','lost')),
  CONSTRAINT `chk_sales_opportunities_values` CHECK (`expected_value_usd` >= 0 AND (`won_value_usd` IS NULL OR `won_value_usd` >= 0)),
  CONSTRAINT `chk_sales_opportunities_close` CHECK (
    (`status` = 'open' AND `closed_at` IS NULL AND `won_value_usd` IS NULL)
    OR (`status` = 'won' AND `closed_at` IS NOT NULL AND `won_value_usd` IS NOT NULL)
    OR (`status` = 'lost' AND `closed_at` IS NOT NULL AND `won_value_usd` IS NULL)
  ),
  CONSTRAINT `chk_sales_opportunities_dates` CHECK (`closed_at` IS NULL OR `closed_at` >= `opened_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `content_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `campaign_id` int DEFAULT NULL,
  `author_id` int NOT NULL,
  `title` varchar(180) NOT NULL,
  `content_type` varchar(20) NOT NULL,
  `body_text` text NOT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_content_campaign_status` (`campaign_id`,`status`),
  KEY `ix_content_author` (`author_id`),
  KEY `ix_content_schedule` (`scheduled_at`),
  CONSTRAINT `fk_content_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`),
  CONSTRAINT `fk_content_author` FOREIGN KEY (`author_id`) REFERENCES `team_members` (`id`),
  CONSTRAINT `chk_content_type` CHECK (`content_type` IN ('post','email','ad','article','landing_page')),
  CONSTRAINT `chk_content_status` CHECK (`status` IN ('draft','in_review','approved','rejected','published')),
  CONSTRAINT `chk_content_publication` CHECK (
    (`status` = 'published' AND `published_at` IS NOT NULL)
    OR (`status` <> 'published' AND `published_at` IS NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `content_channels` (
  `content_id` bigint NOT NULL,
  `channel_id` int NOT NULL,
  PRIMARY KEY (`content_id`,`channel_id`),
  KEY `ix_content_channels_channel` (`channel_id`),
  CONSTRAINT `fk_content_channels_content` FOREIGN KEY (`content_id`) REFERENCES `content_items` (`id`),
  CONSTRAINT `fk_content_channels_channel` FOREIGN KEY (`channel_id`) REFERENCES `marketing_channels` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `content_reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content_id` bigint NOT NULL,
  `reviewer_id` int NOT NULL,
  `action` varchar(20) NOT NULL,
  `comment` text,
  `reviewed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_content_reviews_content_date` (`content_id`,`reviewed_at`),
  KEY `ix_content_reviews_reviewer` (`reviewer_id`),
  CONSTRAINT `fk_content_reviews_content` FOREIGN KEY (`content_id`) REFERENCES `content_items` (`id`),
  CONSTRAINT `fk_content_reviews_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `team_members` (`id`),
  CONSTRAINT `chk_content_reviews_action` CHECK (`action` IN ('submitted','approved','rejected','changes_requested')),
  CONSTRAINT `chk_content_reviews_comment` CHECK (`action` NOT IN ('rejected','changes_requested') OR (`comment` IS NOT NULL AND CHAR_LENGTH(TRIM(`comment`)) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `marketing_sales_handoffs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lead_id` bigint NOT NULL,
  `attempt_number` smallint unsigned NOT NULL DEFAULT 1,
  `marketing_owner_id` int NOT NULL,
  `sales_owner_id` int NOT NULL,
  `delivered_at` datetime NOT NULL,
  `decision` varchar(20) NOT NULL DEFAULT 'pending',
  `decided_at` datetime DEFAULT NULL,
  `rejection_reason` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_handoffs_lead_attempt` (`lead_id`,`attempt_number`),
  KEY `ix_handoffs_sales_decision` (`sales_owner_id`,`decision`),
  KEY `ix_handoffs_marketing_owner` (`marketing_owner_id`),
  CONSTRAINT `fk_handoffs_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`),
  CONSTRAINT `fk_handoffs_marketing_owner` FOREIGN KEY (`marketing_owner_id`) REFERENCES `team_members` (`id`),
  CONSTRAINT `fk_handoffs_sales_owner` FOREIGN KEY (`sales_owner_id`) REFERENCES `team_members` (`id`),
  CONSTRAINT `chk_handoffs_attempt` CHECK (`attempt_number` > 0),
  CONSTRAINT `chk_handoffs_decision` CHECK (`decision` IN ('pending','accepted','rejected')),
  CONSTRAINT `chk_handoffs_resolution` CHECK (
    (`decision` = 'pending' AND `decided_at` IS NULL AND `rejection_reason` IS NULL)
    OR (`decision` = 'accepted' AND `decided_at` IS NOT NULL AND `rejection_reason` IS NULL)
    OR (`decision` = 'rejected' AND `decided_at` IS NOT NULL AND `rejection_reason` IS NOT NULL AND CHAR_LENGTH(TRIM(`rejection_reason`)) > 0)
  ),
  CONSTRAINT `chk_handoffs_dates` CHECK (`decided_at` IS NULL OR `decided_at` >= `delivered_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `handoff_followups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `handoff_id` bigint NOT NULL,
  `responsible_id` int NOT NULL,
  `followed_up_at` datetime NOT NULL,
  `note` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_handoff_followups_handoff_date` (`handoff_id`,`followed_up_at`),
  KEY `ix_handoff_followups_responsible` (`responsible_id`),
  CONSTRAINT `fk_handoff_followups_handoff` FOREIGN KEY (`handoff_id`) REFERENCES `marketing_sales_handoffs` (`id`),
  CONSTRAINT `fk_handoff_followups_responsible` FOREIGN KEY (`responsible_id`) REFERENCES `team_members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `subscription_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `customer_type` varchar(20) NOT NULL,
  `offer_id` int NOT NULL,
  `subscription_parameters_id` int DEFAULT NULL,
  `delivery_interval` smallint unsigned NOT NULL,
  `delivery_frequency_unit` varchar(10) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subscription_plans_name` (`name`),
  KEY `ix_subscription_plans_offer` (`offer_id`),
  KEY `ix_subscription_plans_parameters` (`subscription_parameters_id`),
  CONSTRAINT `fk_subscription_plans_offer` FOREIGN KEY (`offer_id`) REFERENCES `commercial_offers` (`id`),
  CONSTRAINT `fk_subscription_plans_parameters` FOREIGN KEY (`subscription_parameters_id`) REFERENCES `subscription_parameters` (`id`),
  CONSTRAINT `chk_subscription_plans_customer_type` CHECK (`customer_type` IN ('individual','business','both')),
  CONSTRAINT `chk_subscription_plans_interval` CHECK (`delivery_interval` > 0),
  CONSTRAINT `chk_subscription_plans_frequency` CHECK (`delivery_frequency_unit` IN ('week','month')),
  CONSTRAINT `chk_subscription_plans_active` CHECK (`active` IN (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `subscriptions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contact_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `source_lead_id` bigint DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `started_on` date NOT NULL,
  `ended_on` date DEFAULT NULL,
  `cancelled_on` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subscriptions_source_lead` (`source_lead_id`),
  KEY `ix_subscriptions_contact_status` (`contact_id`,`status`),
  KEY `ix_subscriptions_plan` (`plan_id`),
  CONSTRAINT `fk_subscriptions_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`),
  CONSTRAINT `fk_subscriptions_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`),
  CONSTRAINT `fk_subscriptions_source_lead` FOREIGN KEY (`source_lead_id`) REFERENCES `leads` (`id`),
  CONSTRAINT `chk_subscriptions_status` CHECK (`status` IN ('pending','active','paused','cancelled','expired')),
  CONSTRAINT `chk_subscriptions_dates` CHECK (
    (`ended_on` IS NULL OR `ended_on` >= `started_on`)
    AND (`cancelled_on` IS NULL OR `cancelled_on` >= `started_on`)
  ),
  CONSTRAINT `chk_subscriptions_cancelled` CHECK (`status` <> 'cancelled' OR `cancelled_on` IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `subscription_items` (
  `subscription_id` bigint NOT NULL,
  `product_id` int NOT NULL,
  `quantity` decimal(9,3) NOT NULL,
  PRIMARY KEY (`subscription_id`,`product_id`),
  KEY `ix_subscription_items_product` (`product_id`),
  CONSTRAINT `fk_subscription_items_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`),
  CONSTRAINT `fk_subscription_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `chk_subscription_items_quantity` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `subscription_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `subscription_id` bigint NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `service_period_start` date NOT NULL,
  `service_period_end` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `ordered_at` datetime NOT NULL,
  `paid_at` datetime DEFAULT NULL,
  `subtotal_usd` decimal(12,2) NOT NULL,
  `discount_usd` decimal(12,2) NOT NULL DEFAULT 0,
  `shipping_usd` decimal(12,2) NOT NULL DEFAULT 0,
  `tax_usd` decimal(12,2) NOT NULL DEFAULT 0,
  `total_usd` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subscription_orders_number` (`order_number`),
  UNIQUE KEY `uk_subscription_orders_period` (`subscription_id`,`service_period_start`),
  KEY `ix_subscription_orders_status_date` (`status`,`ordered_at`),
  CONSTRAINT `fk_subscription_orders_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`),
  CONSTRAINT `chk_subscription_orders_period` CHECK (`service_period_end` >= `service_period_start`),
  CONSTRAINT `chk_subscription_orders_status` CHECK (`status` IN ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  CONSTRAINT `chk_subscription_orders_amounts` CHECK (
    `subtotal_usd` >= 0 AND `discount_usd` >= 0 AND `discount_usd` <= `subtotal_usd`
    AND `shipping_usd` >= 0 AND `tax_usd` >= 0 AND `total_usd` >= 0
    AND `total_usd` = `subtotal_usd` - `discount_usd` + `shipping_usd` + `tax_usd`
  ),
  CONSTRAINT `chk_subscription_orders_paid` CHECK (
    (`status` = 'pending' AND `paid_at` IS NULL)
    OR (`status` IN ('paid','processing','shipped','delivered','refunded') AND `paid_at` IS NOT NULL)
    OR (`status` = 'cancelled')
  ),
  CONSTRAINT `chk_subscription_orders_paid_date` CHECK (`paid_at` IS NULL OR `paid_at` >= `ordered_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `subscription_order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` int NOT NULL,
  `quantity` decimal(9,3) NOT NULL,
  `unit_price_usd` decimal(12,4) NOT NULL,
  `unit_cost_usd` decimal(12,4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_items_product` (`order_id`,`product_id`),
  KEY `ix_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `subscription_orders` (`id`),
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `chk_order_items_quantity` CHECK (`quantity` > 0),
  CONSTRAINT `chk_order_items_amounts` CHECK (`unit_price_usd` >= 0 AND `unit_cost_usd` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `deliveries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `scheduled_for` date NOT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'scheduled',
  `tracking_reference` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_deliveries_order` (`order_id`),
  KEY `ix_deliveries_status_date` (`status`,`scheduled_for`),
  CONSTRAINT `fk_deliveries_order` FOREIGN KEY (`order_id`) REFERENCES `subscription_orders` (`id`),
  CONSTRAINT `chk_deliveries_status` CHECK (`status` IN ('scheduled','in_transit','delivered','failed','cancelled')),
  CONSTRAINT `chk_deliveries_completed` CHECK (`status` <> 'delivered' OR `delivered_at` IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `subscription_events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `subscription_id` bigint NOT NULL,
  `event_type` varchar(20) NOT NULL,
  `previous_plan_id` int DEFAULT NULL,
  `new_plan_id` int DEFAULT NULL,
  `occurred_at` datetime NOT NULL,
  `reason` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_subscription_events_subscription_date` (`subscription_id`,`occurred_at`),
  KEY `ix_subscription_events_previous_plan` (`previous_plan_id`),
  KEY `ix_subscription_events_new_plan` (`new_plan_id`),
  CONSTRAINT `fk_subscription_events_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`),
  CONSTRAINT `fk_subscription_events_previous_plan` FOREIGN KEY (`previous_plan_id`) REFERENCES `subscription_plans` (`id`),
  CONSTRAINT `fk_subscription_events_new_plan` FOREIGN KEY (`new_plan_id`) REFERENCES `subscription_plans` (`id`),
  CONSTRAINT `chk_subscription_events_type` CHECK (`event_type` IN ('activated','renewed','paused','resumed','plan_changed','cancelled','expired')),
  CONSTRAINT `chk_subscription_events_plan_change` CHECK (
    (`event_type` = 'plan_changed' AND `previous_plan_id` IS NOT NULL AND `new_plan_id` IS NOT NULL AND `previous_plan_id` <> `new_plan_id`)
    OR (`event_type` <> 'plan_changed' AND `previous_plan_id` IS NULL AND `new_plan_id` IS NULL)
  ),
  CONSTRAINT `chk_subscription_events_reason` CHECK (`event_type` NOT IN ('cancelled','expired') OR (`reason` IS NOT NULL AND CHAR_LENGTH(TRIM(`reason`)) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `campaign_attributions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `campaign_id` int NOT NULL,
  `lead_id` bigint NOT NULL,
  `subscription_id` bigint NOT NULL,
  `attribution_model` varchar(20) NOT NULL,
  `attributed_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaign_attributions_lead` (`lead_id`),
  UNIQUE KEY `uk_campaign_attributions_subscription` (`subscription_id`),
  KEY `ix_campaign_attributions_campaign_date` (`campaign_id`,`attributed_at`),
  CONSTRAINT `fk_campaign_attributions_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`),
  CONSTRAINT `fk_campaign_attributions_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`),
  CONSTRAINT `fk_campaign_attributions_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`),
  CONSTRAINT `chk_campaign_attributions_model` CHECK (`attribution_model` IN ('first_touch','last_touch','manual'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 3. DML: 514 registros ficticios con validaciones bloqueantes
-- ============================================================
-- Datos exclusivamente ficticios para demostracion academica.
-- Destino permitido: tueste_business_solutions_entrega.
-- No contiene USE y no representa resultados historicos reales de Tueste.

CREATE TEMPORARY TABLE `_demo_load_guard` (
  `check_name` varchar(80) NOT NULL,
  `ok` tinyint NOT NULL,
  CONSTRAINT `chk_demo_load_guard` CHECK (`ok` = 1)
) ENGINE=InnoDB;

-- Falla antes de cualquier carga si el destino no es el temporal autorizado.
INSERT INTO `_demo_load_guard` VALUES
  ('authorized_database', DATABASE() = 'tueste_business_solutions_entrega');

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

-- ============================================================
-- 4. Consultas académicas de métricas
-- La consulta 12 usa el contacto ficticio 1 para ser autocontenida.
-- ============================================================
-- PROPUESTAS PARA MYSQL 8.0. NO EJECUTADAS CONTRA LA BASE ACTUAL.
-- Requieren las tablas definidas en migracion_comercial_propuesta.sql.
-- Estados de ingreso reconocido usados aqui: paid, processing, shipped y delivered.
-- Pedidos pending, cancelled y refunded no se consideran ingreso.

-- 1. CPC y CTR por campana.
SELECT
  c.id AS campaign_id,
  c.name AS campaign_name,
  SUM(m.ad_spend_usd) AS executed_media_spend_usd,
  SUM(m.impressions) AS impressions,
  SUM(m.clicks) AS clicks,
  SUM(m.ad_spend_usd) / NULLIF(SUM(m.clicks), 0) AS cpc_usd,
  SUM(m.clicks) / NULLIF(SUM(m.impressions), 0) AS ctr_rate,
  100 * SUM(m.clicks) / NULLIF(SUM(m.impressions), 0) AS ctr_percent
FROM campaigns c
JOIN campaign_daily_metrics m ON m.campaign_id = c.id
GROUP BY c.id, c.name;

-- 2. CPC y CTR por canal, agregando primero cada campana.
WITH campaign_totals AS (
  SELECT
    c.id AS campaign_id,
    c.channel_id,
    SUM(m.ad_spend_usd) AS media_spend_usd,
    SUM(m.impressions) AS impressions,
    SUM(m.clicks) AS clicks
  FROM campaigns c
  JOIN campaign_daily_metrics m ON m.campaign_id = c.id
  GROUP BY c.id, c.channel_id
)
SELECT
  ch.id AS channel_id,
  ch.name AS channel_name,
  SUM(ct.media_spend_usd) / NULLIF(SUM(ct.clicks), 0) AS cpc_usd,
  SUM(ct.clicks) / NULLIF(SUM(ct.impressions), 0) AS ctr_rate
FROM marketing_channels ch
JOIN campaign_totals ct ON ct.channel_id = ch.id
GROUP BY ch.id, ch.name;

-- 3. Presupuesto planificado frente a inversion ejecutada.
WITH spend AS (
  SELECT
    campaign_id,
    SUM(ad_spend_usd) AS media_spend_usd,
    SUM(other_marketing_cost_usd) AS other_marketing_cost_usd
  FROM campaign_daily_metrics
  GROUP BY campaign_id
)
SELECT
  c.id,
  c.name,
  c.planned_budget_usd,
  COALESCE(s.media_spend_usd, 0) AS media_spend_usd,
  COALESCE(s.other_marketing_cost_usd, 0) AS other_marketing_cost_usd,
  COALESCE(s.media_spend_usd, 0) + COALESCE(s.other_marketing_cost_usd, 0) AS executed_total_usd,
  c.planned_budget_usd - COALESCE(s.media_spend_usd, 0) - COALESCE(s.other_marketing_cost_usd, 0) AS remaining_budget_usd
FROM campaigns c
LEFT JOIN spend s ON s.campaign_id = c.id;

-- 4. CAC por campana.
-- Incluye medios y otros costos; cada suscripcion solo puede tener una atribucion.
WITH spend AS (
  SELECT
    campaign_id,
    SUM(ad_spend_usd + other_marketing_cost_usd) AS acquisition_cost_usd
  FROM campaign_daily_metrics
  GROUP BY campaign_id
),
acquisitions AS (
  SELECT
    campaign_id,
    COUNT(DISTINCT subscription_id) AS acquired_customers
  FROM campaign_attributions
  GROUP BY campaign_id
)
SELECT
  c.id AS campaign_id,
  c.name AS campaign_name,
  COALESCE(s.acquisition_cost_usd, 0) AS acquisition_cost_usd,
  COALESCE(a.acquired_customers, 0) AS acquired_customers,
  s.acquisition_cost_usd / NULLIF(a.acquired_customers, 0) AS cac_usd
FROM campaigns c
LEFT JOIN spend s ON s.campaign_id = c.id
LEFT JOIN acquisitions a ON a.campaign_id = c.id;

-- 5. ROAS por campana.
-- Los gastos e ingresos se agregan en CTE separados para no multiplicar filas.
WITH spend AS (
  SELECT campaign_id, SUM(ad_spend_usd) AS media_spend_usd
  FROM campaign_daily_metrics
  GROUP BY campaign_id
),
revenue AS (
  SELECT
    ca.campaign_id,
    SUM(so.total_usd - so.tax_usd) AS attributed_revenue_usd
  FROM campaign_attributions ca
  JOIN subscription_orders so ON so.subscription_id = ca.subscription_id
  WHERE so.status IN ('paid','processing','shipped','delivered')
  GROUP BY ca.campaign_id
)
SELECT
  c.id AS campaign_id,
  c.name AS campaign_name,
  COALESCE(r.attributed_revenue_usd, 0) AS attributed_revenue_usd,
  COALESCE(s.media_spend_usd, 0) AS media_spend_usd,
  r.attributed_revenue_usd / NULLIF(s.media_spend_usd, 0) AS roas
FROM campaigns c
LEFT JOIN spend s ON s.campaign_id = c.id
LEFT JOIN revenue r ON r.campaign_id = c.id;

-- 6. Conversion entre etapas consecutivas observadas del embudo.
WITH ordered_history AS (
  SELECT
    h.lead_id,
    h.stage_id AS from_stage_id,
    LEAD(h.stage_id) OVER (PARTITION BY h.lead_id ORDER BY h.entered_at, h.id) AS to_stage_id
  FROM lead_stage_history h
),
stage_entries AS (
  SELECT stage_id, COUNT(DISTINCT lead_id) AS entered_leads
  FROM lead_stage_history
  GROUP BY stage_id
),
transitions AS (
  SELECT
    from_stage_id,
    to_stage_id,
    COUNT(DISTINCT lead_id) AS transitioned_leads
  FROM ordered_history
  WHERE to_stage_id IS NOT NULL
  GROUP BY from_stage_id, to_stage_id
)
SELECT
  fs.name AS from_stage,
  ts.name AS to_stage,
  se.entered_leads,
  t.transitioned_leads,
  t.transitioned_leads / NULLIF(se.entered_leads, 0) AS conversion_rate
FROM transitions t
JOIN stage_entries se ON se.stage_id = t.from_stage_id
JOIN sales_funnel_stages fs ON fs.id = t.from_stage_id
JOIN sales_funnel_stages ts ON ts.id = t.to_stage_id
ORDER BY fs.sort_order, ts.sort_order;

-- 7. Conversion total de lead a suscriptor.
SELECT
  COUNT(DISTINCT l.id) AS total_leads,
  COUNT(DISTINCT s.source_lead_id) AS converted_leads,
  COUNT(DISTINCT s.source_lead_id) / NULLIF(COUNT(DISTINCT l.id), 0) AS lead_to_subscriber_rate
FROM leads l
LEFT JOIN subscriptions s ON s.source_lead_id = l.id;

-- 8. Ciclo de venta en dias para oportunidades cerradas.
SELECT
  o.id AS opportunity_id,
  o.status,
  TIMESTAMPDIFF(HOUR, l.created_at, o.closed_at) / 24.0 AS sales_cycle_days
FROM sales_opportunities o
JOIN leads l ON l.id = o.lead_id
WHERE o.status IN ('won','lost')
  AND o.closed_at IS NOT NULL;

-- 9. Promedio y mediana aproximada no se mezclan: esta consulta entrega promedio.
-- Ticket promedio observado, sin impuestos.
SELECT
  COUNT(*) AS recognized_orders,
  AVG(total_usd - tax_usd) AS average_ticket_usd
FROM subscription_orders
WHERE status IN ('paid','processing','shipped','delivered');

-- 10. Ticket promedio por plan y tipo de cliente.
SELECT
  sp.id AS plan_id,
  sp.name AS plan_name,
  c.customer_type,
  COUNT(*) AS recognized_orders,
  AVG(so.total_usd - so.tax_usd) AS average_ticket_usd
FROM subscription_orders so
JOIN subscriptions s ON s.id = so.subscription_id
JOIN subscription_plans sp ON sp.id = s.plan_id
JOIN contacts c ON c.id = s.contact_id
WHERE so.status IN ('paid','processing','shipped','delivered')
GROUP BY sp.id, sp.name, c.customer_type;

-- 11. Metricas de vanidad y de negocio en una vista comparativa por campana.
WITH vanity AS (
  SELECT
    campaign_id,
    SUM(impressions) AS impressions,
    SUM(clicks) AS clicks,
    SUM(ad_spend_usd) AS media_spend_usd,
    SUM(ad_spend_usd + other_marketing_cost_usd) AS total_acquisition_cost_usd
  FROM campaign_daily_metrics
  GROUP BY campaign_id
),
business AS (
  SELECT
    ca.campaign_id,
    COUNT(DISTINCT ca.subscription_id) AS acquired_customers,
    COUNT(DISTINCT so.id) AS recognized_orders,
    COALESCE(SUM(so.total_usd - so.tax_usd), 0) AS attributed_revenue_usd
  FROM campaign_attributions ca
  LEFT JOIN subscription_orders so
    ON so.subscription_id = ca.subscription_id
   AND so.status IN ('paid','processing','shipped','delivered')
  GROUP BY ca.campaign_id
)
SELECT
  c.id,
  c.name,
  v.impressions,
  v.clicks,
  v.clicks / NULLIF(v.impressions, 0) AS ctr_rate,
  v.media_spend_usd / NULLIF(v.clicks, 0) AS cpc_usd,
  COALESCE(b.acquired_customers, 0) AS acquired_customers,
  COALESCE(b.recognized_orders, 0) AS recognized_orders,
  COALESCE(b.attributed_revenue_usd, 0) AS attributed_revenue_usd,
  v.total_acquisition_cost_usd / NULLIF(b.acquired_customers, 0) AS cac_usd,
  b.attributed_revenue_usd / NULLIF(v.media_spend_usd, 0) AS roas
FROM campaigns c
LEFT JOIN vanity v ON v.campaign_id = c.id
LEFT JOIN business b ON b.campaign_id = c.id;

-- 12. Recorrido cronologico de un contacto.
-- Ejecucion DEMO autocontenida para el contacto ficticio 1.
SELECT
  tp.occurred_at,
  js.name AS journey_stage,
  tp.touchpoint_type,
  COALESCE(c.name, ch.name) AS source_name,
  tp.notes
FROM customer_touchpoints tp
JOIN customer_journey_stages js ON js.id = tp.journey_stage_id
LEFT JOIN campaigns c ON c.id = tp.campaign_id
LEFT JOIN marketing_channels ch ON ch.id = tp.channel_id
WHERE tp.contact_id = 1
ORDER BY tp.occurred_at, tp.id;

-- 13. Cumplimiento del traspaso a ventas.
SELECT
  decision,
  COUNT(*) AS handoffs,
  AVG(TIMESTAMPDIFF(HOUR, delivered_at, decided_at)) AS average_decision_hours
FROM marketing_sales_handoffs
GROUP BY decision;

-- 14. Margen de contribucion observado por pedido antes de comisiones de pago.
-- El fee de pago no existe como hecho transaccional; debe incorporarse antes de
-- presentar este resultado como margen completo.
WITH item_costs AS (
  SELECT
    order_id,
    SUM(quantity * unit_cost_usd) AS product_cost_usd
  FROM subscription_order_items
  GROUP BY order_id
)
SELECT
  so.id AS order_id,
  so.order_number,
  so.subtotal_usd - so.discount_usd AS net_product_revenue_usd,
  COALESCE(ic.product_cost_usd, 0) AS product_cost_usd,
  so.shipping_usd,
  (so.subtotal_usd - so.discount_usd) - COALESCE(ic.product_cost_usd, 0) - so.shipping_usd AS partial_contribution_margin_usd
FROM subscription_orders so
LEFT JOIN item_costs ic ON ic.order_id = so.id
WHERE so.status IN ('paid','processing','shipped','delivered');

-- 15. LTV observado a 12 meses por suscripcion, usando contribucion parcial.
WITH item_costs AS (
  SELECT order_id, SUM(quantity * unit_cost_usd) AS product_cost_usd
  FROM subscription_order_items
  GROUP BY order_id
),
order_contribution AS (
  SELECT
    so.subscription_id,
    so.ordered_at,
    (so.subtotal_usd - so.discount_usd) - COALESCE(ic.product_cost_usd, 0) - so.shipping_usd AS contribution_usd
  FROM subscription_orders so
  LEFT JOIN item_costs ic ON ic.order_id = so.id
  WHERE so.status IN ('paid','processing','shipped','delivered')
)
SELECT
  s.id AS subscription_id,
  SUM(oc.contribution_usd) AS observed_ltv_12m_usd
FROM subscriptions s
JOIN order_contribution oc ON oc.subscription_id = s.id
WHERE oc.ordered_at >= s.started_on
  AND oc.ordered_at < DATE_ADD(s.started_on, INTERVAL 12 MONTH)
GROUP BY s.id;

-- 16. Flujo operativo mensual antes de costos fijos y movimientos financieros.
-- No equivale a flujo de caja completo: caja inicial, costos fijos, impuestos
-- pagados, CAPEX, deuda y fechas reales de cobro/pago deben suministrarse al motor.
WITH monthly_revenue AS (
  SELECT
    DATE_FORMAT(paid_at, '%Y-%m-01') AS period_month,
    SUM(total_usd - tax_usd) AS revenue_usd
  FROM subscription_orders
  WHERE status IN ('paid','processing','shipped','delivered')
    AND paid_at IS NOT NULL
  GROUP BY DATE_FORMAT(paid_at, '%Y-%m-01')
),
monthly_product_cost AS (
  SELECT
    DATE_FORMAT(so.paid_at, '%Y-%m-01') AS period_month,
    SUM(oi.quantity * oi.unit_cost_usd) AS product_cost_usd
  FROM subscription_orders so
  JOIN subscription_order_items oi ON oi.order_id = so.id
  WHERE so.status IN ('paid','processing','shipped','delivered')
    AND so.paid_at IS NOT NULL
  GROUP BY DATE_FORMAT(so.paid_at, '%Y-%m-01')
),
monthly_marketing AS (
  SELECT
    DATE_FORMAT(metric_date, '%Y-%m-01') AS period_month,
    SUM(ad_spend_usd + other_marketing_cost_usd) AS marketing_cost_usd
  FROM campaign_daily_metrics
  GROUP BY DATE_FORMAT(metric_date, '%Y-%m-01')
)
SELECT
  r.period_month,
  r.revenue_usd,
  COALESCE(pc.product_cost_usd, 0) AS product_cost_usd,
  COALESCE(mm.marketing_cost_usd, 0) AS marketing_cost_usd,
  r.revenue_usd - COALESCE(pc.product_cost_usd, 0) - COALESCE(mm.marketing_cost_usd, 0) AS operating_cash_before_fixed_costs_usd
FROM monthly_revenue r
LEFT JOIN monthly_product_cost pc ON pc.period_month = r.period_month
LEFT JOIN monthly_marketing mm ON mm.period_month = r.period_month
ORDER BY r.period_month;
