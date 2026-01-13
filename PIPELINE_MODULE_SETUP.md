# Pipeline Module Setup Guide

This guide will help you set up the Pipeline module in your CRM system.

## Overview

The Pipeline module allows you to create and manage sales pipelines with customizable stages. Each pipeline can have multiple stages and can be configured with access controls.

## Database Migration

### Step 1: Run the SQL Migration

Execute the migration script to create the necessary database tables:

```bash
# Using psql
psql -U your_username -d summitly-crm -f database/migrations/006_create_pipeline_tables.sql

# Or using your database client
# Open database/migrations/006_create_pipeline_tables.sql and execute it
```

This will create the following tables:
- `pipelines` - Main pipeline configurations
- `pipeline_stages` - Stages within each pipeline
- `pipeline_access_users` - User access control for pipelines

### Step 2: Update Prisma Schema

The Prisma schema has been updated with the Pipeline models. Run:

```bash
npx prisma generate
```

This will regenerate the Prisma client with the new Pipeline models.

## Features

### Core Functionality

1. **Create Pipeline**
   - Add pipeline name and description
   - Define multiple stages for the pipeline
   - Set access controls (All users or Selected users)
   - Set status (Active/Inactive)

2. **Edit Pipeline**
   - Update pipeline details
   - Add, edit, or remove stages
   - Modify access controls

3. **Delete Pipeline**
   - Remove pipeline and all associated stages
   - Cascade delete ensures data integrity

4. **View Pipelines**
   - List all pipelines in a table
   - Search and filter pipelines
   - View pipeline statistics (deal value, number of deals)

### Pipeline Stages

- Each pipeline can have multiple stages
- Stages are ordered and can be reordered
- Stages can have custom colors (future enhancement)
- Stages can be added, edited, or deleted

### Access Control

- **All**: Pipeline is accessible to all users
- **Selected**: Pipeline is accessible only to selected users
- User selection can be managed through the pipeline edit modal

## API Endpoints

### GET /api/pipelines
Get list of pipelines with optional filters:
- `search` - Search by pipeline name
- `status` - Filter by status (Active/Inactive)
- `limit` - Number of results (default: 100)
- `offset` - Pagination offset (default: 0)
- `includeStages` - Include pipeline stages in response
- `includeAccessUsers` - Include access users in response

### POST /api/pipelines
Create a new pipeline:
```json
{
  "name": "Sales Pipeline",
  "description": "Main sales pipeline",
  "status": "Active",
  "accessType": "All",
  "stages": [
    { "name": "Lead", "order": 0 },
    { "name": "Qualified", "order": 1 },
    { "name": "Proposal", "order": 2 }
  ],
  "accessUserIds": []
}
```

### GET /api/pipelines/[id]
Get a single pipeline by ID

### PUT /api/pipelines/[id]
Update a pipeline

### DELETE /api/pipelines/[id]
Delete a pipeline

## Usage

1. Navigate to `/crm/pipeline` in your application
2. Click "Add Pipeline" to create a new pipeline
3. Fill in the pipeline details:
   - Pipeline Name (required)
   - Description (optional)
   - Add stages using the "Add New" button
   - Set access type (All or Selected users)
4. Click "Create New" to save

### Editing a Pipeline

1. Click the action menu (three dots) on any pipeline row
2. Select "Edit"
3. Make your changes
4. Click "Save Changes"

### Deleting a Pipeline

1. Click the action menu on any pipeline row
2. Select "Delete"
3. Confirm the deletion

## Future Enhancements

- Integration with Deals module to track actual deal values and counts
- Drag-and-drop stage reordering
- Custom stage colors
- Pipeline templates
- Stage-based automation rules
- Pipeline analytics and reporting

## Troubleshooting

### Migration Issues

If you encounter errors during migration:
1. Ensure you're connected to the correct database
2. Check that previous migrations have been applied
3. Verify database user has CREATE TABLE permissions

### API Errors

If API calls fail:
1. Check that Prisma client has been regenerated (`npx prisma generate`)
2. Verify database connection in your environment variables
3. Check browser console for detailed error messages

### UI Issues

If the pipeline modal doesn't open:
1. Ensure Bootstrap JavaScript is loaded
2. Check browser console for JavaScript errors
3. Verify all dependencies are installed

## Support

For issues or questions, please check:
- Database migration logs
- API response errors in browser network tab
- Server logs for detailed error messages
