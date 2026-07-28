-- 1. ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CONSUMERS TABLE
CREATE TABLE IF NOT EXISTS consumers (
    id SERIAL PRIMARY KEY, 
    username VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    purok_no INTEGER,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. METER READERS TABLE
CREATE TABLE IF NOT EXISTS meter_readers (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CONSUMPTION LOGS TABLE
CREATE TABLE IF NOT EXISTS consumption (
    id SERIAL PRIMARY KEY,
    consumer_id INTEGER NOT NULL REFERENCES consumers (id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    previous_reading NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    present_reading NUMERIC(10,2) NOT NULL, 
    consumption NUMERIC(10,2) GENERATED ALWAYS AS (present_reading - previous_reading) STORED,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BILLING HISTORY TABLE
CREATE TABLE IF NOT EXISTS billing (
    id SERIAL PRIMARY KEY,
    consumption_id INTEGER NOT NULL REFERENCES consumption (id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES consumers (id) ON DELETE CASCADE,
    billing_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_bill NUMERIC(10,2) NOT NULL, 
    remaining_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'Unpaid',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- CREATE PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    billing_id INTEGER NOT NULL REFERENCES billing (id) ON DELETE CASCADE,
    total_paid NUMERIC(10,2) NOT NULL,
    remaining_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup queries when fetching payment logs by billing record
CREATE INDEX IF NOT EXISTS idx_payments_billing_id ON payments (billing_id);

-- 6. NOTIFICATIONS TABLE 
-- Updated to allow a targeted consumer_id (NULL tracks system-wide admin announcements)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    consumer_id INT REFERENCES consumers(id) ON DELETE CASCADE,
    announcement_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    announcement_date DATE NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS consumer_id INT REFERENCES consumers(id) ON DELETE CASCADE;

-- Indexes for lightning-fast queries when filtering notifications by target consumer
CREATE INDEX IF NOT EXISTS notifications_consumer_id_idx 
ON notifications (consumer_id);

-- 7. NOTIFICATION READS (Junction table to handle isolated read/unread telemetry)
CREATE TABLE IF NOT EXISTS notification_reads (
    notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    consumer_id INT NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    dismissed_at TIMESTAMPTZ,
    PRIMARY KEY (notification_id, consumer_id)
);

ALTER TABLE notification_reads
ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS notification_reads_consumer_id_idx 
ON notification_reads (consumer_id);

-- 8. AUTOMATED TRIGGER FUNCTION (Updated to map consumer_id context onto billing alerts)
CREATE OR REPLACE FUNCTION generate_billing_announcement()
RETURNS TRIGGER AS $$
DECLARE
    consumer_name VARCHAR(100);
    calculated_bill NUMERIC(10,2);
    base_rate CONSTANT NUMERIC(10,2) := 15.00; 
BEGIN
    SELECT full_name INTO consumer_name 
    FROM consumers 
    WHERE id = NEW.consumer_id;

    calculated_bill := NEW.consumption * base_rate;

    INSERT INTO notifications (
        consumer_id,
        announcement_type,
        title,
        announcement_date,
        message,
        created_at,
        updated_at
    ) VALUES (
        NEW.consumer_id,
        'Billing Alert',
        'New Consumption Record Posted',
        CURRENT_DATE,
        format('Hello %s, a new meter reading has been logged for %s. Previous: %s, Present: %s. Total Consumption: %s units. Estimated Bill: ₱%s.', 
            consumer_name, 
            NEW.reading_date, 
            NEW.previous_reading, 
            NEW.present_reading, 
            NEW.consumption,
            calculated_bill
        ),
        NOW(),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. TRIGGER BINDING
DROP TRIGGER IF EXISTS trg_after_consumption_insert ON consumption;

CREATE TRIGGER trg_after_consumption_insert
AFTER INSERT ON consumption
FOR EACH ROW
EXECUTE FUNCTION generate_billing_announcement();

-- 10. GEMINI AI CONSUMPTION PREDICTION CACHE
-- Stores the latest generated result for each forecast type. The backend
-- compares source_signature with the current consumption dataset before reuse.
CREATE TABLE IF NOT EXISTS ai_consumption_predictions (
    id BIGSERIAL PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    scope VARCHAR(30) NOT NULL CHECK (
        scope IN ('overall', 'all-puroks', 'purok')
    ),
    prediction_period VARCHAR(10) NOT NULL CHECK (
        prediction_period IN ('monthly', 'yearly')
    ),
    purok VARCHAR(100),
    prediction_payload JSONB NOT NULL,
    source_signature VARCHAR(255) NOT NULL,
    source_record_count INTEGER NOT NULL DEFAULT 0,
    latest_consumption_id INTEGER REFERENCES consumption(id) ON DELETE SET NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_predictions_scope_period
ON ai_consumption_predictions (scope, prediction_period);

CREATE INDEX IF NOT EXISTS idx_ai_predictions_latest_consumption
ON ai_consumption_predictions (latest_consumption_id);

-- 11. GEMINI AI CONSUMPTION ANOMALY CACHE
-- Reuses an analysis while its source_signature still matches consumption.
CREATE TABLE IF NOT EXISTS ai_consumption_anomalies (
    id BIGSERIAL PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    scope VARCHAR(30) NOT NULL CHECK (
        scope IN ('overall', 'all-puroks', 'purok')
    ),
    analysis_period VARCHAR(10) NOT NULL CHECK (
        analysis_period IN ('monthly', 'yearly')
    ),
    purok VARCHAR(100),
    anomaly_payload JSONB NOT NULL,
    source_signature VARCHAR(255) NOT NULL,
    source_record_count INTEGER NOT NULL DEFAULT 0,
    latest_consumption_id INTEGER REFERENCES consumption(id) ON DELETE SET NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_anomalies_scope_period
ON ai_consumption_anomalies (scope, analysis_period);

CREATE INDEX IF NOT EXISTS idx_ai_anomalies_latest_consumption
ON ai_consumption_anomalies (latest_consumption_id);

-- 12. GEMINI AI CONSUMPTION RECOMMENDATION CACHE
-- Reuses recommendations while the underlying consumption data is unchanged.
CREATE TABLE IF NOT EXISTS ai_consumption_recommendations (
    id BIGSERIAL PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    scope VARCHAR(30) NOT NULL CHECK (
        scope IN ('overall', 'all-puroks', 'purok')
    ),
    recommendation_period VARCHAR(10) NOT NULL CHECK (
        recommendation_period IN ('monthly', 'yearly')
    ),
    purok VARCHAR(100),
    recommendation_payload JSONB NOT NULL,
    source_signature VARCHAR(255) NOT NULL,
    source_record_count INTEGER NOT NULL DEFAULT 0,
    latest_consumption_id INTEGER REFERENCES consumption(id) ON DELETE SET NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_scope_period
ON ai_consumption_recommendations (scope, recommendation_period);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_latest_consumption
ON ai_consumption_recommendations (latest_consumption_id);
