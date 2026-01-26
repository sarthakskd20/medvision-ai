# Implementation Plan: Real-Time Appointment Queue System

## Overview

This implementation plan breaks down the real-time appointment queue system into discrete, manageable coding tasks. The approach follows an incremental development strategy, building core functionality first, then adding real-time features, and finally integrating with the existing appointment system. Each task builds upon previous work to ensure continuous integration and testability.

The implementation will extend the existing FastAPI backend and Next.js frontend, adding WebSocket support, queue management, notification services, and enhanced UI components.

## Tasks

- [ ] 1. Set up database schema and models
  - [ ] 1.1 Create database migration for new columns in appointments table
    - Add meet_link_updated_at, patient_notified_at, waiting_room_joined_at, late_arrival_count, reassignment_history columns
    - _Requirements: 1.4, 5.5, 11.1_
  
  - [ ] 1.2 Create database migration for new columns in consultations table
    - Add waiting_room_entered_at, meet_link_at_consultation, patient_ready_at columns
    - _Requirements: 9.3, 11.1, 11.2_
  
  - [ ] 1.3 Create notifications table migration
    - Create table with id, patient_id, appointment_id, type, message, priority, read, created_at columns
    - Add indexes for patient_id, appointment_id, and read status
    - _Requirements: 10.1_
  
  - [ ] 1.4 Create Pydantic models for notifications and queue positions
    - Implement Notification, NotificationType, NotificationPriority, QueuePosition, ReassignmentEntry models
    - _Requirements: 10.2, 8.1, 5.5_
  
  - [ ] 1.5 Write property test for notification data completeness
    - **Property 28: Notification Data Completeness**
    - **Validates: Requirements 14.4**

- [ ] 2. Implement Queue Manager service
  - [ ] 2.1 Create QueueManager class with position calculation
    - Implement calculate_position, get_current_serving_token, get_patients_in_range methods
    - _Requirements: 8.1, 8.3_
  
  - [ ] 2.2 Write property test for queue position calculation
    - **Property 15: Queue Position Calculation Formula**
    - **Validates: Requirements 8.1**
  
  - [ ] 2.3 Implement token assignment and reassignment logic
    - Implement assign_new_token and reassign_patient methods with transaction handling
    - Ensure no duplicate tokens for same doctor/date
    - _Requirements: 5.4, 8.3_
  
  - [ ] 2.4 Write property test for token uniqueness
    - **Property 16: Token Uniqueness Invariant**
    - **Validates: Requirements 8.3**
  
  - [ ] 2.5 Write property test for token reassignment algorithm
    - **Property 12: Token Reassignment Algorithm**
    - **Validates: Requirements 5.4**
  
  - [ ] 2.6 Write unit tests for edge cases
    - Test empty queue, single patient, concurrent assignments
    - _Requirements: 8.3, 5.4_

- [ ] 3. Implement Meet Link Validator service
  - [ ] 3.1 Create MeetLinkValidator class with format validation
    - Implement validate_format using regex pattern for Google Meet URLs
    - Implement get_doctor_meet_link, update_meet_link, has_valid_meet_link methods
    - _Requirements: 9.1, 9.2_
  
  - [ ] 3.2 Write property test for meet link format validation
    - **Property 17: Meet Link Format Validation**
    - **Validates: Requirements 9.1**
  
  - [ ] 3.3 Write unit tests for meet link validation edge cases
    - Test invalid formats, missing protocols, malformed URLs
    - _Requirements: 9.1_

- [ ] 4. Implement Notification Service
  - [ ] 4.1 Create NotificationService class with notification methods
    - Implement send_position_update, send_your_turn, send_missed_appointment, send_meet_link_update methods
    - Implement store_notification and get_unread_notifications methods
    - _Requirements: 3.1, 3.2, 3.3, 5.2, 10.3_
  
  - [ ] 4.2 Write property test for notification read status update
    - **Property 20: Notification Read Status Update**
    - **Validates: Requirements 10.3**
  
  - [ ] 4.3 Write property test for no-show notification delivery
    - **Property 11: No-Show Notification Delivery**
    - **Validates: Requirements 5.2**
  
  - [ ] 4.4 Write unit tests for notification message formatting
    - Test exact message content for each notification type
    - _Requirements: 3.1, 3.2, 3.3, 5.2_

