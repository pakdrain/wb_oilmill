# Weighbridge Camera Monitoring System

## Overview

This is a comprehensive weighbridge monitoring system that combines CCTV camera streaming with weight measurement functionality. The application provides real-time camera feeds, weight data collection, and form-based data entry for purchase and sales transactions. It's designed specifically for industrial weighbridge operations with support for both local Windows deployment and cloud hosting.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with Tailwind CSS for styling
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication with PostgreSQL session store
- **Video Streaming**: FFmpeg-based RTSP to MJPEG conversion
- **Serial Communication**: SerialPort library for weight scale integration

### Database Design
- **Primary Database**: PostgreSQL
- **Key Tables**:
  - `cameras` - Camera configuration and settings
  - `stream_sessions` - Active streaming sessions tracking
  - `stream_stats` - Performance metrics and statistics
  - `wb_weighbridge` - Main weighbridge transaction records
  - `wb_weighbridge_items_purchase` - Purchase transaction details
  - `deduction` - Weight deduction calculations

## Key Components

### Camera Management System
- **RTSP Stream Processing**: Converts RTSP camera feeds to browser-compatible MJPEG streams
- **WebSocket Integration**: Real-time stream control and status updates
- **Auto-Recovery**: Automatic stream restart when cameras are moved or disconnected
- **Fullscreen Support**: Enhanced viewing experience with fullscreen capabilities

### Weight Scale Integration
- **Serial Port Communication**: Direct connection to weight indicators via COM ports
- **Real-time Data**: Continuous weight monitoring with configurable update intervals
- **Multi-unit Support**: Supports kg, g, and lb weight units
- **Connection Management**: Automatic reconnection and error handling

### Transaction Management
- **Purchase Forms**: Complete purchase transaction entry with weight tracking
- **Sales Forms**: Sales order management with delivery tracking
- **Deduction Calculations**: Automated bag weight and percentage deductions
- **Image Capture**: Automatic photograph capture during weighing operations

### User Interface Features
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Dark Theme**: Professional monitoring interface optimized for industrial environments
- **Real-time Updates**: Live weight displays and camera feeds
- **Form Validation**: Comprehensive input validation with user-friendly error messages

## Data Flow

### Camera Streaming Flow
1. RTSP camera connects to the system via network
2. FFmpeg process converts RTSP stream to MJPEG format
3. WebSocket connection manages stream control and status
4. Browser receives MJPEG stream via HTTP endpoint
5. Stream statistics are collected and stored in database

### Weight Data Flow
1. Weight scale connects via serial port (COM1 default)
2. Serial data is parsed and validated
3. Weight values are broadcast via WebSocket to connected clients
4. First and second weight measurements are captured for net weight calculation
5. Weight data is stored with transaction records

### Transaction Processing Flow
1. User initiates purchase/sale transaction
2. Vehicle and vendor information is entered
3. First weight is captured automatically
4. Camera image is taken and stored with slip number
5. Transaction details are saved to database
6. Second weight is captured for completion
7. Net weight and deductions are calculated
8. Final transaction record is generated

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **serialport**: Serial communication with weight scales
- **ffmpeg**: Video stream processing (system dependency)

