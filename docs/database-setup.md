# Database Setup Guide

This document explains how to set up the database for the SevaBook application.

## Overview

SevaBook uses Supabase as its database backend. The database schema includes tables for:

- **Users**: Store user profiles with roles
- **Inventory**: Store product information
- **Transactions**: Record sales/orders
- **Transaction Items**: Store items in each transaction
- **Barcode Settings**: Store barcode configuration
- **App Settings**: Store application settings

## Setup Instructions

### Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project in Supabase
3. **Supabase CLI**: Install the Supabase CLI

```bash
npm install -g supabase
```

### Running Migrations

1. **Clone the Repository**:
```bash
git clone https://github.com/your-username/sevabook.git
cd sevabook
```

2. **Create .env File**:
Create a `.env` file in the root directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. **Run Migrations**:
```bash
./scripts/run-migrations.sh
```

This will create all the necessary tables and set up the database schema.

## Database Schema

### Users Table

Stores user profiles with roles:

- `id`: UUID (Primary Key)
- `name`: TEXT
- `email`: TEXT
- `role`: TEXT ('superAdmin', 'admin', 'seller', 'manager')
- `status`: TEXT ('active', 'inactive', 'pending')
- `last_login`: TIMESTAMP
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Inventory Table

Stores product information:

- `id`: UUID (Primary Key)
- `name`: TEXT
- `category`: TEXT
- `language`: TEXT
- `price`: NUMERIC
- `stock`: INTEGER
- `description`: TEXT
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Transactions Table

Records sales/orders:

- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to users.id)
- `total`: NUMERIC
- `payment_method`: TEXT ('cash', 'upi', 'card')
- `payment_details`: JSONB
- `status`: TEXT ('pending', 'completed', 'cancelled')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Transaction Items Table

Stores items in each transaction:

- `id`: UUID (Primary Key)
- `transaction_id`: UUID (Foreign Key to transactions.id)
- `inventory_id`: UUID (Foreign Key to inventory.id)
- `quantity`: INTEGER
- `price`: NUMERIC
- `created_at`: TIMESTAMP

### Barcode Settings Table

Stores barcode configuration:

- `id`: UUID (Primary Key)
- `type`: TEXT ('CODE128', 'EAN13', 'UPC')
- `size`: TEXT ('50x25', '40x20', '60x30')
- `include_price`: BOOLEAN
- `include_title`: BOOLEAN
- `include_language`: BOOLEAN
- `custom_heading`: TEXT
- `user_id`: UUID (Foreign Key to users.id)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### App Settings Table

Stores application settings:

- `id`: UUID (Primary Key)
- `temple_name`: TEXT
- `receipt_header`: TEXT
- `receipt_footer`: TEXT
- `show_logo`: BOOLEAN
- `show_barcode`: BOOLEAN
- `custom_message`: TEXT
- `user_id`: UUID (Foreign Key to users.id)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Row Level Security (RLS)

The database uses Row Level Security (RLS) to control access to data:

- **Inventory**: Authenticated users can read, admins and managers can write
- **Transactions**: Authenticated users can read and create, admins can update and delete
- **Transaction Items**: Authenticated users can read and create
- **Barcode Settings**: Authenticated users can read, admins and managers can write
- **App Settings**: Authenticated users can read, admins can write

## Triggers

The database includes triggers to:

- Update inventory stock when a transaction is completed
- Update timestamps when records are updated
- Create user profiles when new users sign up
- Update last login time when users log in