- [ ] 5. Checkpoint - Ensure all core service tests pass
  - Run all tests for Queue Manager, Meet Link Validator, and Notification Service
  - Verify database migrations apply successfully
  - Ensure all tests pass, ask the user if questions arise

- [ ] 6. Implement WebSocket server and manager
  - [ ] 6.1 Set up FastAPI WebSocket endpoint for queue updates
    - Create /ws/queue/{appointment_id} endpoint
    - Implement connection authentication using bearer token
    - _Requirements: 3.4_
  
  - [ ] 6.2 Create WebSocketManager class
    - Implement connect, disconnect, send_personal_message, broadcast_to_patients methods
    - Implement heartbeat mechanism for connection health
    - _Requirements: 3.4, 12.1_
  
  - [ ] 6.3 Write unit tests for WebSocket connection management
    - Test connection establishment, disconnection, message delivery
    - _Requirements: 3.4, 12.1_

- [ ] 7. Implement REST API endpoints for queue management
  - [ ] 7.1 Create POST /api/consultation/{consultation_id}/update-meet-link endpoint
    - Validate meet link format
    - Update doctor settings
    - Notify next 10 patients in queue
    - _Requirements: 1.3, 9.2_
  
  - [ ] 7.2 Write property test for meet link update notifications
    - **Property 2: Meet Link Update Notifications**
    - **Validates: Requirements 1.3**
  
  - [ ] 7.3 Create GET /api/consultation/queue/notifications/{appointment_id} endpoint
    - Retrieve all notifications for appointment
    - Return unread count
    - _Requirements: 10.4_
  
  - [ ] 7.4 Create POST /api/consultation/{consultation_id}/mark-no-show endpoint
    - Mark appointment as no-show
    - Send missed appointment notification
    - _Requirements: 5.1, 5.2_
  
  - [ ] 7.5 Write property test for no-show marking
    - **Property 10: No-Show Marking for Absent Patients**
    - **Validates: Requirements 5.1**
  
  - [ ] 7.6 Create POST /api/appointments/{appointment_id}/reassign-queue endpoint
    - Validate reassignment eligibility
    - Assign new token number
    - Record reassignment history
    - _Requirements: 5.4, 5.5_
  
  - [ ] 7.7 Write property test for reassignment history persistence
    - **Property 13: Reassignment History Persistence**
    - **Validates: Requirements 5.5**
  
  - [ ] 7.8 Write property test for reassignment history serialization
    - **Property 27: Reassignment History Serialization Round Trip**
    - **Validates: Requirements 14.1**

- [ ] 8. Implement appointment history API endpoints
  - [ ] 8.1 Create GET /api/appointments/{patient_id}/history endpoint
    - Query completed appointments with pagination
    - Include doctor details, clinical notes, prescriptions
    - Optimize query to load only recent 20 appointments initially
    - _Requirements: 7.2, 7.5, 7.6_
  
  - [ ] 8.2 Write property test for appointment history completeness
    - **Property 14: Appointment History Completeness**
    - **Validates: Requirements 7.2, 7.5, 7.6**
  
  - [ ] 8.3 Create POST /api/consultation/{consultation_id}/patient-ready endpoint
    - Record waiting_room_entered_at and patient_ready_at timestamps
    - Return current queue position
    - _Requirements: 11.1, 11.2_
  
  - [ ] 8.4 Write property tests for timestamp recording
    - **Property 21: Waiting Room Entry Timestamp Recording**
    - **Property 22: Patient Readiness Timestamp Recording**
    - **Validates: Requirements 11.1, 11.2**
  
  - [ ] 8.5 Create GET /api/doctor/{doctor_id}/validate-meet-link endpoint
    - Check if doctor has configured meet link
    - Validate link format
    - Return validation status
    - _Requirements: 9.1, 1.2_

