#!/usr/bin/env bash
# =============================================================================
# bootstrap_tf_backend.sh
# Creates an S3 bucket and DynamoDB table for Terraform remote state locking
# =============================================================================
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-south-1}"
RANDOM_SUFFIX=$(openssl rand -hex 4 2>/dev/null || date +%s | tail -c 8)
BUCKET_NAME="${1:-ai-question-paper-tf-state-${RANDOM_SUFFIX}}"
DYNAMODB_TABLE="${2:-ai-question-paper-tf-locks}"

echo "====================================================================="
echo " Bootstrapping Terraform Remote Backend on AWS (${AWS_REGION})"
echo " Bucket:   ${BUCKET_NAME}"
echo " DynamoDB: ${DYNAMODB_TABLE}"
echo "====================================================================="

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "Error: aws CLI is not installed. Please install it first."
    exit 1
fi

# 1. Create S3 Bucket
echo "Creating S3 bucket..."
if [ "${AWS_REGION}" == "us-east-1" ]; then
    aws s3api create-bucket \
        --bucket "${BUCKET_NAME}" \
        --region "${AWS_REGION}"
else
    aws s3api create-bucket \
        --bucket "${BUCKET_NAME}" \
        --region "${AWS_REGION}" \
        --create-bucket-configuration LocationConstraint="${AWS_REGION}"
fi

# Enable Bucket Versioning (Preserve state history)
echo "Enabling S3 bucket versioning..."
aws s3api put-bucket-versioning \
    --bucket "${BUCKET_NAME}" \
    --versioning-configuration Status=Enabled

# Enable Server-Side Encryption (AES256)
echo "Enabling S3 default server-side encryption..."
aws s3api put-bucket-encryption \
    --bucket "${BUCKET_NAME}" \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'

# Block All Public Access
echo "Blocking public access to S3 bucket..."
aws s3api put-public-access-block \
    --bucket "${BUCKET_NAME}" \
    --public-access-block-configuration '{
        "BlockPublicAcls": true,
        "IgnorePublicAcls": true,
        "BlockPublicPolicy": true,
        "RestrictPublicBuckets": true
    }'

# 2. Create DynamoDB Table for State Locking
echo "Creating DynamoDB state locking table..."
aws dynamodb create-table \
    --table-name "${DYNAMODB_TABLE}" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "${AWS_REGION}" \
    --tags Key=Project,Value=ai-question-paper-generator Key=ManagedBy,Value=Bootstrap

echo "Waiting for DynamoDB table to become ACTIVE..."
aws dynamodb wait table-exists --table-name "${DYNAMODB_TABLE}" --region "${AWS_REGION}"

echo "====================================================================="
echo "✅ Remote State Backend successfully provisioned!"
echo ""
echo "Next step: Configure terraform/backend.tf with:"
echo "---------------------------------------------------------------------"
echo "terraform {"
echo "  backend \"s3\" {"
echo "    bucket         = \"${BUCKET_NAME}\""
echo "    key            = \"production/terraform.tfstate\""
echo "    region         = \"${AWS_REGION}\""
echo "    dynamodb_table = \"${DYNAMODB_TABLE}\""
echo "    encrypt        = true"
echo "  }"
echo "}"
echo "---------------------------------------------------------------------"
echo "Then initialize Terraform:"
echo "  cd terraform && terraform init"
echo "====================================================================="
