# Database Files

This folder contains all database-related files for the WrestleBet application.

## 📂 File Categories

### Schema Files
- `schema-updated-currency.sql` - Main database schema with WrestleCoin currency system
- `dynamic-system-schema.sql` - Dynamic betting system schema
- Various schema migration and update files

### Setup & Migration Scripts
- Database initialization scripts
- Schema migration files
- Table creation scripts

### Fixes & Maintenance
- `fix-database-triggers.sql` - Fixes database trigger conflicts
- `add-dynamic-pool-columns.sql` - Adds columns for dynamic betting pools
- Various database fix and maintenance scripts

### Emergency & Cleanup Scripts
- Emergency database fixes
- Data cleanup utilities
- RLS (Row Level Security) bypass scripts

## 🚀 Usage

1. **Initial Setup**: Use schema files to set up your Supabase database
2. **Migrations**: Run migration scripts when updating database structure
3. **Fixes**: Use fix scripts when encountering database issues
4. **Maintenance**: Regular cleanup and maintenance scripts

## ⚠️ Important Notes

- Always backup your database before running any scripts
- Test scripts in development environment first
- Some scripts require admin privileges in Supabase
- Run scripts in the order specified in documentation