- [ ] 9. Implement consultation flow enhancements
  - [ ] 9.1 Update consultation start endpoint to verify meet link for online appointments
    - Check doctor has valid meet link before allowing online consultation start
    - Snapshot meet link at consultation start
    - _Requirements: 1.2, 9.3_
  
  - [ ] 9.2 Write property test for meet link verification
    - **Property 1: Meet Link Verification for Online Consultations**
    - **Validates: Requirements 1.2**
  
  - [ ] 9.3 Write property test for in-person consultation bypass
    - **Property 3: In-Person Consultation Bypass**
    - **Validates: Requirements 1.5**
  
  - [ ] 9.4 Write property test for meet link snapshot preservation
    - **Property 19: Meet Link Snapshot Preservation**
    - **Validates: Requirements 9.3**
  
  - [ ] 9.5 Update consultation finish endpoint to advance queue
    - Automatically move to next patient
    - Update appointment status to completed
    - Make prescription available
    - _Requirements: 4.5, 4.6_
  
  - [ ] 9.6 Write property test for queue advancement
    - **Property 8: Queue Advancement on Consultation Completion**
    - **Validates: Requirements 4.5**
  
  - [ ] 9.7 Write property test for consultation completion side effects
    - **Property 9: Consultation Completion Side Effects**
    - **Validates: Requirements 4.6**

- [ ] 10. Checkpoint - Ensure all backend API tests pass
  - Run all backend tests including property tests
  - Test API endpoints manually using Postman or curl
  - Verify WebSocket connections work correctly
  - Ensure all tests pass, ask the user if questions arise

- [ ] 11. Implement frontend WebSocket client
  - [ ] 11.1 Create WebSocket hook for queue updates
    - Implement useQueueWebSocket hook with connection management
    - Handle reconnection with exponential backoff
    - Parse incoming messages and update state
    - _Requirements: 3.4, 12.1_
  
  - [ ] 11.2 Create WebSocket message type definitions
    - Define TypeScript interfaces for WSMessage, QueueUpdatePayload, YourTurnPayload, etc.
    - _Requirements: 3.4_
  
  - [ ] 11.3 Write unit tests for WebSocket hook
    - Test connection, disconnection, message handling, reconnection
    - _Requirements: 3.4, 12.1_

- [ ] 12. Implement Waiting Room Interface component
  - [ ] 12.1 Create WaitingRoomInterface component
    - Display current token, patient token, progress bar
    - Show estimated wait time countdown
    - Display doctor status indicator
    - Enable/disable "Join Google Meet" button based on position
    - _Requirements: 2.4, 6.1, 6.2, 6.3, 6.4, 6.7, 6.8_
  
  - [ ] 12.2 Integrate WebSocket updates into waiting room
    - Connect to WebSocket on component mount
    - Update UI in real-time based on queue updates
    - Handle "your turn" messages
    - _Requirements: 3.4, 6.5_
  
  - [ ] 12.3 Add message box for doctor communication
    - Implement message input and send functionality
    - Display message history
    - _Requirements: 6.6_
  
  - [ ] 12.4 Write unit tests for waiting room component
    - Test rendering with different queue states
    - Test button enable/disable logic
    - _Requirements: 2.4, 6.7_

- [ ] 13. Implement Notification Banner component
  - [ ] 13.1 Create NotificationBanner component
    - Display in-app notifications with priority styling
    - Request browser notification permissions
    - Play sound alerts for urgent notifications
    - Auto-dismiss low priority notifications
    - _Requirements: 3.5, 3.6_
  
  - [ ] 13.2 Integrate notification banner across patient pages
    - Add to patient dashboard, waiting room, appointment pages
    - Connect to notification service via WebSocket
    - _Requirements: 3.5_
  
  - [ ] 13.3 Write unit tests for notification banner
    - Test notification display, dismissal, sound alerts
    - _Requirements: 3.5, 3.6_

- [ ] 14. Implement Queue Position Indicator component
  - [ ] 14.1 Create QueuePositionIndicator component
    - Visual progress bar showing position in queue
    - Highlight patient position
    - Show current serving token
    - Animate position changes
    - _Requirements: 6.3_
  
  - [ ] 14.2 Write unit tests for queue position indicator
    - Test rendering with different positions
    - Test animation triggers
    - _Requirements: 6.3_

- [ ] 15. Implement Meet Link Configuration Modal
  - [ ] 15.1 Create MeetLinkConfigModal component
    - Input field for Google Meet link
    - Real-time validation with error messages
    - Save and update functionality
    - Show notification about patient alerts when updating
    - _Requirements: 1.1, 9.1_
  
  - [ ] 15.2 Integrate modal into doctor dashboard
    - Add "Configure Meet Link" button in settings
    - Add "Update Meet Link" button in consultation interface
    - _Requirements: 1.1, 1.3_
  
  - [ ] 15.3 Write unit tests for meet link modal
    - Test validation, save functionality, error display
    - _Requirements: 1.1, 9.1_

