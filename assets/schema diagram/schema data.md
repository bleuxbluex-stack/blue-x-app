## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `full_name` | `text` |  Nullable |
| `avatar_url` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `role` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `date_of_birth` | `date` |  Nullable |
| `gender` | `text` |  Nullable |
| `preferred_lang` | `text` |  Nullable |
| `home_address` | `text` |  Nullable |
| `apartment_no` | `text` |  Nullable |
| `postal_code` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `canton` | `text` |  Nullable |
| `country` | `text` |  Nullable |
| `customer_id` | `text` |  Nullable |

## Table `organizations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `logo_url` | `text` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `organization_members`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `user_id` | `uuid` |  |
| `role` | `org_role` |  |
| `created_at` | `timestamptz` |  |

## Table `organization_invites`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `email` | `text` |  |
| `role` | `org_role` |  |
| `token` | `text` |  Unique |
| `invited_by` | `uuid` |  Nullable |
| `expires_at` | `timestamptz` |  |
| `accepted_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `clients`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `name` | `text` |  |
| `company` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `website` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `status` | `entity_status` |  |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `contractors`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `name` | `text` |  |
| `email` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `specialty` | `text` |  Nullable |
| `hourly_rate` | `numeric` |  Nullable |
| `notes` | `text` |  Nullable |
| `status` | `entity_status` |  |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `projects`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `client_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `status` | `project_status` |  |
| `start_date` | `date` |  Nullable |
| `due_date` | `date` |  Nullable |
| `owner_id` | `uuid` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `tasks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `project_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `status` | `task_status` |  |
| `priority` | `task_priority` |  |
| `assignee_id` | `uuid` |  Nullable |
| `due_date` | `date` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `documents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `project_id` | `uuid` |  Nullable |
| `client_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `file_path` | `text` |  |
| `mime_type` | `text` |  Nullable |
| `size_bytes` | `int8` |  Nullable |
| `ai_summary` | `text` |  Nullable |
| `uploaded_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `activity_log`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `actor_id` | `uuid` |  Nullable |
| `entity_type` | `text` |  |
| `entity_id` | `uuid` |  Nullable |
| `action` | `text` |  |
| `metadata` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `contracts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `client_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `value` | `numeric` |  Nullable |
| `status` | `contract_status` |  |
| `contract_date` | `date` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `jobs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `title` | `text` |  |
| `department` | `text` |  Nullable |
| `location` | `text` |  Nullable |
| `status` | `job_status` |  |
| `applicants` | `int4` |  |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `workflows`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  |
| `name` | `text` |  |
| `trigger_condition` | `text` |  Nullable |
| `status` | `workflow_status` |  |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `service_categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `icon` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `provider_services`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `provider_id` | `uuid` |  |
| `category_id` | `uuid` |  |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `price` | `numeric` |  |
| `price_type` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `bookings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `client_id` | `uuid` |  |
| `provider_id` | `uuid` |  |
| `provider_service_id` | `uuid` |  Nullable |
| `status` | `booking_status` |  |
| `scheduled_at` | `timestamptz` |  |
| `duration_hours` | `numeric` |  |
| `total_price` | `numeric` |  |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `quick_booking_enabled` | `bool` |  |
| `assigned_employee_id` | `uuid` |  Nullable |

## Table `reviews`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `booking_id` | `uuid` |  |
| `client_id` | `uuid` |  |
| `provider_id` | `uuid` |  |
| `rating` | `int4` |  |
| `comment` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `public_tenders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `client_id` | `uuid` |  |
| `category_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `budget` | `numeric` |  Nullable |
| `due_date` | `date` |  Nullable |
| `status` | `tender_status` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `tender_bids`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tender_id` | `uuid` |  |
| `provider_id` | `uuid` |  |
| `amount` | `numeric` |  |
| `proposal` | `text` |  Nullable |
| `status` | `bid_status` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `sender_id` | `uuid` |  |
| `receiver_id` | `uuid` |  |
| `booking_id` | `uuid` |  Nullable |
| `content` | `text` |  |
| `is_read` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `customer_profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `phone` | `text` |  Nullable |
| `address` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `postal_code` | `text` |  Nullable |
| `preferred_language` | `text` |  Nullable |
| `two_factor_enabled` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `provider_profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `skills` | `_text` |  Nullable |
| `experience_years` | `int4` |  Nullable |
| `hourly_rate` | `numeric` |  Nullable |
| `bio` | `text` |  Nullable |
| `languages` | `_text` |  Nullable |
| `verification_status` | `text` |  |
| `id_document_url` | `text` |  Nullable |
| `selfie_url` | `text` |  Nullable |
| `address_proof_url` | `text` |  Nullable |
| `certificates` | `_text` |  Nullable |
| `is_verified` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `provider_type` | `text` |  |
| `company_name` | `text` |  Nullable |
| `vat_number` | `text` |  Nullable |
| `business_registration_url` | `text` |  Nullable |
| `liability_insurance_url` | `text` |  Nullable |
| `business_registration_number` | `text` |  Nullable |
| `legal_representative` | `text` |  Nullable |
| `website` | `text` |  Nullable |
| `country` | `text` |  Nullable |
| `vat_certificate_url` | `text` |  Nullable |
| `company_logo_url` | `text` |  Nullable |
| `business_license_url` | `text` |  Nullable |

## Table `ocr_documents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `organization_id` | `uuid` |  Nullable |
| `document_name` | `text` |  |
| `document_type` | `text` |  |
| `category` | `text` |  |
| `file_url` | `text` |  Nullable |
| `cloudinary_public_id` | `text` |  Nullable |
| `thumbnail_url` | `text` |  Nullable |
| `extracted_text` | `text` |  Nullable |
| `confidence` | `numeric` |  Nullable |
| `auto_approved` | `bool` |  |
| `status` | `text` |  |
| `processing_time_ms` | `int4` |  Nullable |
| `language` | `text` |  Nullable |
| `file_size_bytes` | `int8` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Custom Types / Enums

