#!/bin/bash
# ============================================================
# VERITY — Deploy Edge Functions to Supabase (Kill Lovable)
# Run this ONCE to migrate all edge functions from Lovable
# to direct Supabase CLI deployment.
# ============================================================

set -e

PROJECT_REF="nhpbxlvogqnqutmflwlk"
FUNCTIONS_DIR="supabase/functions"

echo "╔══════════════════════════════════════════╗"
echo "║  VERITY — Edge Function Migration        ║"
echo "║  Deploying 21 functions to Supabase      ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Step 1: Check Supabase CLI
if ! command -v supabase &> /dev/null && ! npx supabase --version &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

echo "Supabase CLI version: $(supabase --version 2>/dev/null || npx supabase --version)"
echo ""

# Step 2: Login (interactive — will open browser)
echo "Step 1/3: Logging in to Supabase..."
echo "  → A browser window will open. Log in and copy the access token."
supabase login
echo ""

# Step 3: Link project
echo "Step 2/3: Linking to project $PROJECT_REF..."
supabase link --project-ref $PROJECT_REF
echo ""

# Step 4: Deploy all functions
echo "Step 3/3: Deploying all edge functions..."
echo ""

FUNCTIONS=(
    admin-moderation
    aggregate-stats
    agora-demo-token
    agora-token
    ai-moderate
    check-subscription
    collect-product-event
    create-checkout
    customer-portal
    delete-account
    export-my-data
    find-match
    generate-friend-invite
    generate-vapid-keys
    get-feature-flags
    rate-limit
    send-push
    spark-extend
    spark-reflection-ai
    stripe-webhook
    submit-appeal
)

DEPLOYED=0
FAILED=0

for func in "${FUNCTIONS[@]}"; do
    if [ -d "$FUNCTIONS_DIR/$func" ]; then
        echo -n "  Deploying $func... "
        if supabase functions deploy "$func" --project-ref $PROJECT_REF --no-verify-jwt 2>/dev/null; then
            echo "✓"
            ((DEPLOYED++))
        else
            echo "✗ (trying with verify-jwt)"
            if supabase functions deploy "$func" --project-ref $PROJECT_REF 2>/dev/null; then
                echo "    → Deployed with JWT verification"
                ((DEPLOYED++))
            else
                echo "    → FAILED"
                ((FAILED++))
            fi
        fi
    else
        echo "  Skipping $func (directory not found)"
    fi
done

echo ""
echo "════════════════════════════════════"
echo "  Deployed: $DEPLOYED / ${#FUNCTIONS[@]}"
echo "  Failed:   $FAILED"
echo "════════════════════════════════════"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ All functions deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Test the app at https://app.getverity.com.au"
    echo "  2. Remove getverity.com.au from Lovable custom domains"
    echo "  3. Cancel Lovable Pro subscription"
    echo "  4. Archive the Lovable project"
else
    echo "⚠️  Some functions failed. Check the errors above."
    echo "  You may need to deploy them individually:"
    echo "  supabase functions deploy <function-name> --project-ref $PROJECT_REF"
fi
