# Requirements Document

## Introduction

This document specifies the requirements for an enhanced real-time appointment queue system that builds upon the existing appointment booking infrastructure. The system will provide real-time queue notifications, Google Meet link management, waiting room functionality, appointment history tracking, and no-show handling to improve the consultation experience for both doctors and patients.

## Glossary

- **System**: The real-time appointment queue system
- **Doctor**: A medical professional who conducts consultations
- **Patient**: A user seeking medical consultation
- **Queue_Manager**: Component responsible for managing appointment queue positions
- **Notification_Service**: Component responsible for sending real-time notifications
- **Waiting_Room**: Interface where patients wait before their consultation
- **Token_Number**: Sequential number assigned to patient for queue position
- **Meet_Link**: Google Meet URL configured by doctor for online consultations
- **Consultation**: Active medical session between doctor and patient
- **No_Show**: Status when patient fails to join consultation at their turn
- **Queue_Position**: Numerical difference between current serving token and patient's token
- **DoctorSettings**: Database model storing doctor configuration including meet link
- **Appointment**: Database record of scheduled consultation
- **Prescription**: Medical document containing medications and instructions

## Requirements

### Requirement 1: Google Meet Link Configuration

**User Story:** As a doctor, I want to configure my Google Meet link in profile settings, so that I can conduct online consultations with patients.

#### Acceptance Criteria

1. THE System SHALL provide a settings interface for doctors to configure their Google Meet link
2. WHEN a doctor attempts to start an online consultation without a configured meet link, THEN THE System SHALL prevent the consultation from starting and display a configuration prompt
3. WHEN a doctor updates their meet link during an active session, THEN THE Notification_Service SHALL notify the next 10 patients in the waitlist
4. THE System SHALL store the meet link in the DoctorSettings model custom_meet_link field
5. WHEN a doctor starts an in-person consultation, THE System SHALL allow consultation to proceed without meet link validation

### Requirement 2: Patient Join Controls

**User Story:** As a patient, I want to join my appointment only when my turn is near, so that I don't waste time waiting unnecessarily.

#### Acceptance Criteria

1. WHEN a patient's queue position is greater than 10, THEN THE System SHALL disable the "Join Appointment" button
2. WHEN a patient's queue position is 10 or less, THEN THE System SHALL enable the "Join Appointment" button
3. WHEN a patient clicks "Join Appointment", THEN THE System SHALL display the waiting room interface
4. THE Waiting_Room SHALL display the current token being served, patient's token number, and estimated wait time
5. WHEN the doctor starts consultation with the patient, THEN THE System SHALL display a "Join Meet Immediately" message with the meet link

### Requirement 3: Real-Time Queue Notifications

**User Story:** As a patient, I want to receive timely notifications about my queue position, so that I know when to be ready for my consultation.

#### Acceptance Criteria

1. WHEN a patient's queue position is greater than 10, THEN THE Notification_Service SHALL send notifications stating "Currently token #X is ongoing, you are Y positions away, stay alert"
2. WHEN a patient's queue position is between 1 and 10 inclusive, THEN THE Notification_Service SHALL send frequent notifications stating "Stay ready! You're X positions away"
3. WHEN a patient's token number is reached, THEN THE Notification_Service SHALL send an urgent notification stating "Your number has come! Join quickly!"
4. THE Notification_Service SHALL deliver notifications through WebSocket or polling every 5-10 seconds
5. THE System SHALL request browser notification permissions and display in-app notification banners
6. WHEN critical notifications are sent, THE System SHALL play sound alerts

### Requirement 4: Doctor Consultation Flow

**User Story:** As a doctor, I want a streamlined consultation interface with pre-checks and controls, so that I can efficiently manage patient consultations.

#### Acceptance Criteria

1. WHEN a doctor attempts to start an online consultation, THE System SHALL verify the doctor has a configured meet link
2. IF the meet link is not configured, THEN THE System SHALL display a modal prompting "Please configure your Google Meet link in profile settings"
3. THE System SHALL display the current patient's token number prominently during consultation
4. THE System SHALL provide "Finish Consultation" and "Skip Patient" buttons during active consultations
5. WHEN a doctor finishes a consultation, THEN THE Queue_Manager SHALL automatically move to the next patient in queue
6. WHEN a consultation is completed, THE System SHALL update the appointment status to "completed" and make the prescription available to the patient

### Requirement 5: No-Show and Late Arrival Handling

**User Story:** As a doctor, I want to handle patients who don't join on time, so that I can maintain an efficient consultation schedule.

#### Acceptance Criteria

1. WHEN a patient's turn arrives and the doctor clicks "Finish Consultation" without the patient joining, THEN THE System SHALL mark the appointment as "No Show"
2. WHEN an appointment is marked as "No Show", THEN THE Notification_Service SHALL send a notification stating "You were late. Appointment Missed!"
3. THE System SHALL provide options to "Message Doctor" or "Re-assign Token Number" after a missed appointment
4. WHEN a patient requests re-assignment, THEN THE Queue_Manager SHALL assign a new token number equal to the current maximum queue number plus one
5. THE System SHALL record reassignment history in the appointment record

### Requirement 6: Waiting Room Interface

**User Story:** As a patient, I want a clear waiting room interface with live updates, so that I know exactly when to join my consultation.

#### Acceptance Criteria

1. THE Waiting_Room SHALL display the current token being served in large format
2. THE Waiting_Room SHALL highlight the patient's token number
3. THE Waiting_Room SHALL show a progress bar indicating position in queue
4. THE Waiting_Room SHALL display an estimated wait time countdown
5. THE Waiting_Room SHALL update status every 10 seconds
6. THE Waiting_Room SHALL provide a message box to communicate with the doctor
7. THE Waiting_Room SHALL display a "Join Google Meet" button that is enabled only when it is the patient's turn
8. THE Waiting_Room SHALL show doctor status indicator (Available/Busy/On Break)