- [ ] 16. Implement Appointment History components
  - [ ] 16.1 Create AppointmentHistoryCard component
    - Display appointment details (doctor, date, mode)
    - Show clinical notes with markdown rendering
    - Display AI analysis
    - Show prescription with medications, dosage, frequency
    - Add download prescription as PDF button
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.8_
  
  - [ ] 16.2 Create PrescriptionViewer component
    - Render prescription in markdown format
    - Display medications table with dosage/frequency/duration
    - Show lifestyle advice and dietary instructions
    - Display warning signs and emergency instructions
    - _Requirements: 7.5, 7.6_
  
  - [ ] 16.3 Create appointment history page for patients
    - Fetch appointment history from API
    - Display list of AppointmentHistoryCard components
    - Implement pagination (load 20 at a time)
    - Add filters for date range and doctor
    - _Requirements: 7.1, 7.2_
  
  - [ ] 16.4 Write unit tests for appointment history components
    - Test rendering with different appointment data
    - Test pagination, filtering
    - _Requirements: 7.1, 7.2_

- [ ] 17. Update patient live tracking page
  - [ ] 17.1 Integrate WaitingRoomInterface into live tracking page
    - Replace or enhance existing live tracking with waiting room
    - Connect to WebSocket for real-time updates
    - Show join button based on queue position
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 17.2 Add notification banner to live tracking page
    - Display queue position notifications
    - Show "your turn" urgent notifications
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 17.3 Implement join appointment flow
    - Enable button when position <= 10
    - Show waiting room when clicked
    - Display meet link when consultation starts
    - _Requirements: 2.1, 2.2, 2.5_
  
  - [ ] 17.4 Write integration tests for live tracking page
    - Test full flow from waiting to joining
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 18. Update doctor consultation dashboard
  - [ ] 18.1 Add meet link validation check before starting online consultations
    - Check if doctor has configured meet link
    - Show configuration modal if not configured
    - Prevent starting online consultation without meet link
    - _Requirements: 1.2, 4.1, 4.2_
  
  - [ ] 18.2 Add "Update Meet Link" button to consultation interface
    - Show button above consultation interface
    - Open MeetLinkConfigModal when clicked
    - Notify patients after update
    - _Requirements: 1.3_
  
  - [ ] 18.3 Enhance consultation interface with queue controls
    - Display current patient's token number prominently
    - Add "Finish Consultation" button
    - Add "Skip Patient" (mark as no-show) button
    - Show next patient in queue preview
    - _Requirements: 4.3, 4.4, 5.1_
  
  - [ ] 18.4 Implement automatic queue advancement on finish
    - Call finish consultation API
    - Automatically load next patient
    - Update UI to show new patient details
    - _Requirements: 4.5_
  
  - [ ] 18.5 Write integration tests for doctor dashboard
    - Test consultation start with/without meet link
    - Test finish and advance to next patient
    - Test mark as no-show
    - _Requirements: 1.2, 4.1, 4.5, 5.1_

- [ ] 19. Implement no-show and reassignment flow
  - [ ] 19.1 Create missed appointment notification UI
    - Display "Appointment Missed" message
    - Show options: "Message Doctor" and "Re-assign Token Number"
    - _Requirements: 5.2, 5.3_
  
  - [ ] 19.2 Implement reassignment request flow
    - Call reassignment API endpoint
    - Display new token number and estimated wait time
    - Update patient's appointment view
    - _Requirements: 5.4, 5.5_
  
  - [ ] 19.3 Add reassignment history display
    - Show reassignment history in appointment details
    - Display old token, new token, timestamp, reason
    - _Requirements: 5.5_
  
  - [ ] 19.4 Write unit tests for reassignment flow
    - Test reassignment request, history display
    - _Requirements: 5.4, 5.5_

- [ ] 20. Checkpoint - Ensure all frontend tests pass
  - Run all frontend unit tests
  - Test components manually in browser
  - Verify WebSocket connections work in UI
  - Ensure all tests pass, ask the user if questions arise