### `org_role`

`owner` | `admin` | `member`

### `project_status`

`planning` | `active` | `on_hold` | `completed` | `cancelled`

### `task_status`

`todo` | `in_progress` | `blocked` | `done`

### `task_priority`

`low` | `medium` | `high` | `urgent`

### `entity_status`

`active` | `inactive` | `archived`

### `contract_status`

`draft` | `sent` | `signed` | `expired` | `cancelled`

### `job_status`

`open` | `interviewing` | `closed` | `paused`

### `workflow_status`

`active` | `paused`

### `booking_status`

`pending` | `confirmed` | `in_progress` | `completed` | `cancelled`

### `tender_status`

`open` | `bidded` | `closed` | `cancelled`

### `bid_status`

`pending` | `accepted` | `rejected`

## RLS Policies

### `profiles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `profiles readable by authenticated` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `users update own profile` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = id)` | `(auth.uid() = id)` |
| `users insert own profile` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = id)` |
| `operations users can update all profiles` | UPDATE | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM profiles profiles_1   WHERE ((profiles_1.id = auth.uid()) AND (profiles_1.role = 'operations'::text))))` | — |

### `organizations`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `members view their orgs` | SELECT | authenticated | PERMISSIVE | `is_org_member(id, auth.uid())` | — |
| `any authenticated can create org` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = created_by)` |
| `admins update org` | UPDATE | authenticated | PERMISSIVE | `is_org_admin(id, auth.uid())` | `is_org_admin(id, auth.uid())` |
| `owners delete org` | DELETE | authenticated | PERMISSIVE | `(org_role(id, auth.uid()) = 'owner'::org_role)` | — |
| `anyone can view organizations` | SELECT | authenticated | PERMISSIVE | `true` | — |

### `organization_members`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `members view org members` | SELECT | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |
| `admins insert members` | INSERT | authenticated | PERMISSIVE | — | `(is_org_admin(organization_id, auth.uid()) OR (user_id = auth.uid()))` |
| `admins update members` | UPDATE | authenticated | PERMISSIVE | `is_org_admin(organization_id, auth.uid())` | `is_org_admin(organization_id, auth.uid())` |
| `admins or self delete member` | DELETE | authenticated | PERMISSIVE | `(is_org_admin(organization_id, auth.uid()) OR (user_id = auth.uid()))` | — |

### `documents`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `members insert documents` | INSERT | authenticated | PERMISSIVE | — | `is_org_member(organization_id, auth.uid())` |
| `members view documents` | SELECT | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |
| `members update documents` | UPDATE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | `is_org_member(organization_id, auth.uid())` |
| `members delete documents` | DELETE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |

### `organization_invites`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `org members view invites` | SELECT | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |
| `admins create invites` | INSERT | authenticated | PERMISSIVE | — | `is_org_admin(organization_id, auth.uid())` |
| `admins delete invites` | DELETE | authenticated | PERMISSIVE | `is_org_admin(organization_id, auth.uid())` | — |
| `admins update invites` | UPDATE | authenticated | PERMISSIVE | `is_org_admin(organization_id, auth.uid())` | `is_org_admin(organization_id, auth.uid())` |

### `clients`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `members view clients` | SELECT | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |
| `members insert clients` | INSERT | authenticated | PERMISSIVE | — | `is_org_member(organization_id, auth.uid())` |
| `members update clients` | UPDATE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | `is_org_member(organization_id, auth.uid())` |
| `members delete clients` | DELETE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |

### `contractors`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `members view contractors` | SELECT | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |
| `members insert contractors` | INSERT | authenticated | PERMISSIVE | — | `is_org_member(organization_id, auth.uid())` |
| `members update contractors` | UPDATE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | `is_org_member(organization_id, auth.uid())` |
| `members delete contractors` | DELETE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |
| `anyone can view active contractors` | SELECT | authenticated | PERMISSIVE | `(status = 'active'::entity_status)` | — |

### `projects`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `members view projects` | SELECT | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |
| `members insert projects` | INSERT | authenticated | PERMISSIVE | — | `is_org_member(organization_id, auth.uid())` |
| `members update projects` | UPDATE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | `is_org_member(organization_id, auth.uid())` |
| `members delete projects` | DELETE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |

### `tasks`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `members view tasks` | SELECT | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |
| `members insert tasks` | INSERT | authenticated | PERMISSIVE | — | `is_org_member(organization_id, auth.uid())` |
| `members update tasks` | UPDATE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | `is_org_member(organization_id, auth.uid())` |
| `members delete tasks` | DELETE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |

### `activity_log`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `members view activity` | SELECT | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |
| `members insert activity` | INSERT | authenticated | PERMISSIVE | — | `(is_org_member(organization_id, auth.uid()) AND (actor_id = auth.uid()))` |

### `contracts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `members view contracts` | SELECT | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |
| `members insert contracts` | INSERT | authenticated | PERMISSIVE | — | `is_org_member(organization_id, auth.uid())` |
| `members update contracts` | UPDATE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | `is_org_member(organization_id, auth.uid())` |
| `members delete contracts` | DELETE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |

