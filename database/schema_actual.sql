-- Instantanea de solo lectura de la estructura real de `tueste_analytics`.
-- Obtenida mediante INFORMATION_SCHEMA y SHOW CREATE TABLE el 2026-11-03.
-- Este archivo es documentacion y no ha sido ejecutado contra MySQL.

CREATE DATABASE `tueste_analytics`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `tueste_analytics`;

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

-- La base real no contiene restricciones CHECK ni triggers.
-- Todas las claves foraneas usan ON UPDATE/DELETE NO ACTION (valor predeterminado).
