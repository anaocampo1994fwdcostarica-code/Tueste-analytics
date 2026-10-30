CREATE DATABASE IF NOT EXISTS tueste_analytics
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tueste_analytics;

CREATE TABLE products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(120) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_products_code (code),
  UNIQUE KEY uk_products_name (name)
) ENGINE = InnoDB;

CREATE TABLE commercial_offers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(120) NOT NULL,
  offer_type VARCHAR(30) NOT NULL,
  discount_rate DECIMAL(7, 4) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from DATE NULL,
  valid_until DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_commercial_offers_code (code),
  CONSTRAINT chk_commercial_offers_type CHECK (offer_type IN ('regular', 'subscription', 'agency', 'pack', 'other')),
  CONSTRAINT chk_commercial_offers_discount CHECK (discount_rate >= 0 AND discount_rate <= 1),
  CONSTRAINT chk_commercial_offers_dates CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from)
) ENGINE = InnoDB;

CREATE TABLE offer_products (
  offer_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  product_quantity DECIMAL(9, 3) UNSIGNED NOT NULL,
  PRIMARY KEY (offer_id, product_id),
  CONSTRAINT fk_offer_products_offer FOREIGN KEY (offer_id) REFERENCES commercial_offers (id),
  CONSTRAINT fk_offer_products_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT chk_offer_products_quantity CHECK (product_quantity > 0)
) ENGINE = InnoDB;

CREATE TABLE product_variable_costs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  cost_type VARCHAR(30) NOT NULL,
  unit_cost_usd DECIMAL(12, 4) UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  effective_from DATE NOT NULL,
  effective_until DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_product_cost_period (product_id, cost_type, effective_from),
  INDEX ix_product_cost_lookup (product_id, cost_type, effective_from, effective_until),
  CONSTRAINT fk_product_variable_costs_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT chk_product_variable_cost_type CHECK (cost_type IN ('material', 'packaging', 'fulfillment', 'other')),
  CONSTRAINT chk_product_variable_costs_currency CHECK (currency = 'USD'),
  CONSTRAINT chk_product_variable_costs_period CHECK (effective_until IS NULL OR effective_until >= effective_from)
) ENGINE = InnoDB;

DELIMITER //

CREATE TRIGGER trg_product_variable_costs_insert
BEFORE INSERT ON product_variable_costs
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1
    FROM product_variable_costs existing
    WHERE existing.product_id = NEW.product_id
      AND existing.cost_type = NEW.cost_type
      AND NEW.effective_from <= COALESCE(existing.effective_until, '9999-12-31')
      AND existing.effective_from <= COALESCE(NEW.effective_until, '9999-12-31')
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El periodo de costo se superpone con otro registro vigente';
  END IF;
END//

CREATE TRIGGER trg_product_variable_costs_update
BEFORE UPDATE ON product_variable_costs
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1
    FROM product_variable_costs existing
    WHERE existing.id <> NEW.id
      AND existing.product_id = NEW.product_id
      AND existing.cost_type = NEW.cost_type
      AND NEW.effective_from <= COALESCE(existing.effective_until, '9999-12-31')
      AND existing.effective_from <= COALESCE(NEW.effective_until, '9999-12-31')
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El periodo de costo se superpone con otro registro vigente';
  END IF;
END//

DELIMITER ;

CREATE TABLE order_variable_cost_assumptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  offer_id BIGINT UNSIGNED NULL,
  cost_type VARCHAR(30) NOT NULL,
  amount_usd DECIMAL(12, 4) UNSIGNED NULL,
  percentage_rate DECIMAL(7, 4) UNSIGNED NULL,
  currency CHAR(3) NULL,
  effective_from DATE NOT NULL,
  effective_until DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_order_costs_offer FOREIGN KEY (offer_id) REFERENCES commercial_offers (id),
  CONSTRAINT chk_order_costs_type CHECK (cost_type IN ('shipping', 'payment_fee', 'packaging', 'fulfillment', 'other')),
  CONSTRAINT chk_order_fixed_cost CHECK (
    (cost_type = 'payment_fee' AND amount_usd IS NULL AND percentage_rate IS NOT NULL AND percentage_rate <= 1 AND currency IS NULL)
    OR (cost_type <> 'payment_fee' AND amount_usd IS NOT NULL AND percentage_rate IS NULL AND currency = 'USD')
  ),
  CONSTRAINT chk_order_costs_currency_period CHECK (effective_until IS NULL OR effective_until >= effective_from)
) ENGINE = InnoDB;

CREATE TABLE financial_assumptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  version_label VARCHAR(30) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  initial_cash_usd DECIMAL(14, 4) NOT NULL,
  fixed_monthly_cost_usd DECIMAL(14, 4) NOT NULL DEFAULT 0,
  safety_floor_usd DECIMAL(14, 4) NOT NULL DEFAULT 0,
  projection_months SMALLINT UNSIGNED NOT NULL DEFAULT 12,
  assumed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uk_financial_assumptions_name_version (name, version_label),
  CONSTRAINT chk_financial_assumptions_currency CHECK (currency = 'USD'),
  CONSTRAINT chk_financial_assumptions_cash CHECK (initial_cash_usd >= 0),
  CONSTRAINT chk_financial_assumptions_fixed CHECK (fixed_monthly_cost_usd >= 0),
  CONSTRAINT chk_financial_assumptions_floor CHECK (safety_floor_usd >= 0),
  CONSTRAINT chk_financial_assumptions_months CHECK (projection_months BETWEEN 1 AND 60)
) ENGINE = InnoDB;

