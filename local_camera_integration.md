# Local Camera Integration Guide

## Camera ANPR Integration

Your camera at IP 10.10.10.146 has built-in ANPR (Automatic Number Plate Recognition) functionality. The license plate recognition system is now configured to:

1. **Primary Method**: Use camera's built-in ANPR API
2. **Secondary Method**: Capture live images and perform OCR analysis
3. **Fallback Method**: Computer vision processing for license plate detection

## For Local Windows Deployment

When you run this system locally on Windows:

1. Ensure your camera is accessible on your local network (10.10.10.146 )
2. The system will automatically try these methods in order:
   - Camera ANPR API endpoints
   - Direct camera snapshot capture
   - RTSP stream capture with OCR processing

## Camera API Endpoints Tested

The system attempts to connect to your camera's ANPR functionality via:
- `http://admin:admin123@10.10.10.146/cgi-bin/anpr/info`
- `http://admin:admin123@10.10.10.146/cgi-bin/anpr/latest`
- `http://admin:admin123@10.10.10.146/anpr.cgi`

## Usage Instructions

1. Click the "Read" button next to Vehicle No field
2. The system will attempt to capture the license plate number from your camera
3. If successful, the vehicle number will be automatically populated
4. You'll see a success message with the detection method used

## Network Requirements

- Camera must be on the same network as the application
- Ports 80 (HTTP) and 554 (RTSP) must be accessible
- Camera credentials: admin/Abc@12345 (as configured)

## Troubleshooting

If license plate recognition fails:
- Ensure vehicle is positioned in camera view
- Check that license plate is clearly visible and well-lit
- Verify camera network connectivity
- Confirm camera ANPR feature is enabled