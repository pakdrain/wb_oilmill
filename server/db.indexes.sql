
-- Performance indexes for weighbridge system
-- Run these SQL commands in your PostgreSQL database to improve performance

-- Index for offline entries query
CREATE INDEX IF NOT EXISTS idx_wb_offline_entry ON wb_weighbridge(offline_entry, creation_date, wb_id) WHERE offline_entry = 'Yes';

-- Index for first weight records query  
CREATE INDEX IF NOT EXISTS idx_wb_first_weight ON wb_weighbridge(first_weight, second_weight, creation_date, wb_id) WHERE first_weight IS NOT NULL AND first_weight > 0;

-- Index for branch filtering
CREATE INDEX IF NOT EXISTS idx_wb_branch_id ON wb_weighbridge(branch_id);

-- Index for slip number searches
CREATE INDEX IF NOT EXISTS idx_wb_slip_no ON wb_weighbridge(slip_no);

-- Index for vehicle number searches in items table
CREATE INDEX IF NOT EXISTS idx_wbi_vehicle_no ON wb_weighbridge_items_purchase(vehicle_no);

-- Index for vendor name searches in items table
CREATE INDEX IF NOT EXISTS idx_wbi_vendor_name ON wb_weighbridge_items_purchase(vendor_name);

-- Composite index for common joins
CREATE INDEX IF NOT EXISTS idx_wbi_wb_id ON wb_weighbridge_items_purchase(wb_id);
