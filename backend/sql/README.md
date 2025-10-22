# Supabase SQL Integration

The `party_requests.sql` file is no longer necessary as Supabase provides built-in tools for managing database schemas and migrations.

## Steps to Manage Database Schema in Supabase

1. **Create the `party_requests` Table**:
   - Use the Supabase dashboard or SQL editor to create the table with the following schema:
     ```sql
     CREATE TABLE party_requests (
         request_id SERIAL PRIMARY KEY,
         party_id INT NOT NULL,
         user_id INT NOT NULL,
         status VARCHAR(20) DEFAULT 'pending',
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
         FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
     );
     ```

2. **Enable Row-Level Security (RLS)**:
   - Enable RLS for the `party_requests` table.
   - Add policies for inserting, selecting, and updating requests.

3. **Use Supabase Client**:
   - Interact with the `party_requests` table using the Supabase client in your application.

## Benefits of Using Supabase
- Simplified schema management.
- Built-in authentication and security.
- Real-time updates for database changes.

For more details, refer to the [Supabase documentation](https://supabase.io/docs).