CREATE TABLE advertising_acquisition_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  period_month DATE NOT NULL,
  channel VARCHAR(50) NOT NULL,
  campaign_name VARCHAR(120) NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  advertising_spend_usd DECIMAL(14, 4) UNSIGNED NOT NULL,
  agency_fee_usd DECIMAL(14, 4) UNSIGNED NOT NULL DEFAULT 0,
  acquired_customers INT UNSIGNED NOT NULL DEFAULT 0,
  campaign_name_key VARCHAR(120) GENERATED ALWAYS AS (COALESCE(campaign_name, '__NO_CAMPAIGN__')) STORED,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_advertising_history_period_channel (period_month, channel, campaign_name_key),
  CONSTRAINT chk_advertising_history_currency CHECK (currency = 'USD'),
  CONSTRAINT chk_advertising_history_month CHECK (DAY(period_month) = 1),
  CONSTRAINT chk_advertising_history_campaign CHECK (campaign_name IS NULL OR CHAR_LENGTH(TRIM(campaign_name)) > 0)
) ENGINE = InnoDB;

CREATE TABLE commercial_scenarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(120) NOT NULL,
  scenario_type VARCHAR(30) NOT NULL,
  base_assumptions_id BIGINT UNSIGNED NULL,
  offer_id BIGINT UNSIGNED NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  advertising_spend_usd DECIMAL(14, 4) UNSIGNED NULL,
  agency_fee_usd DECIMAL(14, 4) UNSIGNED NOT NULL DEFAULT 0,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_commercial_scenarios_code (code),
  CONSTRAINT fk_scenarios_assumptions FOREIGN KEY (base_assumptions_id) REFERENCES financial_assumptions (id),
  CONSTRAINT fk_scenarios_offer FOREIGN KEY (offer_id) REFERENCES commercial_offers (id),
  CONSTRAINT chk_scenario_currency CHECK (currency = 'USD'),
  CONSTRAINT chk_scenario_type CHECK (scenario_type IN ('actual', 'agency', 'pack', 'custom'))
) ENGINE = InnoDB;

CREATE TABLE repurchase_patterns (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  scenario_id BIGINT UNSIGNED NOT NULL,
  customer_segment VARCHAR(50) NOT NULL,
  customer_age_month TINYINT UNSIGNED NOT NULL,
  repurchase_quantity DECIMAL(10, 4) UNSIGNED NOT NULL DEFAULT 0,
  repurchase_probability DECIMAL(7, 4) UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_repurchase_pattern (scenario_id, customer_segment, customer_age_month),
  CONSTRAINT fk_repurchase_scenario FOREIGN KEY (scenario_id) REFERENCES commercial_scenarios (id),
  CONSTRAINT chk_repurchase_age CHECK (customer_age_month BETWEEN 0 AND 120),
  CONSTRAINT chk_repurchase_probability CHECK (repurchase_probability <= 1)
) ENGINE = InnoDB;

CREATE TABLE subscription_parameters (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  version_label VARCHAR(30) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  monthly_price_usd DECIMAL(12, 4) UNSIGNED NOT NULL,
  churn_rate DECIMAL(7, 4) UNSIGNED NOT NULL,
  renewal_rate DECIMAL(7, 4) UNSIGNED NOT NULL,
  commitment_months SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uk_subscription_parameters_name_version (name, version_label),
  CONSTRAINT chk_subscription_currency CHECK (currency = 'USD'),
  CONSTRAINT chk_subscription_churn CHECK (churn_rate <= 1),
  CONSTRAINT chk_subscription_renewal CHECK (renewal_rate <= 1),
  CONSTRAINT chk_subscription_commitment CHECK (commitment_months >= 1),
  CONSTRAINT chk_subscription_churn_renewal CHECK (churn_rate + renewal_rate <= 1)
) ENGINE = InnoDB;

CREATE TABLE simulation_configs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  assumptions_id BIGINT UNSIGNED NOT NULL,
  subscription_parameters_id BIGINT UNSIGNED NULL,
  projection_months SMALLINT UNSIGNED NOT NULL DEFAULT 12,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_simulation_configs_name (name),
  CONSTRAINT fk_simulation_assumptions FOREIGN KEY (assumptions_id) REFERENCES financial_assumptions (id),
  CONSTRAINT fk_simulation_subscription FOREIGN KEY (subscription_parameters_id) REFERENCES subscription_parameters (id),
  CONSTRAINT chk_simulation_projection_months CHECK (projection_months BETWEEN 1 AND 60)
) ENGINE = InnoDB;

CREATE TABLE simulation_config_scenarios (
  simulation_config_id BIGINT UNSIGNED NOT NULL,
  scenario_id BIGINT UNSIGNED NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (simulation_config_id, scenario_id),
  UNIQUE KEY uk_simulation_scenario_order (simulation_config_id, sort_order),
  CONSTRAINT fk_simulation_config_scenarios_config FOREIGN KEY (simulation_config_id) REFERENCES simulation_configs (id) ON DELETE CASCADE,
  CONSTRAINT fk_simulation_config_scenarios_scenario FOREIGN KEY (scenario_id) REFERENCES commercial_scenarios (id)
) ENGINE = InnoDB;
