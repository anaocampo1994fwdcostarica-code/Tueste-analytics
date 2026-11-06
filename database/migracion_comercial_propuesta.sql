-- PROPUESTA NO EJECUTADA.
-- Extension aditiva para MySQL 8.0; no modifica las 12 tablas actuales.
-- No selecciona una base de datos: el ejecutor debe elegir explícitamente un
-- destino autorizado. Esto evita aplicar la propuesta por accidente sobre
-- `tueste_analytics` durante pruebas aisladas.

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