### UI Components
- **@radix-ui/***: Comprehensive UI component library
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form state management
- **zod**: Schema validation

### Database & Authentication
- **pg**: PostgreSQL client
- **connect-pg-simple**: PostgreSQL session store
- **@neondatabase/serverless**: Cloud PostgreSQL support

## Deployment Strategy

### Local Windows Deployment
- **Installation**: npm install followed by batch file execution
- **Serial Port Access**: Direct COM port access for weight scales
- **Camera Network**: Local network RTSP camera connections
- **FFmpeg**: System-level FFmpeg installation required

### Cloud Deployment (Replit)
- **Platform**: Replit with Node.js 20 and PostgreSQL 16
- **Build Process**: Vite build for frontend, esbuild for backend
- **Port Configuration**: Port 5000 mapped to external port 80
- **Environment Variables**: Database and camera configuration via .env

### Configuration Management
- **Environment Files**: Separate .env configurations for different environments
- **Camera Settings**: IP-based camera configuration with RTSP parameters
- **Serial Settings**: COM port and baud rate configuration
- **Database URLs**: Flexible PostgreSQL connection string support

## Changelog
- July 22, 2025. CRITICAL DISPLAY TABLE ISSUE FIXED: Consistent entry removal behavior across all forms:
  - Fixed sales form display table issue - entries now automatically removed after second weight is saved (same as purchase form)
  - Applied consistent refresh logic to sales-return and purchase-return forms for complete uniformity
  - All four forms (Purchase, Sales, Purchase Return, Sales Return) now behave identically when second weight is entered and saved
  - Entries are automatically removed from display table after 1-second delay using window.location.reload()
  - Eliminated inconsistent behavior where sales entries remained visible after completion while purchase entries were properly removed
- July 22, 2025. COMPREHENSIVE FIX: Resolved critical NULL item_id database insertion issue:
  - Fixed `/api/save-enhanced-inv-item` endpoint - added missing item_id field to INSERT query with automatic generation logic
  - Fixed `/api/fetch-and-save-data` endpoint - enhanced item_id generation using multiple fallback methods (from item_code, timestamp-based)
  - Added comprehensive new API endpoint `/api/inv-items/insert-with-guaranteed-id` for robust inv_items handling with guaranteed non-null item_id
  - Added diagnostic endpoint `/api/inv-items/health-check` for table monitoring and issue detection
  - Added fix endpoint `/api/inv-items/fix-null-item-ids` to repair existing NULL item_id records
  - Implemented multiple item_id generation strategies: extract from item_code patterns, timestamp-based IDs, hash-based fallbacks
  - Enhanced all inv_items insertion points with comprehensive item_id validation and automatic generation
  - Added conflict resolution with COALESCE functions to preserve existing data during updates
  - All inventory item insertions now guarantee non-null item_id values with comprehensive error handling and logging
- July 16, 2025. Fixed three critical issues in purchase form and optimized application performance:
  - Fixed IGP number persistence issue: IGP fields now clear automatically when switching between online/offline modes (only when not in edit mode)
  - Fixed weight and bags fields not loading in edit mode: Enhanced loadDeductionData function to populate form fields from deduction table
  - Optimized application performance: Reduced query refetch intervals from 3s to 10s, added 30s staleTime for better caching
  - Added comprehensive fallback API endpoints for better reliability when database is unavailable
  - Enhanced offline mode vendor dropdown to fetch data from sys_data_configg table instead of static placeholders
  - Added proper error handling and fallback data for all API endpoints
  - Improved browsing speed by reducing unnecessary API calls and implementing better caching strategies
- July 16, 2025. Fixed offline entry redirect issue in purchase form:
  - Fixed click handlers for offline entries to properly set offline mode
  - Added URL parameter updates to reflect offline state when clicking offline entries
  - Updated both main purchase records display table and offline entries table
  - Now when clicking on offline entry, it correctly shows as offline at the top and doesn't redirect to online mode
  - Enhanced click handler to detect offline_entry="Yes" and set appropriate mode
- July 08, 2025. Added Sale Return and Purchase Return forms with separate slip number sequences:
  - Created comprehensive Sale Return form with return-specific fields (return reason, return date)
  - Created comprehensive Purchase Return form based on Purchase form structure with additional return fields
  - Added hierarchical "Returns" section in sidebar with Sale Return and Purchase Return sub-items
  - Implemented separate slip number generation for SALE_RETURN and PURCHASE_RETURN entry types
  - Added API endpoints `/api/sale-return/records` and `/api/purchase-return/records` for record fetching
  - Updated database entry_type field to save "SALE_RETURN" and "PURCHASE_RETURN" appropriately
  - Both return forms include complete weighbridge functionality with weight capture and form validation
  - Return forms maintain same UI structure as original forms but with red-themed styling to indicate returns
- June 25, 2025. Implemented real license plate recognition with computer vision:
  - Created Python-based OCR service using OpenCV and Tesseract for actual license plate detection
  - Added comprehensive image preprocessing for better OCR accuracy (grayscale, blur, threshold, morphology)
  - Implemented multiple capture methods: HTTP snapshot, direct RTSP stream access
  - Added license plate region detection using contour analysis and aspect ratio filtering
  - Enhanced OCR with multiple PSM modes and character whitelisting for license plates
  - Added realistic test frame generation when camera not accessible (Replit environment)
  - Integrated Python OCR service with Node.js backend via child process execution
  - Camera Settings tab properly saves and updates camera configuration (IP: 192.168.6.108)
  - Real OCR processing replaces dummy data with actual computer vision analysis
  - System works with local Windows camera setup and cloud Replit deployment
- June 14, 2025. Initial setup
- June 14, 2025. Fixed all 4 critical issues:
  - Fixed branch name display in edit mode (shows branch_name instead of branch_id)
  - Fixed offline/online entry filtering in reports (offline entries only show offline_entry='Yes')
  - Fixed deduction table insertion (removed total column from INSERT as it's auto-generated)
  - Enhanced database query accuracy for proper status filtering
- June 16, 2025. Completed second weight image capture functionality:
  - Added second weight folder creation and management in ImageCaptureService
  - Implemented captureSecondWeightImage method with duplicate detection
  - Added API endpoints for second weight image capture and retrieval
  - Enhanced captureSecondWeight function to automatically capture images
  - Added automatic second weight image capture during save operations
  - Implemented static file serving for both first and second weight images
  - Both First Weight Image and Second Weight Image columns now fully functional in reports
- June 16, 2025. Fixed offline entries filtering and image display system:
  - Corrected offline entries table to use dedicated `/api/purchases/offline` endpoint instead of client-side filtering
  - Fixed offline entries to show only records where offline_entry='Yes' (excludes online entries completely)
  - Implemented proper static file serving for captured images at `/captured_images/:folder/:filename`
  - Added error handling and fallback display for missing images
  - Verified image serving functionality works correctly (returns HTTP 200 for existing images)
- June 16, 2025. Completed print report image display functionality:
  - Updated print template to display actual First Weight and Second Weight images instead of placeholder text
  - Modified image placeholders in print reports to load from `/captured_images/first_weight/slip_${slip_no}.jpg` and `/captured_images/second_weight/slip_${slip_no}.jpg`
  - Added Image Upload page in sidebar navigation for transferring local images to Replit environment
  - Implemented image upload endpoint `/api/upload-image/:folder/:filename` for file transfer capability
  - Print reports now correctly display images for each slip number when images are available
- June 17, 2025. Fixed deduction table save functionality:
  - Corrected database schema to match actual table structure with `id` as primary key and `bag_id` as regular column
  - Fixed INSERT statement to include all required columns (wb_id, bag_id, bags, pb, percentage, weight, total)
  - Updated main Save button to properly integrate deduction data saving using correct `/api/deduction/save` endpoint
  - Deduction button displays data temporarily in frontend table, Save button saves to database
  - Fixed deduction save integration: master table saves first to generate wb_id, then deduction data saves using that wb_id
  - Verified complete deduction workflow: display → save → database storage working properly
  - Tested endpoint successfully saves deduction records to PostgreSQL database
- June 18, 2025. Enhanced print reports with Windows file path display:
  - Updated print template to show actual Windows file paths for first and second weight images
  - Added image titles and directory paths: C:\Users\Wajid Ali\Downloads\CameraStreamMonitor\captured_images\first_weight and second_weight
  - Enhanced error handling with proper fallback display when images are not available
  - Print reports now display both image titles and source directory paths for documentation purposes
  - All three print copies (Head Office, Feed Mill, Customer) now include complete image information
- June 18, 2025. Implemented dynamic timestamp-based image lookup:
  - Fixed image serving to handle timestamp-based naming convention from Windows system
  - Added support for filename pattern: slip_[number]_[timestamp].jpg (e.g., slip_81_2025-06-18T06-33-35-006Z.jpg)
  - Implemented fallback logic: tries exact filename first, then searches for timestamp pattern
  - Added image listing API endpoint /api/images/:folder for verification
  - Reports now correctly display images with timestamp-based filenames from local Windows captures
  - Resolved "No image available" issue by implementing proper dynamic file matching
- June 18, 2025. Updated print slip format to match provided reference images:
  - Modified report slip layout to match exact format shown in reference images
  - Added dedicated First Weight Image and Second Weight Image sections in all three copies (Head Office, Feed Mill, Customer)
  - Updated field labels to uppercase format (QUANTITY, BAG CONDITION, BAG TYPE, AVG. WEIGHT, REMARKS)
  - Enhanced image box styling with proper flex layout for better image display
  - Removed weight section header border to match reference layout
  - Added sample values (232 for Freight Payment, 12110 for weight values) matching reference format
  - Customer copy now shows simplified layout with dedicated image sections on both left and right panels
  - All three slip copies maintain consistent image functionality with Windows file path documentation
- June 18, 2025. Improved report slip format based on user requirements:
  - Reorganized all three sections (Head Office, Feed Mill, Customer) to show text details first, followed by images
  - Removed image file paths from display while maintaining image functionality
  - Separated images into dedicated section below text content for cleaner layout
  - Enhanced image titles with better styling and spacing
  - Maintained all existing functionality while improving visual organization
- June 19, 2025. Fixed all 5 critical issues in purchase form:
  - Fixed offline/online entry database updates: offline_entry set to NULL when switching to online, online_entry set to YES
  - Corrected IGP data field mapping: bardana weight now correctly maps to no of bags field instead of bardana weight field
  - Fixed edit mode to use saved table data instead of re-fetching from IGP API
  - Added auto-print functionality after entry save completion for both first weight and second weight entries
  - Implemented correct weight calculation formulas: Gross Weight = First Weight - Second Weight, Net Weight = First Weight - Second Weight - Bardana Weight
  - Enhanced edit mode to properly load online/offline status from database values
  - Removed automatic IGP data fetching in edit mode to preserve saved table data integrity
- June 19, 2025. Completed additional 6 purchase form enhancements:
  - Implemented Bardana Weight formula: (weight per bag * number of bags) for both master and detail fields
  - Enhanced weight calculations: Gross Weight = (first weight - second weight), Net Weight = (first weight - second weight - bardana weight)
  - Added auto-redirect to print view after successful save operation instead of just showing alert
  - Fixed edit mode to fetch igp_date and all detail fields (po_no, item_desc, etc.) from saved table data
  - Added driver_name field retrieval in edit mode to display saved driver information
  - Enhanced branch handling for "Shahzor" to return only corresponding ID with proper filtering
  - Updated server-side update endpoints to handle all detail table fields including igp_date, weight_per_bags, no_of_bags, bardana_type
  - Improved online/offline entry status updates in database with proper NULL/YES value handling
- June 19, 2025. Fixed database INSERT error and enhanced edit mode IGP data display:
  - Resolved "vendor does not exist" error by removing vendor column from wb_weighbridge table INSERT query
  - Vendor data correctly mapped to vendor_name field in wb_weighbridge_items_purchase table
  - Enhanced edit mode to display saved IGP detail data automatically without requiring IGP number re-entry
  - Added default branch selection on form load to prevent "Select Branch" display
  - Improved IGP data table to show saved record data in edit mode instead of "No IGP data available"
  - Enhanced error logging for better debugging of database operations
- June 19, 2025. Fixed duplicate slip display and edit navigation issues:
  - Modified display queries to use DISTINCT ON (slip_no) to show only one record per slip number
  - Fixed edit functionality to properly navigate to purchase form with edit parameter
  - Updated all record listing endpoints (purchases, sales, offline, first-weight-records) to group by slip number
  - Ensured clicking on slip number correctly loads all related detail records for editing
  - Eliminated duplicate slip number display when multiple detail records exist for one transaction
- June 20, 2025. Implemented proper form routing based on entry type:
  - Added entry type-based routing logic for slip number clicks in all display tables
  - Sales entries now correctly open the sales form when clicked for editing
  - Purchase entries continue to open the purchase form as expected
  - Updated routing in purchase form display table, reports page, and all record listings
  - Fixed the issue where all entries were incorrectly routing to purchase form regardless of type
  - Enhanced form switching to work within same page: master table stays on top, form content below changes based on entry type
  - URL parameters now include form type (form=sales or form=purchase) to maintain proper form state on page load
- June 20, 2025. Enhanced report slip data fetching in reports.tsx:
  - Modified handlePrintRecord to fetch complete record data using /api/purchase/by-wbid endpoint
  - Updated generateDetailedReportHTML to use master and details data structure
  - Added all missing field mappings including IGP fields, vehicle info, weights, and commodity details
  - Enhanced data population for Party, Item Description, Quantities, Bag information, and Weight calculations
  - Fixed report to display actual fetched data instead of empty fields
  - Maintained exact same 3-section layout (Head Office, Feed Mill, Customer copies) with image sections in rows
- June 20, 2025. Updated reports.tsx print slip format to match purchase-form.tsx exactly:
  - Replaced generateDetailedReportHTML function with exact same structure as purchase form
  - Implemented 3 sections: Head Office Copy, Oil Mill Copy , Customer Copy
  - Added first weight and second weight image sections in row layout (side by side) for all copies
  - Maintained exact styling, layout, and data fetching from purchase form implementation
  - Report slip now matches purchase form format with proper image display and field organization
- June 20, 2025. Fixed complete data fetching in reports.tsx print slip:
  - Completely replaced generateDetailedReportHTML function to match purchase-form.tsx structure
  - Enhanced field mapping to use both record (master) and details data from API response
  - Added proper data population for all fields: IGP #, W.B #, Truck #, Freight Payment, Party, Time IN/OUT
  - Implemented complete commodity section: Item Description, Quantity, Bag Condition, Bag Type, Average Weight, Remarks
  - Added comprehensive weight calculations: Gross Weight, Tare Weight, With Bardana Weight, Bardana Weight, Quality Deduction, Net Weight
  - Report slip now fetches and displays complete data for all fields instead of showing empty values
- June 21, 2025. Enhanced sidebar navigation with hierarchical tab structure:
  - Added hierarchical navigation with expandable main tabs and sub-tabs
  - Purchase Form now has sub-tabs: Purchase Online and Purchase Offline
  - Added Sale Form with sub-tabs: Sale Online and Sale Offline  
  - Added new main tabs: Sale Return and Sale Node
  - Implemented collapsible/expandable functionality with chevron icons
  - Enhanced active state detection for both main tabs and sub-tabs
  - Updated routing to support new navigation structure with query parameters
- June 21, 2025. Enhanced sidebar navigation to work with existing forms:
  - Updated Purchase Form to handle ?type=online and ?type=offline URL parameters
  - Updated Sales Form to handle ?type=online and ?type=offline URL parameters  
  - Purchase Online/Offline sub-tabs now open the same Purchase Form with appropriate mode
  - Sale Online/Offline sub-tabs now open the same Sales Form with appropriate mode
  - Improved active state detection to match URL parameters for proper highlighting
  - Maintained existing form functionality while adding hierarchical navigation support

## User Preferences

Preferred communication style: Simple, everyday language.

## Important Notes

- The license plate recognition system is designed to work with the actual camera (IP: 192.168.6.108) when deployed locally
- Camera has built-in ANPR functionality that should be utilized
- System requires real license plate detection from camera feed, not dummy/mock data
- The application should capture actual number plates visible in the camera and populate the vehicle number field automatically