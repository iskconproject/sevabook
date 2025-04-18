#!/bin/bash

# This script runs the Supabase migrations to set up the database

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "Supabase CLI is not installed. Please install it first."
    echo "npm install -g supabase"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo ".env file not found. Please create one with your Supabase credentials."
    exit 1
fi

# Source the .env file to get the Supabase URL and key
source .env

# Run the migrations
echo "Running Supabase migrations..."
supabase db reset

echo "Migrations completed successfully!"