- [ ] 21. Implement edge case handling
  - [ ] 21.1 Add connection status indicator to waiting room
    - Show "Connected", "Reconnecting", "Disconnected" status
    - Implement automatic reconnection with exponential backoff
    - _Requirements: 12.1_
  
  - [ ] 21.2 Write property test for queue position preservation
    - **Property 24: Queue Position Preservation Across Disconnections**
    - **Validates: Requirements 12.1**
  
  - [ ] 21.3 Implement late join allowance logic
    - Allow patient to join if they arrive before no-show marking
    - Check appointment status before blocking join
    - _Requirements: 12.6_
  
  - [ ] 21.4 Write property test for late join allowance
    - **Property 26: Late Join Allowance**
    - **Validates: Requirements 12.6**
  
  - [ ] 21.5 Add doctor offline detection and notification
    - Detect doctor disconnection via WebSocket
    - Notify patient with options to wait or reschedule
    - _Requirements: 12.2_
  
  - [ ] 21.6 Write unit tests for edge case scenarios
    - Test connection drops, late joins, doctor offline
    - _Requirements: 12.1, 12.2, 12.6_

- [ ] 22. Implement caching and performance optimizations
  - [ ] 22.1 Add Redis caching for doctor settings
    - Cache meet links with 5-minute TTL
    - Implement cache invalidation on update
    - _Requirements: 9.4, 13.2_
  
  - [ ] 22.2 Optimize appointment history queries
    - Add database indexes for common queries
    - Implement pagination with cursor-based approach
    - Lazy load prescription PDFs
    - _Requirements: 13.3, 13.4_
  
  - [ ] 22.3 Implement batch notification sending
    - Batch database updates for multiple patients
    - Use bulk insert for notifications
    - _Requirements: 10.5, 13.5_
  
  - [ ] 22.4 Write performance tests
    - Test with 100 concurrent patients
    - Measure queue calculation time, notification delivery time
    - _Requirements: 13.1, 13.2, 13.3_

- [ ] 23. Add monitoring and logging
  - [ ] 23.1 Add logging for queue operations
    - Log all queue position changes
    - Log all token assignments and reassignments
    - Log all notification deliveries
    - _Requirements: 8.1, 5.4, 3.1_
  
  - [ ] 23.2 Add logging for WebSocket events
    - Log connection/disconnection events
    - Log message delivery failures
    - Log heartbeat failures
    - _Requirements: 3.4, 12.1_
  
  - [ ] 23.3 Add logging for meet link operations
    - Log all meet link updates
    - Log validation failures
    - Log patient notification counts
    - _Requirements: 1.3, 9.1, 9.2_
  
  - [ ] 23.4 Write unit tests for logging
    - Verify logs are generated for key operations
    - _Requirements: 8.1, 3.4, 1.3_

- [ ] 24. Integration testing and bug fixes
  - [ ] 24.1 Test complete patient flow end-to-end
    - Book appointment → receive token → join waiting room → receive notifications → join consultation → view prescription
    - _Requirements: All patient-facing requirements_
  
  - [ ] 24.2 Test complete doctor flow end-to-end
    - Configure meet link → start consultation → finish → advance to next patient → update meet link
    - _Requirements: All doctor-facing requirements_
  
  - [ ] 24.3 Test no-show and reassignment flow
    - Patient misses appointment → receives notification → requests reassignment → gets new token
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 24.4 Test concurrent operations
    - Multiple patients joining simultaneously
    - Multiple doctors conducting consultations
    - Concurrent token assignments
    - _Requirements: 8.3, 12.3_
  
  - [ ] 24.5 Write property test for concurrent join ordering
    - **Property 25: Concurrent Join Ordering**
    - **Validates: Requirements 12.3**
  
  - [ ] 24.6 Fix any bugs discovered during integration testing
    - Address edge cases
    - Fix race conditions
    - Improve error handling

- [ ] 25. Final checkpoint - Complete system verification
  - Run all tests (unit, property, integration)
  - Test with run_app.bat to ensure application starts correctly
  - Verify all features work as specified
  - Check performance meets targets
  - Ensure all tests pass, ask the user if questions arise

## Notes

- All tasks are required for comprehensive implementation with full test coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and integration points
- The application is run using run_app.bat, so ensure all changes are compatible with this startup method
- WebSocket implementation should gracefully fall back to polling if WebSocket connections fail
- All timestamps should be stored in UTC and converted to local timezone in the frontend
- Meet link validation should be strict to prevent invalid links from being saved
- Queue position calculations must handle edge cases like empty queues and single patients
- Notification delivery should be resilient to network failures with retry logic
