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
    contact_number VARCHAR(20),
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

ALTER TABLE consumption ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_consumption_idempotency_key
ON consumption (idempotency_key)
WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_consumption_consumer_month
ON consumption (
    consumer_id,
    EXTRACT(YEAR FROM reading_date),
    EXTRACT(MONTH FROM reading_date)
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
    amount_tendered NUMERIC(10,2) NOT NULL,
    change_given NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    remaining_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(40) NOT NULL DEFAULT 'Cash',
    reference_number VARCHAR(100),
    idempotency_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(40) NOT NULL DEFAULT 'Cash';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount_tendered NUMERIC(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS change_given NUMERIC(10,2) NOT NULL DEFAULT 0.00;

-- Index for fast lookup queries when fetching payment logs by billing record
CREATE INDEX IF NOT EXISTS idx_payments_billing_id ON payments (billing_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency_key
ON payments (idempotency_key)
WHERE idempotency_key IS NOT NULL;

-- Persistent report metadata and immutable source-data snapshots.
CREATE TABLE IF NOT EXISTS generated_reports (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    report_type VARCHAR(30) NOT NULL CHECK (
        report_type IN ('consumption', 'billing', 'residents', 'analytics')
    ),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    sections TEXT[] NOT NULL DEFAULT ARRAY['summary']::TEXT[],
    generated_by INTEGER NOT NULL REFERENCES admins (id) ON DELETE RESTRICT,
    record_count INTEGER NOT NULL DEFAULT 0 CHECK (record_count >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'Ready' CHECK (status IN ('Ready', 'Failed')),
    report_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Record a cumulative meter value and its billing as one transaction. The
-- initial previous value is accepted only when digitizing a consumer with no
-- earlier digital reading.
DROP FUNCTION IF EXISTS record_consumption_and_billing(INTEGER, DATE, NUMERIC, NUMERIC);
DROP FUNCTION IF EXISTS record_consumption_and_billing(INTEGER, DATE, NUMERIC, NUMERIC, TEXT);
CREATE OR REPLACE FUNCTION record_consumption_and_billing(
    p_consumer_id INTEGER,
    p_present_reading NUMERIC,
    p_initial_previous_reading NUMERIC,
    p_idempotency_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_consumer consumers%ROWTYPE;
    v_latest consumption%ROWTYPE;
    v_reading consumption%ROWTYPE;
    v_billing billing%ROWTYPE;
    v_previous NUMERIC(10,2);
    v_total NUMERIC(10,2);
    v_reading_date DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::DATE;
BEGIN
    IF p_consumer_id IS NULL OR p_present_reading IS NULL OR NULLIF(TRIM(p_idempotency_key), '') IS NULL THEN
        RAISE EXCEPTION 'Consumer, present reading, and request key are required.';
    END IF;
    IF p_present_reading < 0 OR (p_initial_previous_reading IS NOT NULL AND p_initial_previous_reading < 0) THEN
        RAISE EXCEPTION 'Meter readings must be non-negative numbers.';
    END IF;

    -- Serialize readings for the same consumer, including simultaneous first records.
    PERFORM pg_advisory_xact_lock(p_consumer_id);

    SELECT * INTO v_consumer FROM consumers WHERE id = p_consumer_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Consumer account not found.' USING ERRCODE = '23503'; END IF;
    IF COALESCE(v_consumer.status, 'active') <> 'active' THEN
        RAISE EXCEPTION 'Readings cannot be recorded for an inactive consumer.';
    END IF;
    IF v_consumer.purok_no IS NULL THEN
        RAISE EXCEPTION 'Assign the consumer to a purok before recording a reading.';
    END IF;

    SELECT * INTO v_reading
    FROM consumption
    WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
        IF v_reading.consumer_id <> p_consumer_id
           OR v_reading.reading_date <> v_reading_date
           OR v_reading.present_reading <> ROUND(p_present_reading, 2) THEN
            RAISE EXCEPTION 'This reading request key was already used for different details.';
        END IF;
        SELECT * INTO v_billing FROM billing WHERE consumption_id = v_reading.id;
        RETURN jsonb_build_object(
            'id', v_reading.id,
            'consumer_id', v_reading.consumer_id,
            'reading_date', v_reading.reading_date,
            'previous_reading', v_reading.previous_reading,
            'present_reading', v_reading.present_reading,
            'consumption', v_reading.consumption,
            'created_at', v_reading.created_at,
            'billing', to_jsonb(v_billing)
        );
    END IF;

    IF EXISTS (
        SELECT 1 FROM consumption
        WHERE consumer_id = p_consumer_id
          AND EXTRACT(YEAR FROM reading_date) = EXTRACT(YEAR FROM v_reading_date)
          AND EXTRACT(MONTH FROM reading_date) = EXTRACT(MONTH FROM v_reading_date)
    ) THEN
        RAISE EXCEPTION 'This consumer already has a consumption reading for the selected month.' USING ERRCODE = '23505';
    END IF;

    SELECT * INTO v_latest
    FROM consumption
    WHERE consumer_id = p_consumer_id
    ORDER BY reading_date DESC, id DESC
    LIMIT 1;

    IF FOUND THEN
        IF p_initial_previous_reading IS NOT NULL THEN
            RAISE EXCEPTION 'An initial previous reading may only be supplied for a consumer with no previous record.';
        END IF;
        IF v_reading_date <= v_latest.reading_date THEN
            RAISE EXCEPTION 'A reading has already been recorded for this consumer today or later.';
        END IF;
        v_previous := v_latest.present_reading;
    ELSE
        IF p_initial_previous_reading IS NULL THEN
            RAISE EXCEPTION 'Enter the previous logbook reading for this consumer''s first digital record.';
        END IF;
        v_previous := p_initial_previous_reading;
    END IF;

    IF p_present_reading < v_previous THEN
        RAISE EXCEPTION 'Present reading cannot be lower than the previous reading.';
    END IF;

    INSERT INTO consumption (consumer_id, reading_date, previous_reading, present_reading, idempotency_key)
    VALUES (p_consumer_id, v_reading_date, v_previous, p_present_reading, p_idempotency_key)
    RETURNING * INTO v_reading;

    v_total := ROUND(v_reading.consumption * 15, 2);
    INSERT INTO billing (
        consumption_id, user_id, billing_date, due_date, total_bill,
        remaining_balance, status
    ) VALUES (
        v_reading.id, p_consumer_id, v_reading_date, v_reading_date + 15,
        v_total, v_total, 'Unpaid'
    ) RETURNING * INTO v_billing;

    RETURN jsonb_build_object(
        'id', v_reading.id,
        'consumer_id', v_reading.consumer_id,
        'reading_date', v_reading.reading_date,
        'previous_reading', v_reading.previous_reading,
        'present_reading', v_reading.present_reading,
        'consumption', v_reading.consumption,
        'created_at', v_reading.created_at,
        'billing', to_jsonb(v_billing)
    );
END;
$$;

REVOKE ALL ON FUNCTION record_consumption_and_billing(INTEGER, NUMERIC, NUMERIC, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION record_consumption_and_billing(INTEGER, NUMERIC, NUMERIC, TEXT) FROM anon;
REVOKE ALL ON FUNCTION record_consumption_and_billing(INTEGER, NUMERIC, NUMERIC, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION record_consumption_and_billing(INTEGER, NUMERIC, NUMERIC, TEXT) TO service_role;

-- Existing installations receive the resident contact field without invalidating
-- legacy accounts. New accounts require it through backend validation.
ALTER TABLE consumers
ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_generated_reports_created_at
ON generated_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_reports_generated_by
ON generated_reports (generated_by);

-- Records a payment and updates its billing balance in one database transaction.
-- The row lock prevents two admins from spending the same remaining balance.
DROP FUNCTION IF EXISTS record_payment_transaction(INTEGER, NUMERIC, DATE, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION record_payment_transaction(
    p_billing_id INTEGER,
    p_amount NUMERIC,
    p_amount_tendered NUMERIC,
    p_payment_date DATE,
    p_payment_method TEXT,
    p_reference_number TEXT,
    p_idempotency_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    billing_record billing%ROWTYPE;
    payment_record payments%ROWTYPE;
    updated_billing billing%ROWTYPE;
    next_balance NUMERIC(10,2);
    next_status VARCHAR(30);
BEGIN
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be greater than zero.';
    END IF;

    IF p_amount_tendered IS NULL OR p_amount_tendered <= 0 THEN
        RAISE EXCEPTION 'Amount received must be greater than zero.';
    END IF;

    IF p_payment_method NOT IN ('Cash', 'GCash', 'Bank transfer') THEN
        RAISE EXCEPTION 'Unsupported payment method.';
    END IF;

    IF p_payment_date IS NULL THEN
        RAISE EXCEPTION 'Payment date is required.';
    END IF;

    IF p_payment_method <> 'Cash' AND NULLIF(TRIM(p_reference_number), '') IS NULL THEN
        RAISE EXCEPTION 'An electronic payment reference number is required.';
    END IF;

    IF p_payment_method = 'Cash' AND p_amount_tendered < p_amount THEN
        RAISE EXCEPTION 'Cash received cannot be lower than the amount applied.';
    END IF;

    IF p_payment_method <> 'Cash' AND ROUND(p_amount_tendered, 2) <> ROUND(p_amount, 2) THEN
        RAISE EXCEPTION 'Electronic payment must equal the amount applied to the bill.';
    END IF;

    IF p_idempotency_key IS NOT NULL THEN
        SELECT * INTO payment_record
        FROM payments
        WHERE idempotency_key = p_idempotency_key;

        IF FOUND THEN
            IF payment_record.billing_id <> p_billing_id
               OR payment_record.total_paid <> ROUND(p_amount, 2)
               OR payment_record.amount_tendered <> ROUND(p_amount_tendered, 2) THEN
                RAISE EXCEPTION 'This payment request key was already used for different payment details.';
            END IF;

            SELECT * INTO updated_billing
            FROM billing
            WHERE id = payment_record.billing_id;

            RETURN (to_jsonb(payment_record) - 'idempotency_key')
                || jsonb_build_object('billing', to_jsonb(updated_billing));
        END IF;
    END IF;

    SELECT * INTO billing_record
    FROM billing
    WHERE id = p_billing_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Billing record not found.';
    END IF;

    IF billing_record.remaining_balance <= 0 OR billing_record.status = 'Paid' THEN
        RAISE EXCEPTION 'This billing record is already fully paid.';
    END IF;

    IF p_amount > billing_record.remaining_balance THEN
        RAISE EXCEPTION 'Payment amount cannot exceed the remaining balance.';
    END IF;

    next_balance := ROUND(billing_record.remaining_balance - p_amount, 2);
    next_status := CASE WHEN next_balance = 0 THEN 'Paid' ELSE 'Partially Paid' END;

    INSERT INTO payments (
        billing_id,
        total_paid,
        amount_tendered,
        change_given,
        remaining_balance,
        payment_date,
        payment_method,
        reference_number,
        idempotency_key
    )
    VALUES (
        p_billing_id,
        ROUND(p_amount, 2),
        ROUND(p_amount_tendered, 2),
        CASE
            WHEN p_payment_method = 'Cash'
                THEN ROUND(p_amount_tendered - p_amount, 2)
            ELSE 0.00
        END,
        next_balance,
        p_payment_date,
        p_payment_method,
        NULLIF(TRIM(p_reference_number), ''),
        NULLIF(TRIM(p_idempotency_key), '')
    )
    RETURNING * INTO payment_record;

    UPDATE billing
    SET
        remaining_balance = next_balance,
        status = next_status,
        updated_at = NOW()
    WHERE id = p_billing_id
    RETURNING * INTO updated_billing;

    INSERT INTO notifications (
        consumer_id,
        announcement_type,
        notification_type,
        priority,
        title,
        announcement_date,
        message,
        billing_id,
        payment_id,
        action_path,
        event_key
    ) VALUES (
        billing_record.user_id,
        'Payment Alert',
        'payment_received',
        CASE WHEN next_balance = 0 THEN 'normal' ELSE 'high' END,
        CASE WHEN next_balance = 0 THEN 'Payment received' ELSE 'Partial payment received' END,
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::DATE,
        CASE
            WHEN next_balance = 0 THEN format(
                'We received your payment of PHP %s for bill #%s. This bill is now fully paid.',
                ROUND(p_amount, 2), p_billing_id
            )
            ELSE format(
                'We received your payment of PHP %s for bill #%s. Remaining balance: PHP %s.',
                ROUND(p_amount, 2), p_billing_id, next_balance
            )
        END,
        p_billing_id,
        payment_record.id,
        '/consumer/billing-ledger',
        format('payment-received:%s', payment_record.id)
    ) ON CONFLICT (event_key) DO NOTHING;

    RETURN (to_jsonb(payment_record) - 'idempotency_key')
        || jsonb_build_object('billing', to_jsonb(updated_billing));
END;
$$;

REVOKE ALL ON FUNCTION record_payment_transaction(INTEGER, NUMERIC, NUMERIC, DATE, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION record_payment_transaction(INTEGER, NUMERIC, NUMERIC, DATE, TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION record_payment_transaction(INTEGER, NUMERIC, NUMERIC, DATE, TEXT, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION record_payment_transaction(INTEGER, NUMERIC, NUMERIC, DATE, TEXT, TEXT, TEXT) TO service_role;

-- 6. NOTIFICATIONS TABLE 
-- Updated to allow a targeted consumer_id (NULL tracks system-wide admin announcements)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    consumer_id INT REFERENCES consumers(id) ON DELETE CASCADE,
    announcement_type VARCHAR(50) NOT NULL,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'announcement',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    title VARCHAR(255) NOT NULL,
    announcement_date DATE NOT NULL,
    message TEXT NOT NULL,
    billing_id INTEGER REFERENCES billing(id) ON DELETE SET NULL,
    consumption_id INTEGER REFERENCES consumption(id) ON DELETE SET NULL,
    payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
    action_path TEXT,
    event_key TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS consumer_id INT REFERENCES consumers(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50) NOT NULL DEFAULT 'announcement';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'normal';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS billing_id INTEGER REFERENCES billing(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS consumption_id INTEGER REFERENCES consumption(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_path TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS event_key TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'notifications_priority_check'
          AND conrelid = 'notifications'::regclass
    ) THEN
        ALTER TABLE notifications
        ADD CONSTRAINT notifications_priority_check
        CHECK (priority IN ('low', 'normal', 'high', 'critical'));
    END IF;
END;
$$;

-- Indexes for lightning-fast queries when filtering notifications by target consumer
CREATE INDEX IF NOT EXISTS notifications_consumer_id_idx 
ON notifications (consumer_id);
CREATE INDEX IF NOT EXISTS notifications_billing_id_idx ON notifications (billing_id);
CREATE INDEX IF NOT EXISTS notifications_type_date_idx
ON notifications (notification_type, announcement_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS notifications_event_key_idx
ON notifications (event_key);

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

-- Generate the notice from the completed billing row so its amount, due date,
-- and related IDs always match the consumer's actual bill.
CREATE OR REPLACE FUNCTION generate_billing_notification()
RETURNS TRIGGER AS $$
DECLARE
    consumer_name VARCHAR(100);
    reading_record consumption%ROWTYPE;
BEGIN
    SELECT full_name INTO consumer_name
    FROM consumers
    WHERE id = NEW.user_id;

    SELECT * INTO reading_record
    FROM consumption
    WHERE id = NEW.consumption_id;

    INSERT INTO notifications (
        consumer_id,
        announcement_type,
        notification_type,
        priority,
        title,
        announcement_date,
        message,
        billing_id,
        consumption_id,
        action_path,
        event_key
    ) VALUES (
        NEW.user_id,
        'Billing Alert',
        'bill_generated',
        'high',
        'New water bill available',
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::DATE,
        format(
            'Hello %s, your meter reading for %s has been recorded. Consumption: %s cubic meters. Amount due: PHP %s. Due date: %s.',
            consumer_name,
            reading_record.reading_date,
            reading_record.consumption,
            NEW.total_bill,
            NEW.due_date
        ),
        NEW.id,
        NEW.consumption_id,
        '/consumer/billing-ledger',
        format('bill-generated:%s', NEW.id)
    ) ON CONFLICT (event_key) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. TRIGGER BINDING
DROP TRIGGER IF EXISTS trg_after_consumption_insert ON consumption;
DROP TRIGGER IF EXISTS trg_after_billing_insert ON billing;
DROP FUNCTION IF EXISTS generate_billing_announcement();

CREATE TRIGGER trg_after_billing_insert
AFTER INSERT ON billing
FOR EACH ROW
EXECUTE FUNCTION generate_billing_notification();

CREATE OR REPLACE FUNCTION generate_consumer_status_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO notifications (
            consumer_id,
            announcement_type,
            notification_type,
            priority,
            title,
            announcement_date,
            message,
            action_path,
            event_key
        ) VALUES (
            NEW.id,
            'Account Alert',
            'account_status_changed',
            CASE WHEN NEW.status = 'inactive' THEN 'critical' ELSE 'high' END,
            CASE WHEN NEW.status = 'inactive' THEN 'Account deactivated' ELSE 'Account activated' END,
            (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::DATE,
            CASE
                WHEN NEW.status = 'inactive'
                    THEN 'Your WaterWise account has been deactivated. Contact the water district office if you need assistance.'
                ELSE 'Your WaterWise account is active again. You may now sign in and use the consumer portal.'
            END,
            '/consumer/profile-details',
            format('account-status:%s:%s:%s', NEW.id, NEW.status, txid_current())
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_consumer_status_update ON consumers;
CREATE TRIGGER trg_after_consumer_status_update
AFTER UPDATE OF status ON consumers
FOR EACH ROW
EXECUTE FUNCTION generate_consumer_status_notification();

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
