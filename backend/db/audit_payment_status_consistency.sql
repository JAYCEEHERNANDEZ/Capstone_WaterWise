-- Read-only audit for billing and payment status inconsistencies.
-- This script does not update or delete any financial records.

WITH payment_totals AS (
    SELECT
        billing_id,
        COUNT(*) AS payment_count,
        ROUND(SUM(total_paid), 2) AS total_paid
    FROM payments
    GROUP BY billing_id
),
latest_payments AS (
    SELECT DISTINCT ON (billing_id)
        billing_id,
        id AS latest_payment_id,
        remaining_balance AS latest_payment_balance,
        payment_date AS latest_payment_date,
        created_at AS latest_payment_created_at
    FROM payments
    ORDER BY billing_id, created_at DESC, id DESC
),
billing_audit AS (
    SELECT
        billing.id AS billing_id,
        billing.user_id AS consumer_id,
        billing.status AS current_bill_status,
        billing.total_bill,
        billing.remaining_balance AS current_bill_balance,
        COALESCE(payment_totals.payment_count, 0) AS payment_count,
        COALESCE(payment_totals.total_paid, 0) AS recorded_total_paid,
        latest_payments.latest_payment_id,
        latest_payments.latest_payment_balance,
        latest_payments.latest_payment_date,
        latest_payments.latest_payment_created_at,
        CASE
            WHEN billing.remaining_balance = 0 THEN 'Paid'
            WHEN COALESCE(payment_totals.total_paid, 0) > 0 THEN 'Partially Paid'
            ELSE 'Unpaid'
        END AS expected_bill_status,
        ROUND(billing.total_bill - billing.remaining_balance, 2) AS bill_calculated_paid
    FROM billing
    LEFT JOIN payment_totals ON payment_totals.billing_id = billing.id
    LEFT JOIN latest_payments ON latest_payments.billing_id = billing.id
)
SELECT
    billing_audit.*,
    (current_bill_status IS DISTINCT FROM expected_bill_status) AS has_status_mismatch,
    (recorded_total_paid <> bill_calculated_paid) AS has_payment_total_mismatch,
    (
        latest_payment_id IS NOT NULL
        AND latest_payment_balance <> current_bill_balance
    ) AS has_latest_snapshot_mismatch
FROM billing_audit
WHERE current_bill_status IS DISTINCT FROM expected_bill_status
   OR recorded_total_paid <> bill_calculated_paid
   OR (
       latest_payment_id IS NOT NULL
       AND latest_payment_balance <> current_bill_balance
   )
ORDER BY billing_id;