### Requirement 7: Appointment History and Prescriptions

**User Story:** As a patient, I want to view my past appointments with all clinical details, so that I can track my medical history and follow prescribed treatments.

#### Acceptance Criteria

1. THE System SHALL provide an "Appointment History" section displaying all completed appointments
2. FOR each appointment, THE System SHALL display doctor's name, specialization, date, time, and consultation mode
3. THE System SHALL display doctor's clinical notes in PDF or Markdown format
4. THE System SHALL display AI medical report analysis in PDF or Markdown format
5. THE System SHALL display prescribed medications with dosage, frequency, and duration
6. THE System SHALL display lifestyle advice, dietary instructions, warning signs, and emergency instructions
7. THE System SHALL provide a separate "Course Advised by Doctor" section for prescriptions
8. THE System SHALL allow patients to download prescriptions as PDF files

### Requirement 8: Queue Position Calculation

**User Story:** As a system administrator, I want accurate queue position calculations, so that patients receive correct notifications and wait time estimates.

#### Acceptance Criteria

1. THE Queue_Manager SHALL calculate queue position as the difference between the patient's token number and the current serving token number
2. WHEN the current serving token changes, THE Queue_Manager SHALL recalculate positions for all waiting patients
3. THE Queue_Manager SHALL ensure no duplicate token numbers exist for the same doctor on the same day
4. WHEN a patient is reassigned, THE Queue_Manager SHALL update the queue position for all affected patients
5. THE Queue_Manager SHALL maintain queue integrity during concurrent operations

### Requirement 9: Meet Link Validation and Updates

**User Story:** As a doctor, I want to update my Google Meet link during consultations, so that I can handle technical issues or use different meeting rooms.

#### Acceptance Criteria

1. THE System SHALL validate that a meet link follows the Google Meet URL format
2. WHEN a doctor updates their meet link, THE System SHALL store the update timestamp in meet_link_updated_at
3. WHEN a meet link is updated during active consultations, THE System SHALL snapshot the meet link used for each consultation
4. THE System SHALL cache doctor settings to reduce database queries
5. WHEN a meet link validation fails, THE System SHALL display an error message with the validation reason

### Requirement 10: Notification Persistence and Delivery

**User Story:** As a patient, I want to see all my notifications even if I miss them in real-time, so that I can catch up on important updates.

#### Acceptance Criteria

1. THE System SHALL store all notifications in a Notifications table with patient_id, appointment_id, type, message, read status, and timestamp
2. THE Notification_Service SHALL support notification types: position_update, your_turn, missed, and doctor_status
3. WHEN a notification is displayed to the patient, THE System SHALL mark it as read
4. THE System SHALL provide an API endpoint to retrieve all notifications for an appointment
5. THE Notification_Service SHALL batch notification sending for multiple patients to optimize performance

### Requirement 11: Consultation Timing and Tracking

**User Story:** As a system administrator, I want to track consultation timings, so that I can analyze appointment efficiency and generate reports.

#### Acceptance Criteria

1. THE System SHALL record waiting_room_entered_at timestamp when a patient joins the waiting room
2. THE System SHALL record patient_ready_at timestamp when a patient indicates readiness
3. THE System SHALL record consultation start time when the doctor begins the consultation
4. THE System SHALL record consultation end time when the doctor finishes the consultation
5. THE System SHALL calculate and store the total consultation duration

### Requirement 12: Edge Case Handling

**User Story:** As a system administrator, I want the system to handle edge cases gracefully, so that the consultation flow remains uninterrupted.

#### Acceptance Criteria

1. WHEN a patient closes the app during waiting, THE System SHALL preserve their queue position and resume updates when they return
2. WHEN a doctor goes offline mid-consultation, THE System SHALL notify the patient and provide options to wait or reschedule
3. WHEN multiple patients attempt to join simultaneously, THE Queue_Manager SHALL enforce strict ordering based on token numbers
4. WHEN network failures occur, THE System SHALL queue notifications for delivery when connection is restored
5. WHEN a doctor forgets to finish a consultation, THE System SHALL send a reminder after 60 minutes of inactivity
6. WHEN a patient joins late but before being marked no-show, THE System SHALL allow them to proceed with the consultation
7. WHEN a meet link becomes invalid during a session, THE System SHALL notify the doctor to update the link

### Requirement 13: Performance Optimization

**User Story:** As a system administrator, I want the system to perform efficiently under load, so that real-time updates remain responsive.

#### Acceptance Criteria

1. THE System SHALL use WebSocket connections or polling with a maximum interval of 10 seconds for real-time updates
2. THE System SHALL cache doctor settings including meet links with a time-to-live of 5 minutes
3. THE System SHALL optimize appointment history queries to load only the most recent 20 appointments initially
4. THE System SHALL lazy load prescription PDFs only when requested by the patient
5. THE System SHALL batch database updates for queue position changes affecting multiple patients

### Requirement 14: Data Serialization and Storage

**User Story:** As a developer, I want consistent data serialization for complex objects, so that data integrity is maintained across the system.

#### Acceptance Criteria

1. WHEN storing reassignment history, THE System SHALL encode it as JSON in the reassignment_history field
2. WHEN retrieving reassignment history, THE System SHALL decode the JSON into structured objects
3. THE System SHALL validate JSON structure before storage to prevent corruption
4. WHEN storing notification data, THE System SHALL ensure all required fields are present
5. THE System SHALL handle timezone conversions correctly for all timestamp fields
