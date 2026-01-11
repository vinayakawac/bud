#!/bin/bash

# Seed script for production database
# This creates the initial admin user and contact info

echo "Starting database seed..."

# Run Prisma migrations
npx prisma migrate deploy

# Run seed command
npx prisma db seed

echo "Database seeded successfully!"