### `jobs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `members view jobs` | SELECT | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |
| `members insert jobs` | INSERT | authenticated | PERMISSIVE | — | `is_org_member(organization_id, auth.uid())` |
| `members update jobs` | UPDATE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | `is_org_member(organization_id, auth.uid())` |
| `members delete jobs` | DELETE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |

### `workflows`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `members view workflows` | SELECT | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |
| `members insert workflows` | INSERT | authenticated | PERMISSIVE | — | `is_org_member(organization_id, auth.uid())` |
| `members update workflows` | UPDATE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | `is_org_member(organization_id, auth.uid())` |
| `members delete workflows` | DELETE | authenticated | PERMISSIVE | `is_org_member(organization_id, auth.uid())` | — |

### `service_categories`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `service_categories readable by everyone` | SELECT | public | PERMISSIVE | `true` | — |
| `service_categories writable by authenticated` | ALL | authenticated | PERMISSIVE | `true` | — |

### `provider_services`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `provider_services readable by everyone` | SELECT | public | PERMISSIVE | `true` | — |
| `provider_services writable by authenticated` | ALL | authenticated | PERMISSIVE | `true` | — |

### `bookings`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `bookings viewable by authenticated` | SELECT | authenticated | PERMISSIVE | `true` | — |
| `bookings writable by authenticated` | ALL | authenticated | PERMISSIVE | `true` | — |

### `reviews`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `reviews viewable by everyone` | SELECT | public | PERMISSIVE | `true` | — |
| `reviews writable by authenticated` | ALL | authenticated | PERMISSIVE | `true` | — |

### `public_tenders`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `public_tenders viewable by everyone` | SELECT | public | PERMISSIVE | `true` | — |
| `public_tenders writable by authenticated` | ALL | authenticated | PERMISSIVE | `true` | — |

### `tender_bids`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `tender_bids viewable by everyone` | SELECT | public | PERMISSIVE | `true` | — |
| `tender_bids writable by authenticated` | ALL | authenticated | PERMISSIVE | `true` | — |

### `messages`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `messages viewable by sender or receiver` | SELECT | authenticated | PERMISSIVE | `((auth.uid() = sender_id) OR (auth.uid() = receiver_id))` | — |
| `messages insertable by sender` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = sender_id)` |

### `customer_profiles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `users read own customer profile` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `users update own customer profile` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `users insert own customer profile` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |

### `provider_profiles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `provider_profiles viewable by everyone` | SELECT | public | PERMISSIVE | `true` | — |
| `users update own provider profile` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `users insert own provider profile` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `operations users can update all provider profiles` | UPDATE | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'operations'::text))))` | — |

### `ocr_documents`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can view own or org OCR documents` | SELECT | authenticated | PERMISSIVE | `((auth.uid() = user_id) OR ((organization_id IS NOT NULL) AND (organization_id IN ( SELECT organization_members.organization_id    FROM organization_members   WHERE (organization_members.user_id = auth.uid())))) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'operations'::text]))))))` | — |
| `Users can insert own OCR documents` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `Users can update own OCR documents` | UPDATE | authenticated | PERMISSIVE | `((auth.uid() = user_id) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'operations'::text]))))))` | — |
| `Users can delete own OCR documents` | DELETE | authenticated | PERMISSIVE | `((auth.uid() = user_id) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'operations'::text]))))))` | — |